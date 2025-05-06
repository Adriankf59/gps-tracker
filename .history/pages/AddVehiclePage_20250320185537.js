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
    setFormData({ ...formData, [name]: value });
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
        // Menampilkan detail error dari server
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        alert(`Error occurred: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // Ketika permintaan telah dibuat tetapi tidak ada respons diterima
        console.error('Error request data:', error.request);
        alert('No response received from the server.');
      } else {
        // Kesalahan lainnya
        console.error('Error message:', error.message);
        alert('An error occurred in setting up the request.');
      }
    }
  };

  return (
    <div>
      <h1>Add Vehicle</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Model:</label>
          <input type="text" name="model" value={formData.model} onChange={handleChange} />
        </div>
        <div>
          <label>Color:</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} />
        </div>
        <div>
          <label>GPS Tracker ID:</label>
          <input type="text" name="gps_tracker_id" value={formData.gps_tracker_id} onChange={handleChange} required />
        </div>
        <div>
          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
          </select>
        </div>
        <div>
          <label>No Polisi:</label>
          <input type="text" name="no_polisi" value={formData.no_polisi} onChange={handleChange} />
        </div>
        <button type="submit">Add Vehicle</button>
      </form>
    </div>
  );
};

export default AddVehiclePage;