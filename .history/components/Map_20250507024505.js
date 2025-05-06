import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
});

// Create custom icons for different vehicle types
const carIcon = new L.Icon({
  iconUrl: '/car.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const motorcycleIcon = new L.Icon({
  iconUrl: '/motorcycle.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function Map({ vehicles, useFilteredData = true }) {
  // Default center if no valid positions - using Bandung coordinates
  const defaultCenter = [-6.914744, 107.609810];
  
  // Safely extract the center position
  let center = defaultCenter;
  if (vehicles && vehicles.length > 0) {
    const vehicle = vehicles[0];
    const positions = useFilteredData ? vehicle.positions : vehicle.rawPositions;
    
    if (positions && positions.length > 0) {
      const lastPos = positions[positions.length - 1];
      // Ensure we have a valid array with two numeric values
      if (Array.isArray(lastPos) && lastPos.length === 2 && 
          typeof lastPos[0] === 'number' && typeof lastPos[1] === 'number') {
        center = lastPos;
      }
    }
  }

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={18}
        className="h-96"
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {vehicles && vehicles.map(vehicle => {
          const rawPositions = vehicle.rawPositions || [];
          const filteredPositions = vehicle.positions || [];
          
          return (
            <div key={vehicle.id}>
              {useFilteredData && filteredPositions.length > 0 ? (
                <>
                  <Polyline positions={filteredPositions} color="blue" weight={4} />
                  <Marker
                    position={filteredPositions[filteredPositions.length - 1]}
                    icon={vehicle.jenis_kendaraan === 'MOBIL' ? carIcon : motorcycleIcon}
                  >
                    <Popup>
                      {vehicle.name} - Last Position (Filtered)
                      <br />
                      {vehicle.timestamps && vehicle.timestamps.length > 0 
                        ? vehicle.timestamps[vehicle.timestamps.length - 1] 
                        : 'No timestamp'}
                    </Popup>
                  </Marker>
                </>
              ) : rawPositions.length > 0 ? (
                <>
                  <Polyline positions={rawPositions} color="red" weight={4} />
                  <Marker
                    position={rawPositions[rawPositions.length - 1]}
                    icon={vehicle.jenis_kendaraan === 'MOBIL' ? carIcon : motorcycleIcon}
                  >
                    <Popup>
                      {vehicle.name} - Last Position (Raw)
                      <br />
                      {vehicle.timestamps && vehicle.timestamps.length > 0 
                        ? vehicle.timestamps[vehicle.timestamps.length - 1] 
                        : 'No timestamp'}
                    </Popup>
                  </Marker>
                </>
              ) : null}
              
              {/* Optionally show both lines for comparison */}
              {useFilteredData && rawPositions.length > 0 && (
                <Polyline positions={rawPositions} color="red" weight={2} opacity={0.3} dashArray="5,10" />
              )}
            </div>
          );
        })}
      </MapContainer>
      
      <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-80 p-2 rounded-md text-white text-xs">
        <div className="flex items-center mb-1">
          <div className="w-4 h-1 bg-blue-500 mr-2"></div>
          <span>Filtered GPS Data</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-red-500 mr-2"></div>
          <span>Raw GPS Data</span>
        </div>
      </div>
    </div>
  );
}