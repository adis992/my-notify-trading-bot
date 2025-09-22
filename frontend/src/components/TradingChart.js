import React, { useEffect, useRef } from 'react';

const TradingChart = ({ data, title, type = 'line' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log('🎯 v2.0 TradingChart:', title, 'data:', data, 'type:', type);
    if (!data || data.length === 0) {
      console.log('❌ v2.0 TradingChart: No data provided');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    if (type === 'histogram') {
      drawHistogram(ctx, data, width, height);
    } else if (type === 'line') {
      drawLineChart(ctx, data, width, height);
    } else if (type === 'candlestick') {
      drawCandlestick(ctx, data, width, height);
    }

  }, [data, type]);

  const drawHistogram = (ctx, data, width, height) => {
    const margin = 40;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length;

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = margin + index * barWidth;
      const y = height - margin - barHeight;

      // Color based on value
      let color = '#e74c3c'; // Red
      if (item.value > 70) color = '#2ecc71'; // Green
      else if (item.value > 40) color = '#f39c12'; // Orange

      ctx.fillStyle = color;
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

      // Draw value text
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toFixed(0), x + barWidth/2, y - 5);

      // Draw date label
      ctx.fillStyle = '#ccc';
      ctx.font = '10px Arial';
      ctx.save();
      ctx.translate(x + barWidth/2, height - 10);
      ctx.rotate(-Math.PI/4);
      ctx.fillText(item.label, 0, 0);
      ctx.restore();
    });

    // Draw axes
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();
  };

  const drawLineChart = (ctx, data, width, height) => {
    const margin = 40;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;

    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = margin + (i * chartHeight / 5);
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();

      // Y-axis labels
      const value = maxValue - (i * range / 5);
      ctx.fillStyle = '#ccc';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), margin - 5, y + 4);
    }

    // Draw line
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((item, index) => {
      const x = margin + (index * chartWidth / (data.length - 1));
      const y = margin + ((maxValue - item.value) / range) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw data points
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();
  };

  const drawCandlestick = (ctx, data, width, height) => {
    const margin = 40;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;
    
    const maxPrice = Math.max(...data.map(d => Math.max(d.high, d.open, d.close, d.low)));
    const minPrice = Math.min(...data.map(d => Math.min(d.high, d.open, d.close, d.low)));
    const range = maxPrice - minPrice;
    const candleWidth = chartWidth / data.length * 0.8;

    data.forEach((candle, index) => {
      const x = margin + (index * chartWidth / data.length);
      const highY = margin + ((maxPrice - candle.high) / range) * chartHeight;
      const lowY = margin + ((maxPrice - candle.low) / range) * chartHeight;
      const openY = margin + ((maxPrice - candle.open) / range) * chartHeight;
      const closeY = margin + ((maxPrice - candle.close) / range) * chartHeight;

      const isGreen = candle.close > candle.open;
      const color = isGreen ? '#2ecc71' : '#e74c3c';

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth/2, highY);
      ctx.lineTo(x + candleWidth/2, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    });

    // Draw axes
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();
  };

  return (
    <div style={{ 
      background: '#2a2a2a', 
      padding: '15px', 
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <h3 style={{ 
        color: '#fff', 
        textAlign: 'center', 
        marginBottom: '15px',
        fontSize: '16px'
      }}>
        {title}
      </h3>
      <canvas 
        ref={canvasRef}
        width={800}
        height={300}
        style={{ 
          width: '100%', 
          height: 'auto',
          maxWidth: '800px',
          background: '#1a1a1a',
          borderRadius: '5px'
        }}
      />
    </div>
  );
};

export default TradingChart;
