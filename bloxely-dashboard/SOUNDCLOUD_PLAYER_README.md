# SoundCloud Player Widget

A minimal, standalone SoundCloud player widget built for the Bloxely dashboard. This widget provides clean, custom controls without SoundCloud's default branding.

## Features

✅ **Clean, minimal design** - No SoundCloud branding or headers  
✅ **Essential playback controls** - Play/pause, seek, volume control  
✅ **Track information display** - Title, artist, and album artwork  
✅ **Mini mode** - Compact player for smaller spaces  
✅ **Dark/light theme support** - Automatically adapts to your theme  
✅ **Responsive design** - Works on desktop and mobile  
✅ **TypeScript support** - Fully typed for better development experience  

## Usage

### Basic Usage

```tsx
import { SoundCloudPlayerWidget } from './components/widgets/SoundCloudPlayerWidget';

// Using a SoundCloud track URL
<SoundCloudPlayerWidget 
  trackUrl="https://soundcloud.com/artist/track-name"
/>

// Using a track ID
<SoundCloudPlayerWidget 
  trackId="123456789"
/>

// Mini mode for compact layouts
<SoundCloudPlayerWidget 
  trackUrl="https://soundcloud.com/artist/track-name"
  miniMode={true}
/>
```

### In Bloxely Dashboard

The widget is automatically registered in the dashboard and can be added through the widget selector. When added to the dashboard, it provides a configuration interface to:

1. Enter a SoundCloud track URL
2. Enter a track ID (alternative to URL)
3. Toggle mini mode
4. Configure the widget title

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trackUrl` | `string` | `''` | Full SoundCloud track URL |
| `trackId` | `string` | `''` | SoundCloud track ID (alternative to URL) |
| `miniMode` | `boolean` | `false` | Enable compact player mode |
| `className` | `string` | `''` | Additional CSS classes |

### Getting SoundCloud URLs

1. Go to any SoundCloud track
2. Copy the URL from your browser (e.g., `https://soundcloud.com/artist/track-name`)
3. Paste it into the widget configuration

### Mini Mode vs Full Mode

**Full Mode:**
- Shows album artwork (when available)
- Displays track title and artist
- Full-size controls with volume slider
- Time display (current/total)

**Mini Mode:**
- Compact layout with just essential controls
- Play/pause button and progress bar
- Current time display
- Perfect for smaller widget sizes

## Technical Details

### Dependencies

The widget uses SoundCloud's Widget API, which is loaded automatically when needed. No additional dependencies are required.

### Browser Compatibility

- Modern browsers with ES6+ support
- Requires JavaScript enabled
- Works with SoundCloud's embed restrictions

### Performance

- Lazy loads SoundCloud API only when needed
- Minimal DOM manipulation
- Efficient state management
- No memory leaks with proper cleanup

## Styling

The widget uses Tailwind CSS classes and automatically adapts to your theme:

- **Light theme**: Light backgrounds with dark text
- **Dark theme**: Dark backgrounds with light text
- **Responsive**: Adjusts layout for mobile devices

## Limitations

- Requires SoundCloud tracks to be publicly available
- Subject to SoundCloud's embed policies
- Cannot play private or restricted tracks
- Requires internet connection for playback

## Examples

### Dashboard Integration

```tsx
// The widget integrates seamlessly with the Bloxely dashboard
// Add it through the widget selector and configure:

{
  type: 'soundcloud-player',
  content: {
    trackUrl: 'https://soundcloud.com/chillhop/peaceful-morning',
    miniMode: false
  },
  config: {
    title: 'Chill Music'
  }
}
```

### Standalone Usage

```tsx
// Use outside the dashboard for custom implementations
<div className="w-full max-w-md mx-auto">
  <SoundCloudPlayerWidget 
    trackUrl="https://soundcloud.com/ambient-music/forest-sounds"
    className="rounded-lg shadow-lg"
  />
</div>
```

## Troubleshooting

**Widget shows "Loading track..." indefinitely:**
- Check that the SoundCloud URL is valid and public
- Ensure the track allows embedding
- Check browser console for any errors

**No sound playing:**
- Check volume settings in both the widget and browser
- Ensure the track is not restricted in your region
- Try a different track to isolate the issue

**Widget not responsive:**
- Ensure proper container sizing
- Check for CSS conflicts
- Verify Tailwind CSS is loaded

## Support

For issues or feature requests, please check the existing codebase or create an issue in the project repository.