import React, { useState } from 'react';
import SimulationForm from './components/SimulationForm';
import SimulationResults from './components/SimulationResults';
import axios from 'axios';

function App() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/simulate/', formData);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Queue Simulation</h1>
        <SimulationForm onSimulate={handleSimulate} loading={loading} />
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}
        {results && <SimulationResults results={results} />}
      </div>
    </div>
  );
}

export default App;