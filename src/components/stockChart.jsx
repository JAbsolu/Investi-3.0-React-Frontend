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
  const zoomRef = useRef(null);
  const [chartType, setChartType] = useState('candlestick');
  const [hoveredData, setHoveredData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('YTD');
  const [candleSticksData, setCandleSticksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentResolution, setCurrentResolution] = useState('4hour');

  // Get candlesticks data from API with dynamic resolution based on zoom level
  const getCandleSticks = async(tickerSymbol, startDate, endDate = null, resampleFreq = '4hour') => {
    if (!tickerSymbol) return;
    
    setLoading(true);
    try {
      let url = `${API_URL}/tiingo/candlestics?ticker=${tickerSymbol}&startDate=${startDate}&resampleFreq=${resampleFreq}`;

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
      setCurrentResolution(resampleFreq);
      console.log("Formatted candle sticks", formattedData);
    } catch (error) {
      console.error("Error fetching candlestick data:", error);
      setCandleSticksData([]);
    } finally {
      setLoading(false);
    }
  };

  // Determine appropriate resolution based on time range
  const getResolutionForTimeRange = (startDate, endDate) => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      return '5min'; // Very detailed for 1 day or less
    } else if (daysDiff <= 7) {
      return '30min'; // 30 minute intervals for up to 1 week
    } else if (daysDiff <= 30) {
      return '2hour'; // 2 hour intervals for up to 1 month
    } else if (daysDiff <= 90) {
      return '4hour'; // 4 hour intervals for up to 3 months
    } else if (daysDiff <= 365) {
      return '1day'; // Daily intervals for up to 1 year
    } else {
      return '1week'; // Weekly intervals for longer periods
    }
  };

  useEffect(() => {
    if (!candleSticksData || candleSticksData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

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
      .domain([
        d3.min(formattedData, d => Math.min(d.low, d.open, d.close)) * 0.995,
        d3.max(formattedData, d => Math.max(d.high, d.open, d.close)) * 1.005
      ])
      .nice()
      .range([height, 0]);

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10]) // Min and max zoom levels
      .extent([[0, 0], [width, height]])
      .on("zoom", function(event) {
        const { transform } = event;
        
        // Update scales with zoom transform
        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);
        
        // Get visible time range
        const visibleDomain = newXScale.domain();
        const startDate = new Date(visibleDomain[0]);
        const endDate = new Date(visibleDomain[1]);
        
        // Determine if we need to fetch new data based on zoom level
        const shouldFetchNewData = transform.k > 2; // Fetch higher resolution when zoomed in significantly
        
        if (shouldFetchNewData) {
          // Fetch new data with appropriate resolution for the visible time range
          const newResolution = getResolutionForTimeRange(startDate, endDate);
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];
          
          // Update resolution display immediately
          setCurrentResolution(newResolution);
          
          // Debounce the API call to avoid too many requests
          clearTimeout(window.zoomFetchTimeout);
          window.zoomFetchTimeout = setTimeout(() => {
            getCandleSticks(ticker, startDateStr, endDateStr, newResolution);
          }, 500);
        }
        
        // Clear previous elements
        chart.selectAll(".grid").remove();
        chart.selectAll(".candle-body").remove();
        chart.selectAll(".candle-wick").remove();
        chart.selectAll(".dot").remove();
        chart.selectAll("path").remove();
        chart.selectAll(".x-axis").remove();
        chart.selectAll(".y-axis").remove();
        
        // Filter data to visible range for better performance
        const visibleData = formattedData.filter(d => 
          d.date >= visibleDomain[0] && d.date <= visibleDomain[1]
        );
        
        // Update Y scale domain based on visible data
        const visibleYDomain = [
          d3.min(visibleData, d => Math.min(d.low, d.open, d.close)) * 0.99,
          d3.max(visibleData, d => Math.max(d.high, d.open, d.close)) * 1.01
        ];
        
        const dynamicYScale = d3.scaleLinear()
          .domain(visibleYDomain)
          .nice()
          .range([height, 0]);
        
        const finalYScale = transform.rescaleY(dynamicYScale);
        
        // Redraw grid
        const xGrid = d3.axisBottom(newXScale)
          .tickSize(-height)
          .tickFormat("");

        const yGrid = d3.axisLeft(finalYScale)
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

        // Redraw chart elements based on chart type using visible data
        if (chartType === 'candlestick') {
          const candleWidth = Math.max(1, (width / visibleData.length) * 0.6 * Math.min(transform.k, 2));

          // Candlestick bodies
          chart.selectAll(".candle-body")
            .data(visibleData)
            .enter()
            .append("rect")
            .attr("class", "candle-body")
            .attr("x", d => newXScale(d.date) - candleWidth / 2)
            .attr("y", d => finalYScale(Math.max(d.open, d.close)))
            .attr("width", candleWidth)
            .attr("height", d => Math.abs(finalYScale(d.open) - finalYScale(d.close)))
            .attr("fill", d => d.close >= d.open ? "#14b8a6" : "#ef4444")
            .attr("stroke", d => d.close >= d.open ? "#0d9488" : "#dc2626")
            .attr("stroke-width", 1)
            .style("cursor", "crosshair");

          // Candlestick wicks
          chart.selectAll(".candle-wick")
            .data(visibleData)
            .enter()
            .append("line")
            .attr("class", "candle-wick")
            .attr("x1", d => newXScale(d.date))
            .attr("x2", d => newXScale(d.date))
            .attr("y1", d => finalYScale(d.high))
            .attr("y2", d => finalYScale(d.low))
            .attr("stroke", d => d.close >= d.open ? "#14b8a6" : "#ef4444")
            .attr("stroke-width", 1);

        } else if (chartType === 'line') {
          const line = d3.line()
            .x(d => newXScale(d.date))
            .y(d => finalYScale(d.close))
            .curve(d3.curveMonotoneX);

          chart.append("path")
            .datum(visibleData)
            .attr("fill", "none")
            .attr("stroke", "#14b8a6")
            .attr("stroke-width", 2)
            .attr("d", line);

          chart.selectAll(".dot")
            .data(visibleData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => newXScale(d.date))
            .attr("cy", d => finalYScale(d.close))
            .attr("r", 3)
            .attr("fill", "#14b8a6")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .style("cursor", "crosshair");

        } else if (chartType === 'area') {
          const area = d3.area()
            .x(d => newXScale(d.date))
            .y0(height)
            .y1(d => finalYScale(d.close))
            .curve(d3.curveMonotoneX);

          // Gradient definition
          const gradient = chart.append("defs")
            .append("linearGradient")
            .attr("id", "area-gradient-zoom")
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
            .datum(visibleData)
            .attr("fill", "url(#area-gradient-zoom)")
            .attr("d", area);

          const line = d3.line()
            .x(d => newXScale(d.date))
            .y(d => finalYScale(d.close))
            .curve(d3.curveMonotoneX);

          chart.append("path")
            .datum(visibleData)
            .attr("fill", "none")
            .attr("stroke", "#14b8a6")
            .attr("stroke-width", 2)
            .attr("d", line);
        }

        // Update axes with dynamic formatting
        const timeDiff = visibleDomain[1].getTime() - visibleDomain[0].getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        let xAxisFormat;
        let tickCount;
        
        if (hoursDiff <= 24) {
          // Less than 1 day - show hours
          xAxisFormat = d3.timeFormat("%H:%M");
          tickCount = Math.min(8, Math.max(4, Math.floor(hoursDiff / 2)));
        } else if (hoursDiff <= 168) {
          // Less than 1 week - show day and time
          xAxisFormat = d3.timeFormat("%m/%d %H:%M");
          tickCount = Math.min(10, Math.max(5, Math.floor(hoursDiff / 12)));
        } else if (hoursDiff <= 720) {
          // Less than 1 month - show dates
          xAxisFormat = d3.timeFormat("%m/%d");
          tickCount = Math.min(12, Math.max(6, Math.floor(hoursDiff / 24)));
        } else {
          // More than 1 month - show month/year
          xAxisFormat = d3.timeFormat("%m/%y");
          tickCount = Math.min(10, Math.max(4, Math.floor(hoursDiff / 168)));
        }

        const xAxis = d3.axisBottom(newXScale)
          .tickFormat(xAxisFormat)
          .ticks(tickCount);

        const yAxis = d3.axisLeft(finalYScale)
          .tickFormat(d => `$${d.toFixed(2)}`)
          .ticks(8);

        chart.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis)
          .selectAll("text")
          .style("fill", "#5eead4")
          .style("font-size", "12px");

        chart.append("g")
          .attr("class", "y-axis")
          .call(yAxis)
          .selectAll("text")
          .style("fill", "#5eead4")
          .style("font-size", "12px");

        // Style axes
        chart.selectAll(".domain")
          .style("stroke", "#0f766e");

        chart.selectAll(".tick line")
          .style("stroke", "#0f766e");
      });

    // Apply zoom to SVG
    zoomRef.current = zoom;
    svg.call(zoom);

    // Initial render function
    const renderChart = () => {
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
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("fill", "#5eead4")
        .style("font-size", "12px");

      chart.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll("text")
        .style("fill", "#5eead4")
        .style("font-size", "12px");

      // Style axes
      chart.selectAll(".domain")
        .style("stroke", "#0f766e");

      chart.selectAll(".tick line")
        .style("stroke", "#0f766e");
    };

    // Render initial chart
    renderChart();

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll(".tooltip").remove();
    };

  }, [candleSticksData, chartType, selectedPeriod]);

  // Fetch initial data when ticker changes
  useEffect(() => {
    if (ticker) {
      getCandleSticks(ticker, getStartDay(selectedPeriod), null, '4hour'); // Use current selected period
    }
    
    // Cleanup function to clear any pending timeouts
    return () => {
      clearTimeout(window.zoomFetchTimeout);
    };
  }, [ticker]);



  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Zoom control functions with dynamic data fetching
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      const currentTransform = d3.zoomTransform(svg.node()) || d3.zoomIdentity;
      const newScale = Math.min(currentTransform.k * 1.5, 10); // Max zoom level of 10
      
      svg.transition()
        .duration(300)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
        );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      const currentTransform = d3.zoomTransform(svg.node()) || d3.zoomIdentity;
      const newScale = Math.max(currentTransform.k * 0.67, 0.5); // Min zoom level of 0.5
      
      svg.transition()
        .duration(300)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale)
        );
    }
  };

  const handleZoomReset = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      
      // Clear any pending zoom fetch timeouts
      clearTimeout(window.zoomFetchTimeout);
      
      // Reset to original time period data
      if (ticker) {
        const resampleFreq = selectedPeriod === 'YTD' || selectedPeriod === '1Y' ? '4hour' : '4hour';
        getCandleSticks(ticker, getStartDay(selectedPeriod), null, resampleFreq);
      }
      
      svg.transition()
        .duration(500)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity
        );
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    
    // Clear any pending zoom fetch timeouts
    clearTimeout(window.zoomFetchTimeout);
    
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
      getCandleSticks(ticker, getStartDay(period), null, resampleFreq);
    }
  };

  return (
    <div className="rounded-xl shadow-2xl overflow-hidden" style={{
      background: 'rgba(10, 20, 15, 0.9)',
      border: `1px solid ${teal[200]}40`,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-3 sm:px-6 py-3 sm:py-4 border-b space-y-3 sm:space-y-0" style={{
        borderBottomColor: `${teal[200]}40`,
        background: `linear-gradient(135deg, ${teal[400]}20, transparent)`
      }}>
        {(companyName || price || marketPriceChange) && (
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <h3 className="text-white text-sm sm:text-lg font-semibold truncate max-w-32 sm:max-w-none">
                {companyName || ""}
              </h3>
              {ticker && (
                <span className="text-white text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded" style={{
                  background: `${teal[900]}20`,
                  border: `1px solid ${teal[800]}40`
                }}>
                  {ticker || ""}
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-2 sm:space-x-3">
              <div className="text-white text-lg sm:text-2xl font-bold">
                ${typeof price === 'string' ? price : 'Loading...'}
              </div>
              <div className={`text-xs sm:text-sm font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center ${
                typeof marketPriceChange === 'string' && marketPriceChange.startsWith('-')
                  ? 'text-red-300 bg-red-900/30'
                  : 'text-green-500 bg-teal-900/20 border border-teal-800/40'
              }`}>
                <span style={{ 
                  fontSize: "0.9rem", 
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
        <div className="flex justify-between sm:justify-start rounded-lg p-0.5 sm:p-1 border shadow-inner" style={{
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
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 ${
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
      <div className="relative p-2 sm:p-6" style={{
        background: `rgba(5, 10, 7, 0.8)`
      }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
              <div className="text-teal-300 text-sm">Loading chart data...</div>
            </div>
          </div>
        ) : candleSticksData.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-teal-300 text-sm">No data available</div>
          </div>
        ) : (
          <>
            <svg ref={svgRef} className="w-full"></svg>
            {loading && (
              <div className="absolute top-2 left-2 flex items-center space-x-2 px-3 py-1 rounded-md" style={{
                background: `${teal[900]}90`,
                border: `1px solid ${teal[600]}40`
              }}>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-400"></div>
                <span className="text-teal-300 text-xs">Updating...</span>
              </div>
            )}
          </>
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
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
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

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-md border" style={{
              borderColor: `${teal[700]}40`,
              background: `${teal[900]}20`
            }}>
              <button
                onClick={handleZoomIn}
                className="p-1 text-teal-300 hover:text-white hover:bg-teal-700/30 rounded transition-all duration-200"
                title="Zoom In"
                disabled={!candleSticksData.length}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <line x1="9" y1="11" x2="13" y2="11"/>
                  <line x1="11" y1="9" x2="11" y2="13"/>
                </svg>
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 text-teal-300 hover:text-white hover:bg-teal-700/30 rounded transition-all duration-200"
                title="Zoom Out"
                disabled={!candleSticksData.length}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <line x1="9" y1="11" x2="13" y2="11"/>
                </svg>
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1 text-teal-300 hover:text-white hover:bg-teal-700/30 rounded transition-all duration-200"
                title="Reset Zoom"
                disabled={!candleSticksData.length}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Chart Info */}
          <div className="flex items-center space-x-4 text-xs text-teal-400">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse"></div>
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center space-x-1 text-teal-500">
              <span>•</span>
              <span>{currentResolution} intervals</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-teal-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span>Drag to pan • Scroll to zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;