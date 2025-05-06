import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DaftarKendaraan() {
  const [kendaraanList, setKendaraanList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchKendaraan = async () => {
      try {
        const response = await fetch('http://localhost:8055/items/daftar_kendaraan');
        const data = await response.json();
        setKendaraanList(data.data);
      } catch (error) {
        console.error('Error fetching kendaraan:', error);
      }
    };
    fetchKendaraan();
  }, []);

  const handleAddKendaraan = () => {
    router.push('/kendaraan/tambah');
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Daftar Kendaraan</h1>
      <button 
        onClick={handleAddKendaraan} 
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
      >
        Tambah Kendaraan Baru
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kendaraanList.map((kendaraan) => (
          <div key={kendaraan.id} className="border rounded-lg p-4 shadow-lg bg-white">
            <h2 className="text-xl font-semibold mb-2 text-black">{kendaraan.merek} {kendaraan.model}</h2>
            <ul className="space-y-1 text-black">
              <li><strong>Nomor Kendaraan:</strong> {kendaraan.nomor_kendaraan}</li>
              <li><strong>Tahun:</strong> {kendaraan.tahun_pembuatan}</li>
              <li><strong>Warna:</strong> {kendaraan.warna}</li>
              <li><strong>Jenis:</strong> {kendaraan.jenis_kendaraan}</li>
              <li><strong>Pemilik:</strong> {kendaraan.pemilik}</li>
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}