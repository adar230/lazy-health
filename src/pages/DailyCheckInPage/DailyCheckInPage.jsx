import React from 'react';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import PillButton from '../../components/PillButton/PillButton';
import './DailyCheckInPage.css';

const DailyCheckInPage = () => {
  return (
    <div className="daily-checkin-page">
      <ProgressBar 
        subtitle="שאלון בוקר"
        title="בוקר טוב! איך התעוררת?"
        current={2}
        total={3}
      />
      
      <section className="questions-section">
        <QuestionCard icon="bedtime" question="כמה שעות ישנת?">
          <div className="grid-cols-2">
            <PillButton label="פחות מ-5" />
            <PillButton label="6—7" />
            <PillButton label="7—8" selected />
            <PillButton label="יותר מ-8" />
          </div>
        </QuestionCard>

        <QuestionCard icon="sentiment_satisfied" question="איך את מרגישה?">
          <div className="flex-between">
            <PillButton label="1" className="square-btn" />
            <PillButton label="2" className="square-btn" />
            <PillButton label="3" selected className="square-btn" />
            <PillButton label="4" className="square-btn" />
            <PillButton label="5" className="square-btn" />
          </div>
        </QuestionCard>

        <QuestionCard 
          icon="schedule" 
          question="כמה זמן פנוי יש לך?" 
          error="שדה חובה — בחר כדי להמשיך"
        >
          <div className="grid-cols-2">
            <PillButton label="פחות מ-10" />
            <PillButton label="10—20 דק'" />
            <PillButton label="יותר משעה" className="col-span-2" />
          </div>
        </QuestionCard>

        <button className="submit-btn">שלח ועבור למשימה</button>
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
