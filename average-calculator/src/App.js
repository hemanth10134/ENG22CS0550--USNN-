import React, { useState } from 'react';
import './App.css';

const WINDOW_SIZE = 10;
const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [windowPrevState, setWindowPrevState] = useState([]);
  const [windowCurrState, setWindowCurrState] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNumbers = async (type) => {
    setLoading(true);
    setError('');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500);

      let endpoint;
      switch(type) {
        case 'primes':
          endpoint = '/primes';
          break;
        case 'fibo':
          endpoint = '/fibo';
          break;
        case 'even':
          endpoint = '/even';
          break;
        case 'rand':
          endpoint = '/rand';
          break;
        default:
          throw new Error('Invalid number type');
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.numbers)) {
        throw new Error('Invalid response format');
      }
      return data.numbers;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection or try again later.');
      }
      throw new Error('Error fetching numbers: ' + error.message);
    }
  };

  const handleNumberRequest = async (type) => {
    try {
      setWindowPrevState([...windowCurrState]);
      const newNumbers = await fetchNumbers(type);
      setNumbers(newNumbers);

      // Add unique numbers to current state
      const uniqueNumbers = [...new Set(newNumbers)];
      let newWindowState = [...windowCurrState];

      for (let num of uniqueNumbers) {
        if (newWindowState.length >= WINDOW_SIZE) {
          newWindowState.shift(); // Remove oldest number
        }
        newWindowState.push(num);
      }

      setWindowCurrState(newWindowState);

      // Calculate average if we have enough numbers
      if (newWindowState.length > 0) {
        const avg = newWindowState.reduce((a, b) => a + b, 0) / newWindowState.length;
        setAverage(Number(avg.toFixed(2)));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Average Calculator</h1>
      <div className="button-container">
        <button onClick={() => handleNumberRequest('primes')} disabled={loading}>Prime Numbers</button>
        <button onClick={() => handleNumberRequest('fibo')} disabled={loading}>Fibonacci Numbers</button>
        <button onClick={() => handleNumberRequest('even')} disabled={loading}>Even Numbers</button>
        <button onClick={() => handleNumberRequest('rand')} disabled={loading}>Random Numbers</button>
      </div>

      {error && <div className="error">{error}</div>}
      
      <div className="result-container">
        <h2>Results:</h2>
        <pre>
          {
            JSON.stringify({
              windowPrevState,
              windowCurrState,
              numbers,
              avg: average
            }, null, 2)
          }
        </pre>
      </div>
    </div>
  );
}

export default App;
