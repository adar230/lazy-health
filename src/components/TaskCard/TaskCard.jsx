import React from 'react';
import './TaskCard.css';

const TaskCard = ({ icon, title, description, categoryIcon, categoryName, onComplete, onSkip }) => {
  return (
    <section className="task-card">
      <div className="task-card-header">
        <div className="task-icon-container">
          <span className="material-symbols-outlined task-icon">{icon}</span>
        </div>
        <div className="task-text-container">
          <h3 className="task-title">{title}</h3>
          <p className="task-desc">{description}</p>
        </div>
      </div>
      
      <div className="task-actions">
        <button className="task-btn-primary" onClick={onComplete}>השלמתי</button>
        <button className="task-btn-secondary" onClick={onSkip}>אין לי כוח</button>
      </div>
      
      <div className="task-category">
        <span className="material-symbols-outlined category-icon">{categoryIcon}</span>
        <span className="category-text">{categoryName}</span>
      </div>
    </section>
  );
};

export default TaskCard;
