import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlagGame = () => {
  const [flags, setFlags] = useState([]);
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem('score');
    return savedScore !== null ? JSON.parse(savedScore) : 0;
  });
  const [totalQuestions, setTotalQuestions] = useState(() => {
    const savedTotalQuestions = localStorage.getItem('totalQuestions');
    return savedTotalQuestions !== null ? JSON.parse(savedTotalQuestions) : 0;
  });

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTime, setInitialTime] = useState(60); // Default timer set to 60 seconds
  const [isGameActive, setIsGameActive] = useState(false);
  const [useTimer, setUseTimer] = useState(false);
  const [gameMode, setGameMode] = useState('text'); // 'text' or 'multiple-choice'
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countries = response.data.map(country => ({
          country: country.name.common,
          src: country.flags.svg
        }));
        setFlags(countries);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching flags:', error);
        setIsLoading(false);
      }
    };

    fetchFlags();
  }, []);

  useEffect(() => {
    if (flags.length > 0) {
      loadFlag();
      if (gameMode === 'multiple-choice') {
        generateOptions();
      }
    }
  }, [currentFlagIndex, flags, gameMode]);

  useEffect(() => {
    localStorage.setItem('score', JSON.stringify(score));
  }, [score]);

  useEffect(() => {
    localStorage.setItem('totalQuestions', JSON.stringify(totalQuestions));
  }, [totalQuestions]);

  useEffect(() => {
    let timer;
    if (isGameActive && useTimer && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isGameActive && useTimer) {
      setIsGameActive(false);
      alert('Time is up! Game over.');
    }

    return () => clearInterval(timer);
  }, [isGameActive, useTimer, timeRemaining]);

  const loadFlag = () => {
    const flagImage = document.getElementById('flag-image');
    if (flags[currentFlagIndex]) {
      flagImage.src = flags[currentFlagIndex].src;
    }
  };

  const generateOptions = () => {
    const correctAnswer = flags[currentFlagIndex].country;
    const incorrectOptions = flags
      .filter((_, index) => index !== currentFlagIndex)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(flag => flag.country);

    const allOptions = [correctAnswer, ...incorrectOptions].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
  };

  const checkAnswer = (answer) => {
    const correctAnswer = flags[currentFlagIndex]?.country.toLowerCase();
    if (answer.trim().toLowerCase() === correctAnswer) {
      setResultMessage('Correct!');
      setScore(score + 1);
    } else {
      setResultMessage(`Wrong! The correct answer is ${flags[currentFlagIndex]?.country}`);
    }

    setTotalQuestions(totalQuestions + 1);

    setTimeout(() => {
      setCurrentFlagIndex((currentFlagIndex + 1) % flags.length);
      setUserAnswer('');
      setResultMessage('');
      if (gameMode === 'multiple-choice') {
        generateOptions();
      }
    }, 2000);
  };

  const resetScore = () => {
    setScore(0);
    setTotalQuestions(0);
    localStorage.removeItem('score');
    localStorage.removeItem('totalQuestions');
    setIsGameActive(false);  // Set the game as inactive
  };

  const startGame = () => {
    setTimeRemaining(useTimer ? initialTime : 0);
    setIsGameActive(true);
    setCurrentFlagIndex(0);
    setScore(0);
    setTotalQuestions(0);
    setUserAnswer('');
    setResultMessage('');
    if (gameMode === 'multiple-choice') {
      generateOptions();
    }
  };

  return (
    <div className="container">
      <h1>Guess the Country Flag</h1>
      {!isGameActive && (
        <div>
          <div>
            <label>
              <input
                type="radio"
                name="timer"
                value="no"
                checked={!useTimer}
                onChange={() => setUseTimer(false)}
              />
              Play without timer
            </label>
            <label>
              <input
                type="radio"
                name="timer"
                value="yes"
                checked={useTimer}
                onChange={() => setUseTimer(true)}
              />
              Play with timer
            </label>
          </div>
          {useTimer && (
            <div>
              <label>
                Set Timer (seconds):
                <input 
                  type="number" 
                  value={initialTime}
                  onChange={(e) => setInitialTime(Number(e.target.value))}
                  disabled={isGameActive}
                />
              </label>
            </div>
          )}
          <div>
            <label>
              <input
                type="radio"
                name="gameMode"
                value="text"
                checked={gameMode === 'text'}
                onChange={() => setGameMode('text')}
              />
              Text Input Mode
            </label>
            <label>
              <input
                type="radio"
                name="gameMode"
                value="multiple-choice"
                checked={gameMode === 'multiple-choice'}
                onChange={() => setGameMode('multiple-choice')}
              />
              Multiple Choice Mode
            </label>
          </div>
          <button onClick={startGame} disabled={isGameActive}>Start Game</button>
        </div>
      )}
      {isGameActive && (
        <>
          <p>Time Remaining: {useTimer ? `${timeRemaining}s` : 'No Timer'}</p>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div id="flag-container">
                <img id="flag-image" alt="Country Flag" />
              </div>
              {gameMode === 'text' ? (
                <>
                  <input 
                    type="text" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter country name"
                    disabled={!isGameActive}
                  />
                  <button onClick={() => checkAnswer(userAnswer)} disabled={!isGameActive}>Submit</button>
                </>
              ) : (
                <div>
                  {options.map((option, index) => (
                    <button key={index} onClick={() => checkAnswer(option)} disabled={!isGameActive}>
                      {option}
                    </button>
                  ))}
                </div>
              )}
              <p>{resultMessage}</p>
              <p>Score: {score} / {totalQuestions}</p>
              <button onClick={resetScore} disabled={!isGameActive}>Reset Score</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FlagGame;
