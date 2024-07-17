import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import axios from 'axios';
import './App.css';

interface CountryFlag {
  country: string;
  src: string;
}

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
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

const FlagGame: React.FC = () => {
  const [flags, setFlags] = useState<CountryFlag[]>([]);
  const [currentFlagIndex, setCurrentFlagIndex] = useState<number>(() => {
    const savedIndex = localStorage.getItem('currentFlagIndex');
    return savedIndex !== null ? JSON.parse(savedIndex) : 0;
  });
  const [userAnswer, setUserAnswer] = useState<string>(() => {
    const savedUserAnswer = localStorage.getItem('userAnswer');
    return savedUserAnswer !== null ? savedUserAnswer : '';
  });
  const [resultMessage, setResultMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [score, setScore] = useState<number>(() => {
    const savedScore = localStorage.getItem('score');
    return savedScore !== null ? JSON.parse(savedScore) : 0;
  });
  const [totalQuestions, setTotalQuestions] = useState<number>(() => {
    const savedTotalQuestions = localStorage.getItem('totalQuestions');
    return savedTotalQuestions !== null ? JSON.parse(savedTotalQuestions) : 0;
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    const savedTimeRemaining = localStorage.getItem('timeRemaining');
    return savedTimeRemaining !== null ? JSON.parse(savedTimeRemaining) : 60; // Default to 60 seconds
  });
  const [initialTime, setInitialTime] = useState<number>(() => {
    const savedInitialTime = localStorage.getItem('initialTime');
    return savedInitialTime !== null ? JSON.parse(savedInitialTime) : 60;
  });
  const [isGameActive, setIsGameActive] = useState<boolean>(() => {
    const savedIsGameActive = localStorage.getItem('isGameActive');
    return savedIsGameActive !== null ? JSON.parse(savedIsGameActive) : false;
  });
  const [useTimer, setUseTimer] = useState<boolean>(() => {
    const savedUseTimer = localStorage.getItem('useTimer');
    return savedUseTimer !== null ? JSON.parse(savedUseTimer) : false;
  });
  const [gameMode, setGameMode] = useState<string>(() => {
    const savedGameMode = localStorage.getItem('gameMode');
    return savedGameMode !== null ? savedGameMode : 'text';
  });
  const [options, setOptions] = useState<string[]>([]);
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countries: CountryFlag[] = response.data.map((country: any) => ({
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
    let timer: NodeJS.Timeout;
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
      (document.getElementById('flag-image') as HTMLImageElement).src = flag.src;
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

  const checkAnswer = (answer: string) => {
    setHasAttempted(true);
    setTotalQuestions(totalQuestions + 1);
    if (answer.toLowerCase() === flags[currentFlagIndex].country.toLowerCase()) {
      setScore(score + 1);
      setResultMessage('Correct!');
    } else {
      setResultMessage(`Wrong! The correct answer is ${flags[currentFlagIndex].country}`);
    }
    setTimeout(() => {
      setHasAttempted(false);
      setResultMessage('');
      setCurrentFlagIndex(prev => (prev + 1) % flags.length);
      setUserAnswer('');
    }, 2000);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !hasAttempted) {
      checkAnswer(userAnswer);
    }
  };

  const startGame = () => {
    setIsGameActive(true);
    if (useTimer) {
      setTimeRemaining(initialTime);
    }
  };

  const resetScore = () => {
    setScore(0);
    setTotalQuestions(0);
    setUserAnswer('');
    setResultMessage('');
    setUseTimer(false);
    setIsGameActive(false);
    setTimeRemaining(initialTime);
    localStorage.removeItem('score');
    localStorage.removeItem('totalQuestions');
    localStorage.removeItem('userAnswer');
    localStorage.removeItem('resultMessage');
    localStorage.removeItem('useTimer');
    localStorage.removeItem('isGameActive');
    localStorage.removeItem('timeRemaining');
    localStorage.removeItem('initialTime');
    localStorage.removeItem('gameMode');
    setShowModal(true);
    setModalMessage(`Score has been reset. Please set up your game again.Your score was ${score} / ${totalQuestions}.`);
  };

  const resetGame = () => {
    setScore(0);
    setTotalQuestions(0);
    setUserAnswer('');
    setResultMessage('');
    setUseTimer(false);
    setIsGameActive(false);
    setCurrentFlagIndex(0);
    setTimeRemaining(initialTime);
    localStorage.clear();
    setShowModal(true);
    setModalMessage(`Game has been restarted. Please set up your game again. Your score was ${score} / ${totalQuestions}.`);
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header>Guess the Country Flag &#127884;</header>
      <div className="container">
        <div className="left-column">
          {!isGameActive && (
            <div>
              <label>
                <input 
                  type="checkbox" 
                  checked={useTimer} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUseTimer(e.target.checked)} 
                />
                Use Timer
              </label>
              {useTimer && (
                <input 
                  type="number" 
                  value={initialTime} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInitialTime(Number(e.target.value))} 
                  placeholder="Set timer in seconds" 
                />
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
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
  );
};

export default FlagGame;

