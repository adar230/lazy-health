import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import PillButton from '../../components/PillButton/PillButton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateDailyTask, generateMinimalTask } from '../../lib/gemini';
import './DailyCheckInPage.css';

const DailyCheckInPage = () => {
  // Morning questions
  const [sleepHours, setSleepHours] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(null);
  
  // Evening questions
  const [waterGlasses, setWaterGlasses] = useState(null);
  const [ateHealthy, setAteHealthy] = useState(null);
  const [wasActive, setWasActive] = useState(null);
  const [freeTime, setFreeTime] = useState(null);

  // Flow state
  const [checkinType, setCheckinType] = useState('none');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchExistingCheckin = async (type) => {
      if (!user) return;
      
      // Use local date to match DB insertion behavior reliably
      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const today = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
      
      console.log("--- Lock Check Debug ---");
      console.log("Querying for user_id:", user.id);
      console.log("Date:", today);
      console.log("Checkin Type:", type);

      const { data, error } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('checkin_type', type)
        .limit(1);
      
      console.log("Lock Query Result Data:", data);
      console.log("Lock Query Error:", error);
      console.log("------------------------");
      
      if (data && data.length > 0) setIsAlreadyCompleted(true);
    };

    const hour = new Date().getHours();
    // Morning: 5:00 - 11:59
    if (hour >= 5 && hour < 12) {
      setCheckinType('morning');
      fetchExistingCheckin('morning');
    } else if (hour >= 17 && hour < 23) {
      setCheckinType('evening');
      fetchExistingCheckin('evening');
    } else {
      setCheckinType('none');
    }
  }, [user]);

  const sleepOptions = ['פחות מ-5', '5—6', '6—7', '7—8', 'יותר מ-8'];
  const energyOptions = ['1', '2', '3', '4', '5'];
  const waterOptions = ['פחות מ-4', '4-6', '7-8', 'יותר מ-8'];
  const foodOptions = ['כן', 'חלקית', 'לא'];

  const handleSubmit = async () => {
    setSubmitError('');
    const missing = [];
    
    if (checkinType === 'morning') {
      if (!sleepHours) missing.push('sleep');
      if (!energyLevel) missing.push('energy');
    } else {
      if (!waterGlasses) missing.push('water');
      if (!ateHealthy) missing.push('food');
      if (!wasActive) missing.push('activity');
      if (!freeTime) missing.push('freeTime');
    }

    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }
    
    setMissingFields([]);
    setLoading(true);

    let freeTimeInt = 15;
    if (freeTime === 'פחות מ-10') freeTimeInt = 5;
    else if (freeTime === "10-20 דק'") freeTimeInt = 15;
    else if (freeTime === 'יותר משעה') freeTimeInt = 60;

    let sleepHoursFloat = 7.5;
    if (sleepHours === 'פחות מ-5') sleepHoursFloat = 4;
    else if (sleepHours === '5—6' || sleepHours === '5-6') sleepHoursFloat = 5.5;
    else if (sleepHours === '6—7' || sleepHours === '6-7') sleepHoursFloat = 6.5;
    else if (sleepHours === '7—8' || sleepHours === '7-8') sleepHoursFloat = 7.5;
    else if (sleepHours === 'יותר מ-8') sleepHoursFloat = 9;

    let waterInt = 2;
    if (waterGlasses === '4-6') waterInt = 5;
    else if (waterGlasses === '7-8') waterInt = 7;
    else if (waterGlasses === 'יותר מ-8') waterInt = 9;

    let foodBool = true;
    if (ateHealthy === 'לא') foodBool = false;

    let activeBool = true;
    if (wasActive === 'לא') activeBool = false;

    try {
      const payload = {
        user_id: user?.id,
        date: new Date().toISOString().split('T')[0],
        checkin_type: checkinType,
        free_time: freeTimeInt 
      };

      if (checkinType === 'morning') {
        payload.sleep_hours = sleepHoursFloat;
        payload.energy_level = parseInt(energyLevel, 10);
      } else {
        payload.water_glasses = waterInt;
        payload.ate_healthy = foodBool;
        payload.was_active = activeBool;
      }

      const { data: checkinData, error: checkinError } = await supabase
        .from('daily_checkins')
        .insert(payload)
        .select()
        .single();

      if (checkinError) throw checkinError;

      const aiData = checkinType === 'morning' 
      const promptData = checkinType === 'morning' 
        ? { sleepHours: sleepHoursFloat, energyLevel: parseInt(energyLevel, 10) }
        : { waterGlasses: waterInt, ateHealthy: foodBool, wasActive: activeBool, freeTime: freeTimeInt };

      // Generate both tasks concurrently
      const aiTask = await generateDailyTask(checkinType, promptData);
      const minimalTask = await generateMinimalTask(checkinType, promptData, aiTask.title);

      // Save main task to Supabase
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

      // Save minimal task to Supabase
      const { error: minimalTaskError } = await supabase.from('tasks').insert({
        user_id: user?.id,
        checkin_id: checkinData.id,
        title: minimalTask.title,
        description: minimalTask.description,
        category: minimalTask.category,
        difficulty: minimalTask.difficulty,
        is_completed: false,
        is_minimal: true
      });

      if (minimalTaskError) throw minimalTaskError;

      localStorage.setItem('latest_task_id', taskData.id);

      // Show success screen instead of immediate navigation
      setIsCompleted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkinType === 'none') {
    return (
      <div className="daily-checkin-page">
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
          <h2>השאלון סגור כרגע</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>השאלון זמין בבוקר (5:00-12:00) ובערב (17:00-23:00)</p>
          <button className="submit-btn" onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }}>חזרה לבית</button>
        </div>
      </div>
    );
  }

  if (isAlreadyCompleted) {
    const isMorning = checkinType === 'morning';
    return (
      <div className="daily-checkin-page">
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
            השאלון של ה{isMorning ? 'בוקר' : 'ערב'} כבר הושלם.
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            נתראה ה{isMorning ? 'ערב' : 'מחר בבוקר'} 🌿
          </p>
          <button className="submit-btn" onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }}>חזרה לבית</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="daily-checkin-page">
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>מכין לך משימה...</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>זה עשוי לקחת כמה שניות</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="daily-checkin-page">
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>השאלון הושלם בהצלחה! 🌟</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>המשימה שלך מוכנה.</p>
          <button className="submit-btn" onClick={() => navigate('/task')}>לצפייה במשימה</button>
        </div>
      </div>
    );
  }

  const isMorning = checkinType === 'morning';

  return (
    <div className="daily-checkin-page">
      <ProgressBar 
        subtitle={isMorning ? "שאלון בוקר" : "שאלון ערב"}
        title={isMorning ? "בוקר טוב! איך התעוררת?" : "ערב טוב! איך עבר היום?"}
        current={isMorning ? 2 : 3}
        total={isMorning ? 2 : 3}
      />
      
      <section className="questions-section">
        
        {isMorning && (
          <>
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
          </>
        )}

        {!isMorning && (
          <>
            <QuestionCard 
              icon="water_drop" 
              question="כמה כוסות מים שתית היום?" 
              error={missingFields.includes('water') ? "שדה חובה — בחר כדי להמשיך" : ""}
            >
              <div className="grid-cols-2">
                {waterOptions.map(opt => (
                  <PillButton 
                    key={opt} 
                    label={opt} 
                    selected={waterGlasses === opt} 
                    onClick={() => setWaterGlasses(opt)} 
                  />
                ))}
              </div>
            </QuestionCard>

            <QuestionCard 
              icon="restaurant" 
              question="האם אכלת בריא היום?" 
              error={missingFields.includes('food') ? "שדה חובה — בחר כדי להמשיך" : ""}
            >
              <div className="flex-between">
                {foodOptions.map(opt => (
                  <PillButton 
                    key={opt} 
                    label={opt} 
                    selected={ateHealthy === opt} 
                    onClick={() => setAteHealthy(opt)} 
                  />
                ))}
              </div>
            </QuestionCard>

            <QuestionCard 
              icon="fitness_center" 
              question="האם היית פעילה היום?" 
              error={missingFields.includes('activity') ? "שדה חובה — בחר כדי להמשיך" : ""}
            >
              <div className="flex-between">
                {['כן', 'לא'].map(opt => (
                  <PillButton 
                    key={opt} 
                    label={opt} 
                    selected={wasActive === opt} 
                    onClick={() => setWasActive(opt)} 
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
                  label="10-20 דק'" 
                  selected={freeTime === "10-20 דק'"} 
                  onClick={() => setFreeTime("10-20 דק'")} 
                />
                <PillButton 
                  label="יותר משעה" 
                  className="col-span-2" 
                  selected={freeTime === 'יותר משעה'} 
                  onClick={() => setFreeTime('יותר משעה')} 
                />
              </div>
            </QuestionCard>
          </>
        )}

        {submitError && <div className="submit-error" style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-container)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: 'var(--space-md)' }}>{submitError}</div>}
        
        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? 'מכין לך משימה...' : 'סיים'}
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
