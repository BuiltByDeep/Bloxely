#!/usr/bin/env node

const { readFileSync, statSync } = require('fs');
const { join } = require('path');
const { gzipSync } = require('zlib');

// __dirname is available in CommonJS

const DIST_DIR = join(__dirname, '../dist');
const ASSETS_DIR = join(DIST_DIR, 'assets');

// Bundle size thresholds (in KB)
const THRESHOLDS = {
  js: {
    warning: 300,
    error: 500,
  },
  css: {
    warning: 50,
    error: 100,
  },
  total: {
    warning: 350,
    error: 600,
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath);
    const stats = statSync(filePath);
    const gzipped = gzipSync(content);
    
    return {
      size: stats.size,
      gzipped: gzipped.length,
      sizeFormatted: formatBytes(stats.size),
      gzippedFormatted: formatBytes(gzipped.length),
    };
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error.message);
    return null;
  }
}

function getAssetFiles() {
  try {
    const { readdirSync } = require('fs');
    const files = readdirSync(ASSETS_DIR);
    
    return {
      js: files.filter(file => file.endsWith('.js')),
      css: files.filter(file => file.endsWith('.css')),
    };
  } catch (error) {
    console.error('Error reading assets directory:', error.message);
    return { js: [], css: [] };
  }
}

function checkThreshold(size, thresholds, type) {
  const sizeKB = size / 1024;
  
  if (sizeKB > thresholds.error) {
    return { level: 'error', message: `${type} bundle size (${formatBytes(size)}) exceeds error threshold (${thresholds.error}KB)` };
  } else if (sizeKB > thresholds.warning) {
    return { level: 'warning', message: `${type} bundle size (${formatBytes(size)}) exceeds warning threshold (${thresholds.warning}KB)` };
  }
  
  return { level: 'ok', message: `${type} bundle size (${formatBytes(size)}) is within acceptable limits` };
}

async function analyzeBundles() {
  console.log('🔍 Analyzing bundle sizes...\n');
  
  const assets = getAssetFiles();
  let totalSize = 0;
  let totalGzipped = 0;
  const issues = [];

  // Analyze JavaScript files
  console.log('📦 JavaScript Files:');
  for (const jsFile of assets.js) {
    const filePath = join(ASSETS_DIR, jsFile);
    const analysis = analyzeFile(filePath);
    
    if (analysis) {
      console.log(`  ${jsFile}: ${analysis.sizeFormatted} (${analysis.gzippedFormatted} gzipped)`);
      totalSize += analysis.size;
      totalGzipped += analysis.gzipped;
      
      const threshold = checkThreshold(analysis.size, THRESHOLDS.js, 'JavaScript');
      if (threshold.level !== 'ok') {
        issues.push(threshold);
      }
    }
  }

  // Analyze CSS files
  console.log('\n🎨 CSS Files:');
  for (const cssFile of assets.css) {
    const filePath = join(ASSETS_DIR, cssFile);
    const analysis = analyzeFile(filePath);
    
    if (analysis) {
      console.log(`  ${cssFile}: ${analysis.sizeFormatted} (${analysis.gzippedFormatted} gzipped)`);
      totalSize += analysis.size;
      totalGzipped += analysis.gzipped;
      
      const threshold = checkThreshold(analysis.size, THRESHOLDS.css, 'CSS');
      if (threshold.level !== 'ok') {
        issues.push(threshold);
      }
    }
  }

  // Total analysis
  console.log('\n📊 Total Bundle Size:');
  console.log(`  Combined: ${formatBytes(totalSize)} (${formatBytes(totalGzipped)} gzipped)`);
  
  const totalThreshold = checkThreshold(totalSize, THRESHOLDS.total, 'Total');
  if (totalThreshold.level !== 'ok') {
    issues.push(totalThreshold);
  }

  // Report issues
  if (issues.length > 0) {
    console.log('\n⚠️  Bundle Size Issues:');
    issues.forEach(issue => {
      const icon = issue.level === 'error' ? '❌' : '⚠️';
      console.log(`  ${icon} ${issue.message}`);
    });
  } else {
    console.log('\n✅ All bundle sizes are within acceptable limits');
  }

  // Performance recommendations
  console.log('\n💡 Performance Recommendations:');
  
  if (totalSize > 200 * 1024) { // 200KB
    console.log('  • Consider code splitting for better loading performance');
  }
  
  if (assets.js.length > 1) {
    console.log('  • Multiple JS files detected - ensure proper chunking strategy');
  }
  
  if (assets.css.length > 1) {
    console.log('  • Multiple CSS files detected - consider combining if possible');
  }
  
  const compressionRatio = totalGzipped / totalSize;
  if (compressionRatio > 0.7) {
    console.log('  • Poor compression ratio - consider optimizing assets');
  } else {
    console.log('  • Good compression ratio achieved');
  }

  // Exit with error code if there are critical issues
  const hasErrors = issues.some(issue => issue.level === 'error');
  if (hasErrors) {
    console.log('\n❌ Bundle analysis failed due to size threshold violations');
    process.exit(1);
  } else {
    console.log('\n✅ Bundle analysis completed successfully');
  }
}

// Run the analysis
analyzeBundles().catch(error => {
  console.error('Bundle analysis failed:', error);
  process.exit(1);
});