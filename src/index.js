import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/Global.css';
import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Safely get the root element
const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("❌ Root element not found. Make sure <div id='root'></div> exists in your index.html.");
}

