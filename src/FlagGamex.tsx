import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlagGame = () => {
  const [flags, setFlags] = useState([]);
  const [currentFlagIndex, setCurrentFlagIndex] = useState(() => {
    const savedIndex = localStorage.getItem('currentFlagIndex');
    return savedIndex !== null ? JSON.parse(savedIndex) : 0;
  });
  const [userAnswer, setUserAnswer] = useState(() => {
    const savedUserAnswer = localStorage.getItem('userAnswer');
    return savedUserAnswer !== null ? savedUserAnswer : '';
  });
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

  const [timeRemaining, setTimeRemaining] = useState(() => {
    const savedTimeRemaining = localStorage.getItem('timeRemaining');
    return savedTimeRemaining !== null ? JSON.parse(savedTimeRemaining) : 60; // Default to 60 seconds
  });
  const [initialTime, setInitialTime] = useState(() => {
    const savedInitialTime = localStorage.getItem('initialTime');
    return savedInitialTime !== null ? JSON.parse(savedInitialTime) : 60;
  });
  const [isGameActive, setIsGameActive] = useState(() => {
    const savedIsGameActive = localStorage.getItem('isGameActive');
    return savedIsGameActive !== null ? JSON.parse(savedIsGameActive) : false;
  });
  const [useTimer, setUseTimer] = useState(() => {
    const savedUseTimer = localStorage.getItem('useTimer');
    return savedUseTimer !== null ? JSON.parse(savedUseTimer) : false;
  });
  const [gameMode, setGameMode] = useState(() => {
    const savedGameMode = localStorage.getItem('gameMode');
    return savedGameMode !== null ? savedGameMode : 'text';
  });
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
    localStorage.setItem('currentFlagIndex', JSON.stringify(currentFlagIndex));
  }, [currentFlagIndex]);

  useEffect(() => {
    localStorage.setItem('userAnswer', userAnswer);
  }, [userAnswer]);

  useEffect(() => {
    localStorage.setItem('score', JSON.stringify(score));
  }, [score]);

  useEffect(() => {
    localStorage.setItem('totalQuestions', JSON.stringify(totalQuestions));
  }, [totalQuestions]);

  useEffect(() => {
    localStorage.setItem('timeRemaining', JSON.stringify(timeRemaining));
  }, [timeRemaining]);

  useEffect(() => {
    localStorage.setItem('initialTime', JSON.stringify(initialTime));
  }, [initialTime]);

  useEffect(() => {
    localStorage.setItem('useTimer', JSON.stringify(useTimer));
  }, [useTimer]);

  useEffect(() => {
    localStorage.setItem('gameMode', gameMode);
  }, [gameMode]);

  useEffect(() => {
    localStorage.setItem('isGameActive', JSON.stringify(isGameActive));
  }, [isGameActive]);

  useEffect(() => {
    let timer;
    if (isGameActive && useTimer && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isGameActive && useTimer) {
      alert('Time is up! Game over.');
      resetGame();
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
    }, 2000);
  };

  const resetScore = () => {
    setScore(0);
    setTotalQuestions(0);
    setCurrentFlagIndex(0);
    setUserAnswer('');
    setResultMessage('');
    localStorage.removeItem('score');
    localStorage.removeItem('totalQuestions');
    localStorage.removeItem('currentFlagIndex');
    localStorage.removeItem('userAnswer');
    localStorage.removeItem('timeRemaining');
    localStorage.removeItem('initialTime');
    localStorage.removeItem('useTimer');
    localStorage.removeItem('gameMode');
    localStorage.removeItem('isGameActive');
    setTimeRemaining(60);
    setInitialTime(60);
    setUseTimer(false);
    setGameMode('text');
    setIsGameActive(false);
  };

  const resetGame = () => {
    setScore(0);
    setTotalQuestions(0);
    setCurrentFlagIndex(0);
    setUserAnswer('');
    setResultMessage('');
    setTimeRemaining(60);
    setInitialTime(60);
    setUseTimer(false);
    setGameMode('text');
    setIsGameActive(false);
    localStorage.removeItem('score');
    localStorage.removeItem('totalQuestions');
    localStorage.removeItem('currentFlagIndex');
    localStorage.removeItem('userAnswer');
    localStorage.removeItem('timeRemaining');
    localStorage.removeItem('initialTime');
    localStorage.removeItem('useTimer');
    localStorage.removeItem('gameMode');
    localStorage.removeItem('isGameActive');
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
    </div>
  );
};

export default FlagGame;




