import React from 'react';
import './WeeklyChart.css';

const WeeklyChart = () => {
  const chartData = [
    { day: "א'", sleep: 60, energy: 40 },
    { day: "ב'", sleep: 75, energy: 55 },
    { day: "ג'", sleep: 90, energy: 80 },
    { day: "ד'", sleep: 65, energy: 45 },
    { day: "ה'", sleep: 85, energy: 95 },
    { day: "ו'", sleep: 70, energy: 60 },
    { day: "ש'", sleep: 50, energy: 30 },
  ];

  return (
    <section className="weekly-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">אנרגיה VS שינה</h3>
        <div className="chart-filters">
          <button className="filter-btn">חודש</button>
          <button className="filter-btn active">שבוע</button>
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
