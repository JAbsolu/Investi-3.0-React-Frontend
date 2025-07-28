import React, { PureComponent, useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateToMMDDYY, formatTimeToHHMMAMPM, getStartDay } from '../util';
import { green, teal } from '@mui/material/colors';

const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";

const AreaChartComponent = ({currentStock}) => {
  const [candleSticksData, setCandleSticksData] = useState([]);

  /*  get candlesticks */
  const getCandleSticks = async(ticker, startDate) => {
    const url = `${API_URL}/tiingo/candlestics?ticker=${ticker}&startDate=${startDate}&resampleFreq=4hour`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      console.log("Status", response.status, result.message);
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
    console.log("Formatted candle sticks", formattedData);
  }

  useEffect(() => {
    if (currentStock) {
      getCandleSticks(currentStock, getStartDay());
    }
  }, [currentStock]);

  return (
    <ResponsiveContainer width="100%" height="100%">
        {candleSticksData.length > 0 ? (
          <AreaChart
            width={500}
            height={400}
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
