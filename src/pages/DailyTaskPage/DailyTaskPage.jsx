import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../../components/TaskCard/TaskCard';
import FallbackTaskCard from '../../components/FallbackTaskCard/FallbackTaskCard';
import MotivationalSection from '../../components/MotivationalSection/MotivationalSection';
import './DailyTaskPage.css';

const DailyTaskPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [minimalTask, setMinimalTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMinimal, setShowMinimal] = useState(false);
  const [isCompletingMain, setIsCompletingMain] = useState(false);
  const [isCompletingMinimal, setIsCompletingMinimal] = useState(false);

  useEffect(() => {
    const fetchLatestTask = async () => {
      if (!user) return;
      try {
        // Fetch the most recent task for the user or by specific ID
        const latestTaskId = localStorage.getItem('latest_task_id');
        let query = supabase.from('tasks').select('*');
        
        if (latestTaskId) {
          query = query.eq('id', latestTaskId).single();
        } else {
          query = query.eq('user_id', user.id).eq('is_minimal', false).order('created_at', { ascending: false }).limit(1).single();
        }

        const { data: taskData, error: taskError } = await query;
        
        if (latestTaskId) {
          localStorage.removeItem('latest_task_id');
        }

        if (taskData) {
          setTask(taskData);
          if (taskData.is_completed) {
            setIsCompletingMain(true);
          }
          
          // Fetch free time from the associated checkin
          if (taskData.checkin_id) {
            const { data: checkinData } = await supabase
              .from('daily_checkins')
              .select('free_time')
              .eq('id', taskData.checkin_id)
              .single();
              
            if (checkinData) {
              setTask(prev => ({ ...prev, free_time: checkinData.free_time }));
            }

            // Fetch the minimal task associated with this checkin
            const { data: minimalData, error: minErr } = await supabase
              .from('tasks')
              .select('*')
              .eq('checkin_id', taskData.checkin_id)
              .eq('is_minimal', true)
              .limit(1)
              .maybeSingle();
              
            if (minErr) console.error("Error fetching minimal task:", minErr);
              
            if (minimalData) {
              setMinimalTask(minimalData);
              if (minimalData.is_completed) {
                setIsCompletingMinimal(true);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching latest task:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestTask();
  }, [user]);

  // Format current date in Hebrew
  const currentDate = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  if (loading) {
    return (
      <div className="daily-task-page">
        <div className="loading" style={{ textAlign: 'center', marginTop: '2rem' }}>טוען את המשימה שלך...</div>
      </div>
    );
  }

  // Fallback to default if no task found
  const taskTitle = task?.title || "הליכה של 15 דקות";
  const taskDesc = task?.description || "צאי החוצה, שאפי אוויר צח, זז'י קצת.";
  const taskCategory = task?.category || "פעילות גופנית";
  
  // Use the fetched free time or fallback to 20
  const freeTime = task?.free_time || 20;

  // Map category to a nice icon
  let catIcon = "fitness_center";
  if (taskCategory.includes('שינה')) catIcon = "bedtime";
  if (taskCategory.includes('תזונה') || taskCategory.includes('אוכל')) catIcon = "restaurant";
  if (taskCategory.includes('שתייה') || taskCategory.includes('מים')) catIcon = "water_drop";
  if (taskCategory.includes('חיים') || taskCategory.includes('נפש') || taskCategory.includes('מיינדפולנס')) catIcon = "self_improvement";

  // Handlers
  const handleCompleteMain = async () => {
    if (!task || isCompletingMain) return;
    setIsCompletingMain(true);
    try {
      await supabase.from('tasks').update({ is_completed: true }).eq('id', task.id);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      console.error('Failed to complete main task', err);
      setIsCompletingMain(false);
    }
  };

  const handleCompleteMinimal = async () => {
    console.log("--- Debug Minimal Task Update ---");
    console.log("Full task object:", task);
    console.log("Minimal Task Object:", minimalTask);
    console.log("Minimal Task ID to update:", minimalTask?.id);

    if (!minimalTask || isCompletingMinimal) {
      console.warn("No minimal task found or already completing, redirecting to dashboard");
      if (!minimalTask) navigate('/dashboard');
      return;
    }
    setIsCompletingMinimal(true);
    try {
      const { data, error } = await supabase.from('tasks').update({ is_completed: true }).eq('id', minimalTask.id).select();
      console.log("Supabase Update Result:", data, error);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      console.error('Failed to complete minimal task', err);
      setIsCompletingMinimal(false);
    }
  };

  const handleSkip = () => {
    setShowMinimal(true);
  };

  return (
    <div className="daily-task-page">
      <section className="task-page-header">
        <p className="task-page-subtitle">המשימה שלך להיום, {currentDate}</p>
        <h2 className="task-page-title">יש לך {freeTime} דקות — בואי נשתמש בהן</h2>
        <div className="streak-container">
          <span className="streak-text">7 ימים ברצף — כל הכבוד!</span>
          <span className="material-symbols-outlined streak-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
        </div>
      </section>

      {!showMinimal && (
        <TaskCard 
          icon={catIcon}
          title={taskTitle}
          description={taskDesc}
          categoryIcon={catIcon}
          categoryName={taskCategory}
          onComplete={handleCompleteMain}
          onSkip={handleSkip}
          isCompleting={isCompletingMain}
        />
      )}

      <FallbackTaskCard 
        icon="water_drop"
        label={minimalTask?.title || "משימה מינימלית חלופית"}
        description={minimalTask?.description || "שתי כוס מים עכשיו. זה הכל. גם זה נחשב."}
        buttonText="גם את זה עשיתי"
        onComplete={handleCompleteMinimal}
        isCompleting={isCompletingMinimal}
      />

      <MotivationalSection 
        imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDyCuApFxnIb9aUiY9u1pnDMjUs43R2cdVQMRsA2utbxzdAv-WtQlIgDlg78NrrMLJhV5CR4clcODyvvAUx00wc-NhEyni-Oy7k3M-xyVSG0lkyzi85KBNdtaGYkohl-K23EEu-lG_hejUx8nxvae6aB-pWPXfkn-EJZ5z8tbpryAb3bGzxkntbJE1z4FY3qvgTnYbYWTromQ1ixCSnbcTs75yBUvrR7Wg_-U6tOKi0jt1x0aNFrYkGpgMnezFC9A4rjMQgjrQ1fZ0c"
        quote="הדרך הקלה ביותר להתחיל היא פשוט לעשות משהו קטן."
      />
    </div>
  );
};

export default DailyTaskPage;
