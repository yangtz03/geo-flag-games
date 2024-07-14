import React from 'react';
import FlagGame from './FlagGamex.tsx';
import './App.css'

function App() {

  return (
    <div className="App">
      <FlagGame />
    </div>
  );
}

export default App

/* if (currentFlagIndex === 0) {
      setCurrentFlagIndex(0);
    } else {
      setCurrentFlagIndex(currentFlagIndex + 1)
    }  Your final score is ${score} out of ${totalQuestions}.*/