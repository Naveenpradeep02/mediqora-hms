/**
 * Utility functions for clean, human-readable date & time formatting across Shree Ram Homeo
 */

export const formatDate = (dateStr, includeDayName = false) => {
  if (!dateStr) return 'N/A';
  
  // Extract YYYY-MM-DD portion cleanly without timezone offset shift
  const cleanStr = String(dateStr).split('T')[0].trim();
  const parts = cleanStr.split('-');
  
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (months[monthIdx] && !isNaN(day) && !isNaN(year)) {
      const formattedDay = day < 10 ? `0${day}` : `${day}`;
      if (includeDayName) {
        const d = new Date(Date.UTC(year, monthIdx, day));
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[d.getUTCDay()];
        return `${dayName}, ${formattedDay} ${months[monthIdx]} ${year}`;
      }
      return `${formattedDay} ${months[monthIdx]} ${year}`;
    }
  }
  return cleanStr;
};

export const formatAppointmentDateTime = (dateStr, timeStr) => {
  const formattedDate = formatDate(dateStr);
  if (!timeStr) return formattedDate;
  return `${formattedDate} @ ${timeStr}`;
};
