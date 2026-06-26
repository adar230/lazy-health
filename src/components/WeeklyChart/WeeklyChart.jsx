import React, { useState } from 'react';
import './WeeklyChart.css';

const WeeklyChart = ({ rawData, uniqueDates }) => {
  const [chartRange, setChartRange] = useState('week');

  const getChartData = () => {
    if (!uniqueDates || uniqueDates.length === 0) return [];
    
    const count = chartRange === 'week' ? 7 : 30;
    const chartDates = uniqueDates.slice(0, count).reverse();
    const daysHe = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
    
    return chartDates.map(dStr => {
      const dayRecords = rawData.filter(d => d.date === dStr);
      const sleep = dayRecords.find(d => d.sleep_hours)?.sleep_hours || 0;
      const energy = dayRecords.find(d => d.energy_level)?.energy_level || 0;
      
      const dObj = new Date(dStr);
      let label = daysHe[dObj.getDay()];
      if (chartRange === 'month') {
        label = `${dObj.getDate()}/${dObj.getMonth() + 1}`;
      }

      return {
        day: label,
        sleep: Math.min((sleep / 10) * 100, 100),
        energy: Math.min((energy / 5) * 100, 100)
      };
    });
  };

  const chartData = getChartData();

  return (
    <section className="weekly-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">אנרגיה VS שינה</h3>
        <div className="chart-filters">
          <button 
            className={`filter-btn ${chartRange === 'month' ? 'active' : ''}`}
            onClick={() => setChartRange('month')}
          >
            חודש
          </button>
          <button 
            className={`filter-btn ${chartRange === 'week' ? 'active' : ''}`}
            onClick={() => setChartRange('week')}
          >
            שבוע
          </button>
        </div>
      </div>
      
      <div className="chart-body">
        {chartData.map((data, idx) => (
          <div key={idx} className="chart-column">
            <div className="bars-wrapper">
              <div className="bar sleep-bar" style={{ height: `${data.sleep}%` }}></div>
              <div className="bar energy-bar" style={{ height: `${data.energy}%` }}></div>
            </div>
            <span className="day-label">{data.day}</span>
          </div>
        ))}
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-dot sleep-dot"></div>
          <span className="legend-label">שינה</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot energy-dot"></div>
          <span className="legend-label">אנרגיה</span>
        </div>
      </div>
    </section>
  );
};

export default WeeklyChart;
