import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const Modal = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>X</button>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

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
  const [hasAttempted, setHasAttempted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setShowModal(true);
      setModalMessage(`Time is up! You scored ${score} out of ${totalQuestions}.`);
      setIsGameActive(false);
    }

    return () => clearInterval(timer);
  }, [isGameActive, useTimer, timeRemaining]);

  const loadFlag = () => {
    if (flags.length > 0) {
      const flag = flags[currentFlagIndex];
      document.getElementById('flag-image').src = flag.src;
    }
  };

  const generateOptions = () => {
    if (flags.length > 0) {
      const correctOption = flags[currentFlagIndex].country;
      const incorrectOptions = flags
        .filter((_, index) => index !== currentFlagIndex)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(flag => flag.country);
      const newOptions = [...incorrectOptions, correctOption].sort(() => 0.5 - Math.random());
      setOptions(newOptions);
    }
  };

  const checkAnswer = (answer) => {
    setHasAttempted(true);
    setTotalQuestions(prev => prev + 1);

    if (answer.toLowerCase() === flags[currentFlagIndex].country.toLowerCase()) {
      setScore(prev => prev + 1);
      setResultMessage('Correct!');
    } else {
      setResultMessage(`Wrong! The correct answer is ${flags[currentFlagIndex].country}.`);
    }

    setTimeout(() => {
      setHasAttempted(false);
      setResultMessage('');
      setCurrentFlagIndex(prev => (prev + 1) % flags.length);
      setUserAnswer('');
    }, 2000);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !hasAttempted && userAnswer.trim() !== '') {
      checkAnswer(userAnswer);
    }
  };

  const startGame = () => {
    setIsGameActive(true);
    setShowModal(false);
    setTimeRemaining(initialTime);
  };

  const resetScore = () => {
    setScore(0);
    setTotalQuestions(0);
    setTimeRemaining(initialTime);
    setIsGameActive(false);
    setUserAnswer('');
    setModalMessage(`Score has been reset. You can start a new game. Your score was ${score} / ${totalQuestions}.`);
    setShowModal(true);
  };

  const resetGame = () => {
    setScore(0);
    setTotalQuestions(0);
    setCurrentFlagIndex(0);
    setTimeRemaining(initialTime);
    setIsGameActive(false);
    setUserAnswer('');
    setModalMessage(`Game has been restarted. You can start a new game. Your score was ${score} / ${totalQuestions}.`);
    setShowModal(true);
  };

  const afterModal = () => {
    setShowModal(false);
    setScore(0);
    setTotalQuestions(0);
    setTimeRemaining(initialTime);
    setIsGameActive(false);
    setUserAnswer('');
  };

  const afterModalTotal = () => {
    setShowModal(false);
    setScore(0);
    setTotalQuestions(0);
    setTimeRemaining(initialTime);
    setIsGameActive(false);
    setCurrentFlagIndex(0);
    setUserAnswer('');
  };

  return (
    <div>
      <header>Guess the Country Flag &#127884;</header>
      <div className="container">
        <div className="left-column">
        {!isGameActive && (
          <div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={useTimer}
                  onChange={() => setUseTimer(!useTimer)}
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
            <div className="radio-group">
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
            <button onClick={startGame} disabled={isGameActive}>Start Game!</button>
          </div>
        )}
        </div>
        <div className='left-column'>
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
                  onKeyDown={handleKeyPress}
                  placeholder="Enter country name"
                  disabled={!isGameActive || hasAttempted}
                />
                <button onClick={() => checkAnswer(userAnswer)} disabled={!isGameActive || hasAttempted}>Submit Answer</button>
              </>
            ) : (
              <div>
                {options.map((option, index) => (
                  <button key={index} onClick={() => checkAnswer(option)} disabled={!isGameActive || hasAttempted}>
                    {option}
                  </button>
                ))}
              </div>
            )}
            <p>{resultMessage}</p>
            <p>Score: {score} / {totalQuestions}</p>
            <button onClick={resetScore} disabled={!isGameActive}>Reset Score (Keeps Flag Progress)</button>
            <button onClick={resetGame} disabled={!isGameActive}>Restart Game From Beginning</button>
          </>
        )}
        </div>
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <h2>{modalMessage.includes('Time is up') ? 'Time is up! Game over.' : 'Game Notification'}</h2>
          <p>{modalMessage}</p>
          <div> {modalMessage.includes ('Time is up') ? 
          <div>
          <button onClick={afterModal}>Close and Start From Current Flag</button>
          <button onClick={afterModalTotal}>Close and Restart Whole Game </button>
          </div> : <button onClick={afterModal}>Close</button>}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FlagGame;
