import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ vehicles }) {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} className="h-96">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {vehicles.map(vehicle => (
        <Marker key={vehicle.id} position={vehicle.position}>
          <Popup>
            {vehicle.name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}