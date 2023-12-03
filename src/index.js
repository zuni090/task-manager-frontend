import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {SharedStateProvider } from "./Context/state"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SharedStateProvider>
      <App/>
    </SharedStateProvider>
  </React.StrictMode>
);


