/* get date from 1 year ago */
export const getStartDay = () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 180);
  
    // Format to YYYY-MM-DD
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const day = String(pastDate.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
};

export const formatDateToMMDDYY = (dateString) => {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of year
    
    return `${month} ${day} ${year}`;
}

export const formatTimeToHHMMAMPM = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // handle 0 (midnight becomes 12)
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutes} ${ampm}`;
} 