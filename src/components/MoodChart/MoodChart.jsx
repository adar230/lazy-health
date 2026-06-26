import React from 'react';
import './MoodChart.css';

const MoodChart = ({ data }) => {
  const chartData = data || [];
  
  return (
    <section className="mood-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">רמת אנרגיה שבועית</h3>
      </div>
      
      <div className="mood-chart-body">
        {chartData.map((d, idx) => (
          <div key={idx} className="mood-column">
            <div className="mood-point-container">
              {idx < chartData.length - 1 && (
                <div 
                  className="mood-line" 
                  style={{
                    // Math to visually connect dots if they are side by side.
                    // Instead of full line chart math, a subtle vertical gradient bar looks great for pure CSS
                    height: `${d.energy}%`,
                    opacity: d.energy > 0 ? 0.3 : 0
                  }}
                ></div>
              )}
              <div 
                className="mood-point" 
                style={{ bottom: `${d.energy}%` }}
                title={`אנרגיה: ${d.energy}%`}
              ></div>
            </div>
            <span className="day-label">{d.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoodChart;
