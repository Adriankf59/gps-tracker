// pages/index.js
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import 'leaflet/dist/leaflet.css';
import KalmanFilter from '../utils/KalmanFilter';

const DynamicMap = dynamic(() => import('../components/Map'), { ssr: false });

// Fungsi fetcher untuk SWR dengan error handling
const fetcher = async (url) => {
  console.log(`Fetching data from: ${url}`);
  try {
    const response = await fetch(url);
    
    // Log respons HTTP untuk debugging
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response:`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Data received from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
};

export default function Home() {
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [useFilteredData, setUseFilteredData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});

  // Debug mode
  const [showDebug, setShowDebug] = useState(false);

  // Fetch kendaraan dengan polling 10 detik
  const { 
    data: vehicleData, 
    error: vehicleError, 
    isLoading: isLoadingVehicles 
  } = useSWR(
    '/api/proxy/items/daftar_kendaraan',
    fetcher,
    { 
      refreshInterval: 10000,      // Polling setiap 10 detik
      revalidateOnFocus: false,    // Hindari fetch ulang saat focus
      dedupingInterval: 5000       // Dedupe interval 5 detik
    }
  );

  // Fetch koordinat dengan polling 5 detik
  const { 
    data: coordData, 
    error: coordError, 
    isLoading: isLoadingCoords 
  } = useSWR(
    '/api/proxy/items/koordinat_kendaraan?limit=-1',
    fetcher,
    { 
      refreshInterval: 5000,       // Polling lebih sering untuk koordinat (5 detik)
      revalidateOnFocus: false,    // Hindari fetch ulang saat focus
      dedupingInterval: 2000       // Dedupe interval 2 detik
    }
  );

  // Process data when available
  useEffect(() => {
    if (!isProcessing && vehicleData && coordData) {
      console.log("Mulai memproses data...");
      setIsProcessing(true);
      
      try {
        // Prepare new array to hold processed data
        const processedVehicles = [];
        
        // Keep original data for debugging
        setDebugInfo({
          rawVehicleData: vehicleData,
          rawCoordData: coordData
        });
        
        // Process each vehicle
        if (vehicleData.data && Array.isArray(vehicleData.data)) {
          vehicleData.data.forEach(vehicle => {
            // Get coords for this vehicle
            const vehicleCoords = coordData.data && Array.isArray(coordData.data) 
              ? coordData.data.filter(coord => coord.id === vehicle.id)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              : [];
            
            // Validate coords
            const validCoords = vehicleCoords.filter(coord => 
              typeof coord.latitude === 'number' && !isNaN(coord.latitude) &&
              typeof coord.longitude === 'number' && !isNaN(coord.longitude)
            );
            
            // Create processedVehicle object
            const processedVehicle = {
              id: vehicle.id,
              name: `${vehicle.merek || ''} ${vehicle.model || ''}`.trim() || `Vehicle ${vehicle.id}`,
              number: vehicle.nomor_kendaraan || '',
              jenis_kendaraan: vehicle.jenis_kendaraan || '',
              rawPositions: validCoords.map(coord => [coord.latitude, coord.longitude]),
              positions: [],
              timestamps: validCoords.map(coord => coord.timestamp)
            };
            
            // Apply Kalman filter if we have valid coords
            if (validCoords.length > 0) {
              const kalmanFilter = new KalmanFilter({ Q: 0.01, R: 4 });
              
              let lastTimestamp = null;
              validCoords.forEach(coord => {
                const currentTimestamp = new Date(coord.timestamp);
                const deltaTime = lastTimestamp 
                  ? Math.max(0.1, (currentTimestamp - lastTimestamp) / 1000) 
                  : 1;
                
                const filtered = kalmanFilter.filter(coord.latitude, coord.longitude, deltaTime);
                processedVehicle.positions.push([filtered.latitude, filtered.longitude]);
                lastTimestamp = currentTimestamp;
              });
            }
            
            processedVehicles.push(processedVehicle);
          });
        }
        
        console.log("Data berhasil diproses:", processedVehicles);
        setProcessedData(processedVehicles);
        
        // Set default selected vehicle if not already set
        if (!selectedVehicleId && processedVehicles.length > 0) {
          setSelectedVehicleId(processedVehicles[0].id);
        }
      } catch (err) {
        console.error("Error memproses data:", err);
        setDebugInfo(prev => ({
          ...prev,
          processingError: err.message
        }));
      } finally {
        setIsProcessing(false);
      }
    }
  }, [vehicleData, coordData, selectedVehicleId, isProcessing]);

  // Toggle debug mode
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  // Handlers
  const handleSelectVehicle = (id) => {
    setSelectedVehicleId(id);
  };

  const toggleFilterMode = () => {
    setUseFilteredData(!useFilteredData);
  };

  // Error state
  if (vehicleError || coordError) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white items-center justify-center flex-col p-6">
        <h2 className="text-xl font-bold text-red-500 mb-4">Error Loading Data</h2>
        {vehicleError && <p className="text-red-400 mb-2">Vehicle data error: {vehicleError.message}</p>}
        {coordError && <p className="text-red-400 mb-2">Coordinate data error: {coordError.message}</p>}
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Retry
        </button>
        <button 
          onClick={toggleDebug} 
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          {showDebug ? "Hide Debug Info" : "Show Debug Info"}
        </button>
        {showDebug && (
          <pre className="mt-6 bg-gray-800 p-4 rounded-md overflow-auto max-h-96 w-full text-xs">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // Loading state with more info
  if (isLoadingVehicles || isLoadingCoords || isProcessing) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white items-center justify-center flex-col p-6">
        <p className="text-xl mb-4">Loading data...</p>
        <div className="flex flex-col items-start text-sm text-gray-400">
          <p>Vehicle data: {isLoadingVehicles ? "Loading..." : "✓ Loaded"}</p>
          <p>Coordinate data: {isLoadingCoords ? "Loading..." : "✓ Loaded"}</p>
          <p>Processing: {isProcessing ? "Processing..." : "Waiting..."}</p>
        </div>
        <button 
          onClick={toggleDebug} 
          className="mt-6 bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          {showDebug ? "Hide Debug Info" : "Show Debug Info"}
        </button>
        {showDebug && (
          <pre className="mt-6 bg-gray-800 p-4 rounded-md overflow-auto max-h-96 w-full text-xs">
            {JSON.stringify({
              vehicleDataStatus: isLoadingVehicles ? "loading" : "loaded",
              coordDataStatus: isLoadingCoords ? "loading" : "loaded",
              processing: isProcessing,
              ...debugInfo
            }, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // Check if we have data to display
  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white items-center justify-center flex-col p-6">
        <p className="text-xl mb-4">No vehicle data available</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Refresh
        </button>
        <button 
          onClick={toggleDebug} 
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          {showDebug ? "Hide Debug Info" : "Show Debug Info"}
        </button>
        {showDebug && (
          <pre className="mt-6 bg-gray-800 p-4 rounded-md overflow-auto max-h-96 w-full text-xs">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // Get selected vehicle
  const selectedVehicle = processedData.find(vehicle => vehicle.id === selectedVehicleId);

  // Main UI
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-64 p-6">
        <h2 className="text-lg font-bold mb-4">Connected Vehicles</h2>
        <ul>
          {processedData.map(vehicle => (
            <li key={vehicle.id} className="mb-2">
              <button
                onClick={() => handleSelectVehicle(vehicle.id)}
                className={`block p-4 rounded-md cursor-pointer ${selectedVehicleId === vehicle.id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <div className="text-sm font-medium">{vehicle.name}</div>
                <div className="text-xs">{vehicle.number}</div>
              </button>
            </li>
          ))}
        </ul>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Kalman Filter</h3>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={useFilteredData}
              onChange={toggleFilterMode}
              className="mr-2"
            />
            {useFilteredData ? 'Filtered Data' : 'Raw Data'}
          </label>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={toggleDebug}
            className="text-xs text-gray-400 hover:text-white"
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>
      </aside>

      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">GPS Tracker Web</h1>
          <div className="text-sm text-green-400">
            Live Updates Active
          </div>
          <nav>
            <ul className="flex space-x-4 text-sm">
              <li>Home</li>
              <li>Map</li>
              <li>Settings</li>
            </ul>
          </nav>
        </header>

        <div className="relative">
          {selectedVehicle ? (
            <DynamicMap 
              vehicles={[selectedVehicle]} 
              useFilteredData={useFilteredData}
            />
          ) : (
            <p className="text-center text-gray-400">Select a vehicle to view on the map.</p>
          )}
        </div>

        {showDebug && (
          <div className="mt-6 bg-gray-800 p-4 rounded-md overflow-auto max-h-96">
            <h3 className="text-sm font-bold mb-2">Debug Information</h3>
            <pre className="text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <footer className="flex justify-between items-center mt-6">
          <p>Speed: 60 km/h</p>
          <p>Distance: 15 km</p>
          <p>ETA: 20 min</p>
          <button className="bg-gray-700 text-white px-4 py-2 rounded-md">View Details</button>
        </footer>
      </main>
    </div>
  );
}