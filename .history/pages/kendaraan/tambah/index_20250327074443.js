import { useState } from 'react';
import { useRouter } from 'next/router';

export default function TambahKendaraan() {
  const [form, setForm] = useState({
    merek: '',
    model: '',
    nomor_kendaraan: '',
    tahun_pembuatan: '',
    warna: '',
    jenis_kendaraan: '',
    pemilik: ''
  });
  
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8055/items/daftar_kendaraan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert('Kendaraan berhasil ditambahkan!');
        router.push('/kendaraan');
      } else {
        alert('Terjadi kesalahan, coba lagi.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim data.');
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Tambah Kendaraan Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['merek', 'model', 'nomor_kendaraan', 'tahun_pembuatan', 'warna', 'jenis_kendaraan', 'pemilik'].map((field) => (
          <div key={field}>
            <label className="block text-black capitalize font-medium mb-1">{field.replace('_', ' ')}</label>
            <input 
              type="text" 
              name={field} 
              value={form[field]} 
              onChange={handleChange} 
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
        ))}
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300">
          Tambahkan
        </button>
      </form>
    </main>
  );
}