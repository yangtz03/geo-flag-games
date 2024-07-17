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

/* <div> {modalMessage.includes ('Time is up') ? 
          <div>
          <button onClick={afterModal}>Close and Start From Current Flag</button>
          <button onClick={afterModalTotal}>Close and Restart Whole Game </button>
          </div> : <button onClick={afterModal}>Close</button>}
          </div> */