import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateToMMDDYY, formatTimeToHHMMAMPM, getStartDay } from '../util';
import { green, teal } from '@mui/material/colors';
import { useMediaQuery, useTheme } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";

const AreaChartComponent = ({currentStock}) => {
  const [candleSticksData, setCandleSticksData] = useState([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDateDaysAgo = (days = 360) => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
    return pastDate.toISOString().split('T')[0];
  };
  /*  get candlesticks */
  const getCandleSticks = async(ticker, interval="5min", currentDate = getTodayDate(), pastDate = getDateDaysAgo(360)) => {
    const url = `${API_URL}/fmp/chart?ticker=${ticker}&interval=${interval}&from=${pastDate}&to=${currentDate}&resampleFreq=4hour`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      console.log("Status", response.status, result.message);
      return;
    }

    // Handle the new API response format - data is directly in the result array
    const dataArray = Array.isArray(result) ? result : result.data || [];
    
    const formattedData = dataArray.map(item => ({
        time: formatTimeToHHMMAMPM(item.date),
        date: formatDateToMMDDYY(item.date),
        open: parseFloat(item.open).toFixed(2),
        high: parseFloat(item.high).toFixed(2),
        low: parseFloat(item.low).toFixed(2),
        close: parseFloat(item.close).toFixed(2),
        value: parseFloat(item.close), // for line chart
        volume: item.volume,
        originalDate: new Date(item.date) // Keep original date for sorting
      }))
      .sort((a, b) => a.originalDate - b.originalDate); // Sort by actual date

    setCandleSticksData(formattedData);
    console.log("Formatted candle sticks", formattedData);
  }

  useEffect(() => {
    if (currentStock) {
      getCandleSticks(currentStock);
    }
  }, [currentStock]);

  return (
    <ResponsiveContainer width="100%" height={isSmallScreen ? "70%" : "100%"}>
        {candleSticksData.length > 0 ? (
          <AreaChart
            // width={600}
            // height={400}
            data={candleSticksData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis dataKey="date" tickCount={0} interval="preserveStartEnd"/>
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="close" stroke={teal[500]} fill={teal[300]} />
          </AreaChart>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            Loading chart data...
          </div>
        )}
      </ResponsiveContainer>
    );
}

export default AreaChartComponent;
