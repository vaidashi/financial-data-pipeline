import React, { useEffect, useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkApiHealth = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
          setApiStatus('Connected');
        } else {
          setApiStatus('API Error');
        }
      } catch (error) {
        setApiStatus('Disconnected');
      }
    };

    void checkApiHealth();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Financial Data Pipeline</h1>
        <p>Real-time financial data monitoring system</p>
        <div className="status">
          <span className={`status-indicator ${apiStatus.toLowerCase()}`}></span>
          API Status: {apiStatus}
        </div>
      </header>
    </div>
  );
};

export default App;