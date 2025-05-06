import React, { useState } from 'react';
import axios from 'axios';

const AddVehiclePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    color: '',
    gps_tracker_id: '',
    status: 'Offline',
    no_polisi: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/vehicles', formData);

      if (response.status === 201) {
        alert('Vehicle data successfully saved.');
        setFormData({
          name: '',
          model: '',
          color: '',
          gps_tracker_id: '',
          status: 'Offline',
          no_polisi: ''
        });
      } else {
        alert('Failed to save vehicle data.');
      }
    } catch (error) {
      console.error('Error saving vehicle data:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        alert(`Error occurred: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('Error request data:', error.request);
        alert('No response received from the server.');
      } else {
        console.error('Error message:', error.message);
        alert('An error occurred in setting up the request.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Add Vehicle</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Model:</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Color:</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">GPS Tracker ID:</label>
          <input
            type="text"
            name="gps_tracker_id"
            value={formData.gps_tracker_id}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
          >
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">No Polisi:</label>
          <input
            type="text"
            name="no_polisi"
            value={formData.no_polisi}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Vehicle
        </button>
      </form>
    </div>
  );
};

export default AddVehiclePage;