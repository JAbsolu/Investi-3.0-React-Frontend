import { ref, set, get, child } from "firebase/database";
import { database } from "../firebaseConfig";
const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";


//-------- get date from 1 year ago -------------
export const getDate365DaysAgo = () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 365);

    // Format to YYYY-MM-DD
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const day = String(pastDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// get market time
export const isStockMarketOpen= (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = date.getHours(); // 0 - 23
  
    const isWeekend = day === 0 || day === 6;
    const isMarketHours = hours >= 9 && hours < 17; // 9AM to 5PM
    return !isWeekend && isMarketHours;
}

// get today's date
export const getCurrentDate = () => {
    const today = new Date();
  
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}

  /*  get candlesticks */
export const getCandleSticks = async(ticker, startDate, setCandleSticksData,formatDateToMMDDYY, formatTimeToHHMMAMPM) => {
    const url = `${API_URL}/tiingo/candlestics?ticker=${ticker}&startDate=${startDate}&resampleFreq=4hour`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      // console.log("Status", response.status, result.message);
      return;
    }

    const formattedData = result.data?.map(item => ({
        time: formatTimeToHHMMAMPM(item.date),
        date: formatDateToMMDDYY(item.date),
        open: item.open.toFixed(2),
        high: item.high.toFixed(2),
        low: item.low.toFixed(2),
        close: item.close.toFixed(2),
        value: item.close, // for line chart
        originalDate: new Date(item.date) // Keep original date for sorting
      }))
      .sort((a, b) => a.originalDate - b.originalDate); // Sort by actual date

    setCandleSticksData(formattedData);
    // console.log("Formatted candle sticks", formattedData);
}
  