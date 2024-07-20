import React, { useState, useRef, useEffect } from 'react';

interface EditableScoreProps {
  initialScore: string;
  onScoreChange: (newScore: number) => void;
  isAdmin: boolean;
}

const EditableScore: React.FC<EditableScoreProps> = ({ initialScore, onScoreChange, isAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [score, setScore] = useState(initialScore || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setScore(initialScore || '');
  }, [initialScore]);

  const handleClick = () => {
    if (isAdmin) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const newScore = parseInt(score, 10);
    if (!isNaN(newScore)) {
      onScoreChange(newScore);
    } else {
      setScore(initialScore || '');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setScore(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const scoreStyle: React.CSSProperties = {
    width: '30px',
    textAlign: 'right',
    padding: '0 4px',
    boxSizing: 'border-box',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  };

  if (isEditing) {
    return (
        <span className="score">
        <input
            ref={inputRef}
            type="text"
            value={score}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={scoreStyle}
      />
      </span>
    );
  }

  return <span className="score" onClick={handleClick} style={scoreStyle}>{score}</span>;
};

export default EditableScore;