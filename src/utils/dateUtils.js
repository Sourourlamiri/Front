/**
 * Formats a date string for the API in YYYY-MM-DD format
 * @param {string|Date} date - Date to format
 * @returns {string|null} Formatted date string or null if invalid
 */
export const formatDateForAPI = (date) => { //verfier si la date est valide selon le format YYYY-MM-DD back-end
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) return null;
    
    // Format as YYYY-MM-DD
    return dateObj.toISOString().split('T')[0];
  } catch (err) {
    console.error("Error formatting date:", err);
    return null;
  }
};

/**
 * Formats a date from the API for display in locale format
 * @param {string|Date} date - Date to format 
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) return '';
    
    // Format in locale format (e.g., "01/01/2023")
    return dateObj.toLocaleDateString('fr-FR');
  } catch (err) {
    console.error("Error formatting date for display:", err);
    return '';
  }
};

/**
 * Verfier si une date est valide
 * @param {string} dateStr - Date string to validate
 * @param {boolean} allowFuture - Allow future dates
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (dateStr, allowFuture = false) => {
  if (!dateStr) return false;
  
  try {
    const date = new Date(dateStr);
    
    // Check if valid date
    if (isNaN(date.getTime())) return false;
    
    // Check if not in future (unless allowed)
    if (!allowFuture && date > new Date()) return false;
    
    return true;
  } catch (err) {
    return false;
  }
}; 