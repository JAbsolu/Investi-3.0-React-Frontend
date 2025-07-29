import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { teal } from '@mui/material/colors';

// API URL - you might want to move this to an environment variable
const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";

// Helper functions for date formatting
const formatTimeToHHMMAMPM = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};

const formatDateToMMDDYY = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  });
};

const getStartDay = (period = 'YTD') => {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'YTD':
      // Year to date (start of current year)
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '1Y':
      // 365 days ago
      startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
      break;
    default:
      // Default to start of current year
      startDate = new Date(now.getFullYear(), 0, 1);
  }
  
  return startDate.toISOString().split('T')[0];
};

const StockChart = ({ companyName, ticker, price, marketPriceChange }) => {
  const svgRef = useRef(null);
  const [chartType, setChartType] = useState('candlestick');
  const [hoveredData, setHoveredData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('YTD');
  const [candleSticksData, setCandleSticksData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get candlesticks data from API
  const getCandleSticks = async(tickerSymbol, startDate, resampleFreq = '4hour') => {
    if (!tickerSymbol) return;
    
    setLoading(true);
    try {
      const url = `${API_URL}/tiingo/candlestics?ticker=${tickerSymbol}&startDate=${startDate}&resampleFreq=${resampleFreq}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        console.log("Status", response.status, result.message);
        return;
      }

      const formattedData = result.data?.map(item => ({
          time: formatTimeToHHMMAMPM(item.date),
          date: formatDateToMMDDYY(item.date),
          open: parseFloat(item.open.toFixed(2)),
          high: parseFloat(item.high.toFixed(2)),
          low: parseFloat(item.low.toFixed(2)),
          close: parseFloat(item.close.toFixed(2)),
          value: item.close, // for line chart
          originalDate: new Date(item.date) // Keep original date for sorting
        }))
        .sort((a, b) => a.originalDate - b.originalDate); // Sort by actual date

      setCandleSticksData(formattedData || []);
      console.log("Formatted candle sticks", formattedData);
    } catch (error) {
      console.error("Error fetching candlestick data:", error);
      setCandleSticksData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!candleSticksData || candleSticksData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 262.5 - margin.top - margin.bottom;

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse and format data - use originalDate from API response
    const formattedData = candleSticksData.map((d, i) => ({
      date: d.originalDate,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      index: i
    }));

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(formattedData, d => d.date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.high)])
      .nice()
      .range([height, 0]);

    // Grid lines
    const xGrid = d3.axisBottom(xScale)
      .tickSize(-height)
      .tickFormat("");

    const yGrid = d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat("");

    chart.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(xGrid)
      .selectAll("line")
      .style("stroke", "#0f766e")
      .style("stroke-width", 1);

    chart.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .selectAll("line")
      .style("stroke", "#0f766e")
      .style("stroke-width", 1);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "12px")
      .style("background", "rgba(19, 78, 74, 0.95)")
      .style("border", "1px solid #14b8a6")
      .style("border-radius", "8px")
      .style("color", "#ffffff")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("backdrop-filter", "blur(10px)");

    if (chartType === 'candlestick') {
      // Candlestick width
      const candleWidth = Math.max(2, (width / formattedData.length) * 0.6);

      // Candlestick bodies
      chart.selectAll(".candle-body")
        .data(formattedData)
        .enter()
        .append("rect")
        .attr("class", "candle-body")
        .attr("x", d => xScale(d.date) - candleWidth / 2)
        .attr("y", d => yScale(Math.max(d.open, d.close)))
        .attr("width", candleWidth)
        .attr("height", d => Math.abs(yScale(d.open) - yScale(d.close)))
        .attr("fill", d => d.close >= d.open ? "#14b8a6" : "#ef4444")
        .attr("stroke", d => d.close >= d.open ? "#0d9488" : "#dc2626")
        .attr("stroke-width", 1)
        .style("cursor", "crosshair")
        .on("mouseover", function(event, d) {
          setHoveredData(d);
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`
            <div style="font-weight: bold; color: #14b8a6; margin-bottom: 8px;">
              ${d.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}<br/>
              ${d.date.toLocaleDateString('en-US')}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: monospace;">
              <div style="color: #5eead4;">Open:</div><div style="color: #14b8a6;">$${d.open.toFixed(2)}</div>
              <div style="color: #5eead4;">High:</div><div style="color: #10b981;">$${d.high.toFixed(2)}</div>
              <div style="color: #5eead4;">Low:</div><div style="color: #f87171;">$${d.low.toFixed(2)}</div>
              <div style="color: #5eead4;">Close:</div><div style="color: #ffffff; font-weight: bold;">$${d.close.toFixed(2)}</div>
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          setHoveredData(null);
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Candlestick wicks
      chart.selectAll(".candle-wick")
        .data(formattedData)
        .enter()
        .append("line")
        .attr("class", "candle-wick")
        .attr("x1", d => xScale(d.date))
        .attr("x2", d => xScale(d.date))
        .attr("y1", d => yScale(d.high))
        .attr("y2", d => yScale(d.low))
        .attr("stroke", d => d.close >= d.open ? "#14b8a6" : "#ef4444")
        .attr("stroke-width", 1)
        .style("pointer-events", "none");

    } else if (chartType === 'line') {
      // Line chart
      const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.close))
        .curve(d3.curveMonotoneX);

      chart.append("path")
        .datum(formattedData)
        .attr("fill", "none")
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2)
        .attr("d", line);

      // Dots
      chart.selectAll(".dot")
        .data(formattedData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.close))
        .attr("r", 3)
        .attr("fill", "#14b8a6")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .style("cursor", "crosshair")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("r", 5);
          setHoveredData(d);
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`
            <div style="font-weight: bold; color: #14b8a6; margin-bottom: 8px;">
              ${d.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}<br/>
              ${d.date.toLocaleDateString('en-US')}
            </div>
            <div style="color: #ffffff; font-family: monospace; font-size: 14px;">
              Price: <span style="font-weight: bold;">$${d.close.toFixed(2)}</span>
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("r", 3);
          setHoveredData(null);
          tooltip.transition().duration(500).style("opacity", 0);
        });

    } else if (chartType === 'area') {
      // Area chart
      const area = d3.area()
        .x(d => xScale(d.date))
        .y0(height)
        .y1(d => yScale(d.close))
        .curve(d3.curveMonotoneX);

      // Gradient definition
      const gradient = chart.append("defs")
        .append("linearGradient")
        .attr("id", "area-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", height);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ffffff")
        .attr("stop-opacity", 0.6);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ffffff")
        .attr("stop-opacity", 0.1);

      chart.append("path")
        .datum(formattedData)
        .attr("fill", "url(#area-gradient)")
        .attr("d", area);

      // Line on top
      const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.close))
        .curve(d3.curveMonotoneX);

      chart.append("path")
        .datum(formattedData)
        .attr("fill", "none")
        .attr("stroke", "#14b8a6")
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%m/%d/%y"))
      .ticks(8);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `$${d.toFixed(2)}`)
      .ticks(8);

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "#5eead4")
      .style("font-size", "12px");

    chart.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("fill", "#5eead4")
      .style("font-size", "12px");

    // Style axes
    chart.selectAll(".domain")
      .style("stroke", "#0f766e");

    chart.selectAll(".tick line")
      .style("stroke", "#0f766e");

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll(".tooltip").remove();
    };

  }, [candleSticksData, chartType, selectedPeriod]);

  // Fetch initial data when ticker changes
  useEffect(() => {
    if (ticker) {
      getCandleSticks(ticker, getStartDay(selectedPeriod), '4hour'); // Use current selected period
    }
  }, [ticker]);



  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    
    let resampleFreq;
    
    switch (period) {
      case 'YTD':
        resampleFreq = '4hour'; // 4 hour intervals for YTD data
        break;
      case '1Y':
        resampleFreq = '4hour'; // 4 hour intervals for yearly data
        break;
      default:
        resampleFreq = '4hour';
    }
    
    // Get start date based on period and fetch new data from API
    if (ticker) {
      getCandleSticks(ticker, getStartDay(period), resampleFreq);
    }
  };

  return (
    <div className="rounded-xl shadow-2xl overflow-hidden" style={{
      background: 'rgba(10, 20, 15, 0.9)',
      border: `1px solid ${teal[200]}40`,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b" style={{
        borderBottomColor: `${teal[200]}40`,
        background: `linear-gradient(135deg, ${teal[400]}20, transparent)`
      }}>
        {(companyName || price || marketPriceChange) && (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h3 className="text-white text-lg font-semibold">
                {companyName || ""}
              </h3>
              {ticker && (
                <span className="text-white text-sm px-2 py-1 rounded" style={{
                  background: `${teal[900]}20`,
                  border: `1px solid ${teal[800]}40`
                }}>
                  {ticker || ""}
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-3">
              <div className="text-white text-2xl font-bold">
                ${typeof price === 'string' ? price : 'Loading...'}
              </div>
              <div className={`text-sm font-semibold px-2 py-1 rounded flex items-center ${
                typeof marketPriceChange === 'string' && marketPriceChange.startsWith('-')
                  ? 'text-red-300 bg-red-900/30'
                  : 'text-green-500 bg-teal-900/20 border border-teal-800/40'
              }`}>
                <span style={{ 
                  fontSize: "1.1rem", 
                  color: typeof marketPriceChange === 'string' && marketPriceChange.startsWith('-') ? '#ef4444' : '#10b981'
                }}>
                  {typeof marketPriceChange === 'string' && marketPriceChange.startsWith('-') ? '▼' : '▲'}
                </span>
                <span className="ml-1">{marketPriceChange || 'Loading...'}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Chart Type Controls */}
        <div className="flex rounded-lg p-1 border shadow-inner" style={{
          borderColor: `${teal[500]}40`,
          background: `${teal[500]}20`
        }}>
          {[
            { key: 'line', label: 'Line', icon: '' },
            { key: 'area', label: 'Area', icon: '' },
            { key: 'candlestick', label: 'Candles', icon: '' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleChartTypeChange(key)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                chartType === key
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg transform scale-105'
                  : 'text-teal-300 hover:text-teal-200 hover:scale-102'
              }`}
              style={chartType !== key ? {
                background: 'transparent'
              } : {}}
              onMouseEnter={(e) => {
                if (chartType !== key) {
                  e.target.style.background = `${teal[900]}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (chartType !== key) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative p-6" style={{
        background: `rgba(5, 10, 7, 0.8)`
      }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-teal-300 text-sm">Loading chart data...</div>
          </div>
        ) : candleSticksData.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-teal-300 text-sm">No data available</div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full"></svg>
        )}

        {/* Current Hovered Data */}
        {hoveredData && (
          <div className="absolute top-4 right-4 backdrop-blur-sm rounded-lg px-4 py-3 border border-teal-500/50 min-w-48" style={{
            background: `${teal[100]}20`
          }}>
            <div className="text-xs font-semibold text-teal-300 mb-2">
              {hoveredData.date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              })}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-mono">
              <div className="text-white">Open:</div>
              <div className="text-white">${hoveredData.open.toFixed(2)}</div>
              <div className="text-green-400">High:</div>
              <div className="text-white">${hoveredData.high.toFixed(2)}</div>
              <div className="text-white">Low:</div>
              <div className="text-red-400">${hoveredData.low.toFixed(2)}</div>
              <div className="text-white">Close:</div>
              <div className="text-white font-semibold">${hoveredData.close.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t" style={{
        borderTopColor: `${teal[800]}40`,
        background: `${teal[900]}10`
      }}>
        <div className="flex justify-between items-center">
          {/* Time Period Buttons */}
          <div className="flex items-center space-x-2">
            {['YTD', '1Y'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-teal-500 text-white shadow-md transform scale-105'
                    : 'text-teal-300 hover:text-white hover:bg-teal-700/30'
                }`}
                style={{
                  background: selectedPeriod === period ? teal[500] : 'transparent',
                  border: selectedPeriod === period ? 'none' : `1px solid ${teal[700]}40`,
                }}
              >
                {period}
              </button>
            ))}
          </div>
          
          {/* Chart Info */}
          <div className="flex items-center space-x-2 text-xs text-teal-400">
            <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse"></div>
            <span>Real-time Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;