// utils/KalmanFilter.js
export default class KalmanFilter {
    constructor(options = {}) {
      // Process noise - how much we expect our position to change between updates
      this.Q = options.Q || 0.01;
      
      // Measurement noise - how much we trust our GPS measurements
      this.R = options.R || 4.0;
      
      // Estimated state (position and velocity)
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      
      // Estimation error covariance - represents our confidence in the current state
      this.P_00 = 1;  // x variance
      this.P_01 = 0;  // x,y covariance
      this.P_10 = 0;  // y,x covariance
      this.P_11 = 1;  // y variance
      
      // First update flag
      this.firstUpdate = true;
    }
    
    // Process a new GPS measurement
    filter(lat, lng, deltaTime = 1) {
      // Validate inputs
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates passed to Kalman filter:', lat, lng);
        return { latitude: lat, longitude: lng }; // Return unfiltered values
      }
      
      // Make sure deltaTime is positive
      if (deltaTime <= 0) deltaTime = 0.1;
      
      if (this.firstUpdate) {
        this.x = lat;
        this.y = lng;
        this.firstUpdate = false;
        return { latitude: lat, longitude: lng };
      }
      
      // Prediction step - project state forward
      const x_pred = this.x + this.vx * deltaTime;
      const y_pred = this.y + this.vy * deltaTime;
      
      // Update error covariance matrix - project uncertainty forward
      const P_00_pred = this.P_00 + deltaTime * this.Q;
      const P_11_pred = this.P_11 + deltaTime * this.Q;
      
      // Compute Kalman gain - determines how much to trust the measurement vs prediction
      const K_0 = P_00_pred / (P_00_pred + this.R);
      const K_1 = P_11_pred / (P_11_pred + this.R);
      
      // Update state estimate with measurement
      this.x = x_pred + K_0 * (lat - x_pred);
      this.y = y_pred + K_1 * (lng - y_pred);
      
      // Update velocity estimates (with small limit to avoid extreme values)
      this.vx = Math.max(-1, Math.min(1, (this.x - x_pred) / deltaTime));
      this.vy = Math.max(-1, Math.min(1, (this.y - y_pred) / deltaTime));
      
      // Update error covariance
      this.P_00 = (1 - K_0) * P_00_pred;
      this.P_11 = (1 - K_1) * P_11_pred;
      
      return { latitude: this.x, longitude: this.y };
    }
    
    // Reset the filter
    reset() {
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.P_00 = 1;
      this.P_01 = 0;
      this.P_10 = 0;
      this.P_11 = 1;
      this.firstUpdate = true;
    }
  }