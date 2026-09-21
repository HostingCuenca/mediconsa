import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GOOGLE_CLIENT_ID } from './config/google';

// En producción no se muestra ningún log en la consola del navegador
if (process.env.NODE_ENV === 'production') {
  ['log', 'info', 'debug', 'warn', 'error', 'table', 'group', 'groupEnd', 'trace'].forEach(m => { console[m] = () => {} });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
