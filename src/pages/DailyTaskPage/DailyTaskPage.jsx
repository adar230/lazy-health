import React from 'react';
import TaskCard from '../../components/TaskCard/TaskCard';
import FallbackTaskCard from '../../components/FallbackTaskCard/FallbackTaskCard';
import MotivationalSection from '../../components/MotivationalSection/MotivationalSection';
import './DailyTaskPage.css';

const DailyTaskPage = () => {
  return (
    <div className="daily-task-page">
      <section className="task-page-header">
        <p className="task-page-subtitle">המשימה שלך להיום</p>
        <h2 className="task-page-title">יש לך 20 דקות — בואי נשתמש בהן</h2>
        <div className="streak-container">
          <span className="streak-text">7 ימים ברצף — כל הכבוד!</span>
          <span className="material-symbols-outlined streak-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
        </div>
      </section>

      <TaskCard 
        icon="directions_walk"
        title="הליכה של 15 דקות"
        description="צאי החוצה, שאפי אוויר צח, זז'י קצת."
        categoryIcon="fitness_center"
        categoryName="פעילות גופנית"
      />

      <FallbackTaskCard 
        icon="water_drop"
        label="משימה מינימלית חלופית"
        description="שתי כוס מים עכשיו. זה הכל. גם זה נחשב."
        buttonText="גם את זה עשיתי"
      />

      <MotivationalSection 
        imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDyCuApFxnIb9aUiY9u1pnDMjUs43R2cdVQMRsA2utbxzdAv-WtQlIgDlg78NrrMLJhV5CR4clcODyvvAUx00wc-NhEyni-Oy7k3M-xyVSG0lkyzi85KBNdtaGYkohl-K23EEu-lG_hejUx8nxvae6aB-pWPXfkn-EJZ5z8tbpryAb3bGzxkntbJE1z4FY3qvgTnYbYWTromQ1ixCSnbcTs75yBUvrR7Wg_-U6tOKi0jt1x0aNFrYkGpgMnezFC9A4rjMQgjrQ1fZ0c"
        quote="הדרך הקלה ביותר להתחיל היא פשוט לעשות משהו קטן."
      />
    </div>
  );
};

export default DailyTaskPage;
