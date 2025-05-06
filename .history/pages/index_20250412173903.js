import dynamic from 'next/dynamic';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';

const DynamicMap = dynamic(() => import('../components/Map'), { ssr: false });

export async function getStaticProps() {
  // Fetch data kendaraan
  const vehicleRes = await fetch('http://ec2-13-239-62-109.ap-southeast-2.compute.amazonaws.com/items/daftar_kendaraan');
  const vehicleData = await vehicleRes.json();

  // Fetch data koordinat kendaraan
  const coordRes = await fetch('http://ec2-13-239-62-109.ap-southeast-2.compute.amazonaws.com/items/koordinat_kendaraan?limit=-1');
  const coordData = await coordRes.json();

  // Gabungkan data kendaraan dengan koordinatnya
  const vehiclesData = vehicleData.data.map(vehicle => {
    const vehicleCoords = coordData.data
      .filter(coord => coord.id === vehicle.id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Urutkan berdasarkan timestamp

    const positions = vehicleCoords.map(coord => [coord.latitude, coord.longitude]);

    return {
      id: vehicle.id,
      name: `${vehicle.merek} ${vehicle.model}`,
      number: vehicle.nomor_kendaraan,
      jenis_kendaraan: vehicle.jenis_kendaraan,
      positions: positions,
    };
  });

  return { props: { vehiclesData } };
}

export default function Home({ vehiclesData }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehiclesData.length > 0 ? vehiclesData[0].id : null);

  const handleSelectVehicle = (id) => {
    setSelectedVehicleId(id);
  };

  const selectedVehicle = vehiclesData.find(vehicle => vehicle.id === selectedVehicleId);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-64 p-6">
        <h2 className="text-lg font-bold mb-4">Connected Vehicles</h2>
        <ul>
          {vehiclesData.map(vehicle => (
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
      </aside>

      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">GPS Tracker Web</h1>
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
            <DynamicMap vehicles={[selectedVehicle]} />
          ) : (
            <p className="text-center text-gray-400">Select a vehicle to view on the map.</p>
          )}
        </div>

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