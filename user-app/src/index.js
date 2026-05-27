import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Razorpay script load karo
const script = document.createElement('script');
script.src = 'https://checkout.razorpay.com/v1/checkout.js';
document.head.appendChild(script);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
