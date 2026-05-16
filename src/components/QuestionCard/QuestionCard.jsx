import React from 'react';
import ErrorState from '../ErrorState/ErrorState';
import './QuestionCard.css';

const QuestionCard = ({ icon, question, error, children }) => {
  return (
    <div className={`question-card ${error ? 'has-error' : ''}`}>
      <div className="question-header">
        <span className={`material-symbols-outlined question-icon ${error ? 'error-text' : ''}`}>
          {icon}
        </span>
        <h3 className="question-title">{question}</h3>
      </div>
      <div className="question-content">
        {children}
      </div>
      <ErrorState message={error} />
    </div>
  );
};

export default QuestionCard;
