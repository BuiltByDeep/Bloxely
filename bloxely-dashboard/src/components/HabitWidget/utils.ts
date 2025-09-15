// Generate date range for the last N days
export const generateDateRange = (days: number): string[] => {
  const dates = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

// Get today's date string in YYYY-MM-DD format
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Calculate current streak for a habit
export const calculateStreak = (completions: Record<string, number>): number => {
  const completionDates = Object.keys(completions)
    .filter(date => completions[date] > 0)
    .sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

  if (completionDates.length === 0) return 0;

  let streak = 0;
  const today = getTodayString();
  let currentDate = today;

  // Check if today is completed, if not start from yesterday
  if (!completionDates.includes(today)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    currentDate = yesterday.toISOString().split('T')[0];
  }

  // Count consecutive days backwards from current date
  while (completionDates.includes(currentDate)) {
    streak++;
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    currentDate = prevDate.toISOString().split('T')[0];
  }

  return streak;
};

// Calculate completion percentage for a date range
export const calculateCompletionPercentage = (
  completions: Record<string, number>,
  dateRange: string[]
): number => {
  const completedDays = dateRange.filter(date => completions[date] > 0).length;
  return Math.round((completedDays / dateRange.length) * 100);
};

// Get the most active day of the week
export const getMostActiveDay = (completions: Record<string, number>): string => {
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday

  Object.entries(completions).forEach(([date, level]) => {
    if (level > 0) {
      const dayOfWeek = new Date(date).getDay();
      dayCounts[dayOfWeek]++;
    }
  });

  const maxCount = Math.max(...dayCounts);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return maxCount > 0 ? dayNames[dayCounts.indexOf(maxCount)] : 'No data';
};

// Calculate total effort points
export const calculateTotalEffort = (completions: Record<string, number>): number => {
  return Object.values(completions).reduce((total, level) => total + level, 0);
};

// Get the best streak from completions
export const getBestStreak = (completions: Record<string, number>): number => {
  const completionDates = Object.keys(completions)
    .filter(date => completions[date] > 0)
    .sort((a, b) => a.localeCompare(b)); // Sort ascending

  if (completionDates.length === 0) return 0;

  let bestStreak = 1;
  let currentStreak = 1;
  let lastDate = new Date(completionDates[0]);

  for (let i = 1; i < completionDates.length; i++) {
    const currentDate = new Date(completionDates[i]);
    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
    } else {
      bestStreak = Math.max(bestStreak, currentStreak);
      currentStreak = 1;
    }

    lastDate = currentDate;
  }

  return Math.max(bestStreak, currentStreak);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Get day of week abbreviation
export const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};

// Check if a date is today
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

// Check if a date is in the future
export const isFutureDate = (dateString: string): boolean => {
  return dateString > getTodayString();
};

// Check if a date is a weekend
export const isWeekend = (dateString: string): boolean => {
  const day = new Date(dateString).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

// Get effort level description
export const getEffortLevelDescription = (level: number): string => {
  const descriptions = [
    'No activity',
    'Minimal effort',
    'Moderate effort',
    'Good effort',
    'Excellent effort'
  ];
  return descriptions[level] || descriptions[0];
};

// Generate habit statistics
export const generateHabitStats = (completions: Record<string, number>) => {
  const totalDays = Object.keys(completions).length;
  const completedDays = Object.values(completions).filter(level => level > 0).length;
  const currentStreak = calculateStreak(completions);
  const bestStreak = getBestStreak(completions);
  const totalEffort = calculateTotalEffort(completions);
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const averageEffort = completedDays > 0 ? Math.round(totalEffort / completedDays * 10) / 10 : 0;

  return {
    totalDays,
    completedDays,
    currentStreak,
    bestStreak,
    totalEffort,
    completionRate,
    averageEffort
  };
};