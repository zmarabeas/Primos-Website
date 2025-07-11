// Import removed due to type issues - using any for now

interface HoursStatus {
  isOpen: boolean;
  status: 'open' | 'closed' | 'closing-soon' | 'opening-soon';
  message: string;
  nextChange?: {
    time: string;
    action: 'opens' | 'closes';
  };
}

/**
 * Check if the restaurant is currently open based on current time and business hours
 */
export function getRestaurantStatus(restaurantInfo: any): HoursStatus {
  try {
    const now = new Date();
    const timezone = (restaurantInfo as any).timezone || 'America/Detroit';
    
    // Get current time in restaurant's timezone
    const currentTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    
    // Get current day name
    const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentTime).toLowerCase();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Get today's hours
    const todayHours = restaurantInfo.hours[currentDay as keyof typeof restaurantInfo.hours];
    
    if (!todayHours || (todayHours as any).closed) {
      return {
        isOpen: false,
        status: 'closed',
        message: 'Closed today'
      };
    }

    // Convert hours to minutes for easier comparison
    const [openHour, openMinute] = (todayHours as any).open.split(':').map(Number);
    const [closeHour, closeMinute] = (todayHours as any).close.split(':').map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;

    // Check if currently open
    const isCurrentlyOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
    
    if (isCurrentlyOpen) {
      // Check if closing soon (within 30 minutes)
      const minutesUntilClose = closeTimeInMinutes - currentTimeInMinutes;
      if (minutesUntilClose <= 30) {
        const closeTime = formatTime(closeHour, closeMinute);
        return {
          isOpen: true,
          status: 'closing-soon',
          message: `Closing soon at ${closeTime}`,
          nextChange: {
            time: closeTime,
            action: 'closes'
          }
        };
      }
      
      return {
        isOpen: true,
        status: 'open',
        message: 'Open now'
      };
    } else {
      // Restaurant is closed - check if opening soon or closed for the day
      if (currentTimeInMinutes < openTimeInMinutes) {
        // Before opening today
        const minutesUntilOpen = openTimeInMinutes - currentTimeInMinutes;
        const openTime = formatTime(openHour, openMinute);
        
        if (minutesUntilOpen <= 60) {
          return {
            isOpen: false,
            status: 'opening-soon',
            message: `Opening soon at ${openTime}`,
            nextChange: {
              time: openTime,
              action: 'opens'
            }
          };
        }
        
        return {
          isOpen: false,
          status: 'closed',
          message: `Closed - Opens at ${openTime}`,
          nextChange: {
            time: openTime,
            action: 'opens'
          }
        };
      } else {
        // After closing today - check tomorrow's hours
        const tomorrow = new Date(currentTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(tomorrow).toLowerCase();
        const tomorrowHours = restaurantInfo.hours[tomorrowDay as keyof typeof restaurantInfo.hours];
        
        if (tomorrowHours && !(tomorrowHours as any).closed) {
          const [tomorrowOpenHour, tomorrowOpenMinute] = (tomorrowHours as any).open.split(':').map(Number);
          const tomorrowOpenTime = formatTime(tomorrowOpenHour, tomorrowOpenMinute);
          
          return {
            isOpen: false,
            status: 'closed',
            message: `Closed - Opens tomorrow at ${tomorrowOpenTime}`,
            nextChange: {
              time: tomorrowOpenTime,
              action: 'opens'
            }
          };
        }
        
        return {
          isOpen: false,
          status: 'closed',
          message: 'Closed'
        };
      }
    }
  } catch (error) {
    console.error('Error calculating restaurant status:', error);
    return {
      isOpen: false,
      status: 'closed',
      message: 'Hours unavailable'
    };
  }
}

/**
 * Format time from 24-hour to 12-hour format
 */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute < 10 ? `0${minute}` : minute.toString();
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Get formatted hours for display
 */
export function getFormattedHours(restaurantInfo: any): Record<string, string> {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const formatted: Record<string, string> = {};
  
  days.forEach(day => {
    const hours = restaurantInfo.hours[day as keyof typeof restaurantInfo.hours];
    if (!hours || (hours as any).closed) {
      formatted[day] = 'Closed';
    } else {
      const [openHour, openMinute] = (hours as any).open.split(':').map(Number);
      const [closeHour, closeMinute] = (hours as any).close.split(':').map(Number);
      const openTime = formatTime(openHour, openMinute);
      const closeTime = formatTime(closeHour, closeMinute);
      formatted[day] = `${openTime} - ${closeTime}`;
    }
  });
  
  return formatted;
}