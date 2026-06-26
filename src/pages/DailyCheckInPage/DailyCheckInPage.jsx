import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import PillButton from '../../components/PillButton/PillButton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateDailyTask } from '../../lib/gemini';
import './DailyCheckInPage.css';

const DailyCheckInPage = () => {
  const [sleepHours, setSleepHours] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(null);
  const [freeTime, setFreeTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const sleepOptions = ['פחות מ-5', '5—6', '6—7', '7—8', 'יותר מ-8'];
  const energyOptions = ['1', '2', '3', '4', '5'];

  const handleSubmit = async () => {
    setSubmitError('');
    const missing = [];
    if (!sleepHours) missing.push('sleep');
    if (!energyLevel) missing.push('energy');
    if (!freeTime) missing.push('freeTime');

    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }
    
    setMissingFields([]);
    setLoading(true);

    let freeTimeInt = 15;
    if (freeTime === 'פחות מ-10') freeTimeInt = 5;
    else if (freeTime === "10—20 דק'") freeTimeInt = 15;
    else if (freeTime === 'יותר משעה') freeTimeInt = 60;

    let sleepHoursFloat = 7.5;
    if (sleepHours === 'פחות מ-5') sleepHoursFloat = 4;
    else if (sleepHours === '5—6' || sleepHours === '5-6') sleepHoursFloat = 5.5;
    else if (sleepHours === '6—7' || sleepHours === '6-7') sleepHoursFloat = 6.5;
    else if (sleepHours === '7—8' || sleepHours === '7-8') sleepHoursFloat = 7.5;
    else if (sleepHours === 'יותר מ-8') sleepHoursFloat = 9;

    try {
      const { data: checkinData, error: checkinError } = await supabase.from('daily_checkins').insert({
        user_id: user?.id,
        date: new Date().toISOString().split('T')[0],
        sleep_hours: sleepHoursFloat,
        energy_level: parseInt(energyLevel, 10),
        free_time: freeTimeInt,
        checkin_type: 'morning'
      }).select().single();

      if (checkinError) throw checkinError;

      // Generate task with AI
      const aiTask = await generateDailyTask(sleepHours, energyLevel, freeTime);

      // Save task to Supabase
      const { data: taskData, error: taskError } = await supabase.from('tasks').insert({
        user_id: user?.id,
        checkin_id: checkinData.id,
        title: aiTask.title,
        description: aiTask.description,
        category: aiTask.category,
        difficulty: aiTask.difficulty,
        is_completed: false,
        is_minimal: false
      }).select().single();

      if (taskError) throw taskError;

      localStorage.setItem('latest_task_id', taskData.id);

      navigate('/task');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="daily-checkin-page">
      <ProgressBar 
        subtitle="שאלון בוקר"
        title="בוקר טוב! איך התעוררת?"
        current={2}
        total={3}
      />
      
      <section className="questions-section">
        <QuestionCard 
          icon="bedtime" 
          question="כמה שעות ישנת?"
          error={missingFields.includes('sleep') ? "שדה חובה — בחר כדי להמשיך" : ""}
        >
          <div className="grid-cols-2">
            {sleepOptions.map(opt => (
              <PillButton 
                key={opt} 
                label={opt} 
                selected={sleepHours === opt} 
                onClick={() => setSleepHours(opt)} 
              />
            ))}
          </div>
        </QuestionCard>

        <QuestionCard 
          icon="sentiment_satisfied" 
          question="איך את מרגישה?"
          error={missingFields.includes('energy') ? "שדה חובה — בחר כדי להמשיך" : ""}
        >
          <div className="flex-between">
            {energyOptions.map(opt => (
              <PillButton 
                key={opt} 
                label={opt} 
                selected={energyLevel === opt} 
                onClick={() => setEnergyLevel(opt)} 
                className="square-btn" 
              />
            ))}
          </div>
        </QuestionCard>

        <QuestionCard 
          icon="schedule" 
          question="כמה זמן פנוי יש לך?" 
          error={missingFields.includes('freeTime') ? "שדה חובה — בחר כדי להמשיך" : ""}
        >
          <div className="grid-cols-2">
            <PillButton 
              label="פחות מ-10" 
              selected={freeTime === 'פחות מ-10'} 
              onClick={() => setFreeTime('פחות מ-10')} 
            />
            <PillButton 
              label="10—20 דק'" 
              selected={freeTime === "10—20 דק'"} 
              onClick={() => setFreeTime("10—20 דק'")} 
            />
            <PillButton 
              label="יותר משעה" 
              className="col-span-2" 
              selected={freeTime === 'יותר משעה'} 
              onClick={() => setFreeTime('יותר משעה')} 
            />
          </div>
        </QuestionCard>

        {submitError && <div className="submit-error" style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-container)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: 'var(--space-md)' }}>{submitError}</div>}
        
        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? 'שומר נתונים...' : 'שלח ועבור למשימה'}
        </button>
      </section>

      <div className="decorative-illustration">
        <img 
          className="deco-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZGtwPYu5J2RhpcRS5THqew4N1oAPK8OM1-vIEKayhWjMHs4lcdyVZNFoW19k-r1IIu4BtaoJFAPoiJoM0SpSVcPkwtYrX2fJUhKdxJnqDwSdhz1C5XLS4t7SLA4OvshJdrdxW2FRvNJ9SPfi9uWynybd5MvAVCSqk6Mkh7xL2RVfZxF3oM8sBZV9yfO5dRoByMQTb2N0D9ObOcd6qFyb8FjcIi6iUuyjvunx6iMUSSQzfOIwHmqPy-ABj7IlX-Rx2FOCBv9XGkS1e"
          alt="Decorative" 
        />
        <p className="deco-text">זמן לעצמך הוא לא בזבוז זמן.</p>
      </div>
    </div>
  );
};

export default DailyCheckInPage;
