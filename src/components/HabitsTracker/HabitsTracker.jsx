import React from 'react';
import './HabitsTracker.css';

const HabitsTracker = ({ rawData, uniqueDates }) => {
  if (!uniqueDates || uniqueDates.length === 0) return null;
  
  // Last 7 days
  const chartDates = uniqueDates.slice(0, 7).reverse();
  const daysHe = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
  
  const habitsData = chartDates.map(dStr => {
    const dayRecords = rawData.filter(d => d.date === dStr);
    const morning = dayRecords.find(d => d.checkin_type === 'morning');
    const evening = dayRecords.find(d => d.checkin_type === 'evening');
    
    const dObj = new Date(dStr);
    const dayName = daysHe[dObj.getDay()];

    return {
      day: dayName,
      water: evening?.water_glasses >= 5,
      food: evening?.ate_healthy === true,
      activity: evening?.was_active === true,
      sleep: morning?.sleep_hours >= 6
    };
  });

  const habits = [
    { key: 'water', icon: 'water_drop', label: 'שתייה' },
    { key: 'food', icon: 'restaurant', label: 'תזונה' },
    { key: 'activity', icon: 'fitness_center', label: 'פעילות' },
    { key: 'sleep', icon: 'bedtime', label: 'שינה' }
  ];

  return (
    <section className="habits-tracker-card">
      <div className="habits-header">
        <h3 className="habits-title">הרגלים שבועיים</h3>
      </div>
      
      <div className="habits-grid-container">
        <div className="habits-row habits-header-row">
          <div className="habit-label-col"></div>
          {habitsData.map((d, i) => (
            <div key={i} className="habit-day-col">{d.day}</div>
          ))}
        </div>
        
        {habits.map(habit => (
          <div key={habit.key} className="habits-row">
            <div className="habit-label-col" title={habit.label}>
              <span className="material-symbols-outlined habit-icon">{habit.icon}</span>
            </div>
            {habitsData.map((d, i) => (
              <div key={i} className="habit-day-col">
                <div className={`habit-circle ${d[habit.key] ? 'met' : 'missed'}`}></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HabitsTracker;
