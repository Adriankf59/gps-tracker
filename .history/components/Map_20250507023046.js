import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue (when using markers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
});

// Create custom icons for different vehicle types
const carIcon = new L.Icon({
  iconUrl: '/car.png', // Ensure this image is in the public directory
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const motorcycleIcon = new L.Icon({
  iconUrl: '/motorcycle.png', // Ensure this image is in the public directory
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function Map({ vehicles, useFilteredData = true }) {
  return (
    <div className="relative">
      <MapContainer
        center={vehicles.length > 0 && (useFilteredData ? vehicles[0].positions.length > 0 : vehicles[0].rawPositions.length > 0) 
          ? (useFilteredData 
              ? vehicles[0].positions[vehicles[0].positions.length - 1] 
              : vehicles[0].rawPositions[vehicles[0].rawPositions.length - 1]) 
          : [51.505, -0.09]}
        zoom={18}
        className="h-96"
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {vehicles.map(vehicle => (
          <div key={vehicle.id}>
            {/* Display either filtered or raw data based on toggle */}
            {useFilteredData ? (
              <>
                <Polyline positions={vehicle.positions} color="blue" weight={4} />
                {vehicle.positions.length > 0 && (
                  <Marker
                    position={vehicle.positions[vehicle.positions.length - 1]}
                    icon={vehicle.jenis_kendaraan === 'MOBIL' ? carIcon : motorcycleIcon}
                  >
                    <Popup>
                      {vehicle.name} - Last Position (Filtered)
                      <br />
                      {vehicle.timestamps[vehicle.timestamps.length - 1]}
                    </Popup>
                  </Marker>
                )}
              </>
            ) : (
              <>
                <Polyline positions={vehicle.rawPositions} color="red" weight={4} />
                {vehicle.rawPositions.length > 0 && (
                  <Marker
                    position={vehicle.rawPositions[vehicle.rawPositions.length - 1]}
                    icon={vehicle.jenis_kendaraan === 'MOBIL' ? carIcon : motorcycleIcon}
                  >
                    <Popup>
                      {vehicle.name} - Last Position (Raw)
                      <br />
                      {vehicle.timestamps[vehicle.timestamps.length - 1]}
                    </Popup>
                  </Marker>
                )}
              </>
            )}
            
            {/* Optionally show both lines for comparison */}
            {useFilteredData && (
              <Polyline positions={vehicle.rawPositions} color="red" weight={2} opacity={0.3} dashArray="5,10" />
            )}
          </div>
        ))}
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