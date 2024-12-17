import React, { useState } from 'react';

const SimulationForm = ({ onSimulate, loading }) => {
  const [formData, setFormData] = useState({
    lambda_rate: 0.8,
    service_rates: [1.0, 1.2],
    num_servers: [2, 2],
    simulation_time: 1000
  });

  const handleChange = (e, index, field) => {
    const { value } = e.target;
    setFormData(prev => {
      const newData = { ...prev };
      if (field === 'service_rates') {
        newData.service_rates = [...prev.service_rates];
        newData.service_rates[index] = parseFloat(value);
      } else if (field === 'num_servers') {
        newData.num_servers = [...prev.num_servers];
        newData.num_servers[index] = parseInt(value);
      } else {
        newData[field] = parseFloat(value);
      }
      return newData;
    });
  };

  const handleAddStation = () => {
    setFormData(prev => ({
      ...prev,
      service_rates: [...prev.service_rates, 1.0],
      num_servers: [...prev.num_servers, 2]
    }));
  };

  const handleRemoveStation = (index) => {
    if (formData.service_rates.length > 1) {
      setFormData(prev => ({
        ...prev,
        service_rates: prev.service_rates.filter((_, i) => i !== index),
        num_servers: prev.num_servers.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Arrival Rate (λ)</label>
          <input
            type="number"
            step="0.1"
            value={formData.lambda_rate}
            onChange={(e) => handleChange(e, null, 'lambda_rate')}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Simulation Time</label>
          <input
            type="number"
            value={formData.simulation_time}
            onChange={(e) => handleChange(e, null, 'simulation_time')}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Stations</h2>
        {formData.service_rates.map((rate, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div>
              <label className="block mb-2">Station {index + 1} Service Rate</label>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => handleChange(e, index, 'service_rates')}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Number of Servers</label>
              <input
                type="number"
                value={formData.num_servers[index]}
                onChange={(e) => handleChange(e, index, 'num_servers')}
                className="w-full p-2 border rounded"
                min="1"
                required
              />
            </div>
            {formData.service_rates.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveStation(index)}
                className="mt-6 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={handleAddStation}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Station
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-3 rounded ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {loading ? 'Simulating...' : 'Run Simulation'}
      </button>
    </form>
  );
};

export default SimulationForm;