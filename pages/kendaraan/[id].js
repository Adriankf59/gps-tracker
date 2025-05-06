import { useState } from 'react';

export async function getStaticPaths() {
  const response = await fetch('http://localhost:8055/items/daftar_kendaraan');
  const data = await response.json();

  const paths = data.data.map((kendaraan) => ({
    params: { id: kendaraan.id.toString() },
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const response = await fetch(`http://localhost:8055/items/daftar_kendaraan/${params.id}`);
  const data = await response.json();

  return {
    props: { kendaraan: data.data },
    revalidate: 60,
  };
}

export default function KendaraanPage({ kendaraan }) {
  // Check if kendaraan data is available
  if (!kendaraan) {
    return <div className="text-black">Loading...</div>;
  }

  // Display details of the selected kendaraan
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Detail Kendaraan</h1>
      <div className="border rounded-lg p-6 shadow-lg bg-white">
        <h2 className="text-xl font-semibold mb-2 text-black">{kendaraan.merek} {kendaraan.model}</h2>
        <ul className="space-y-2 text-black">
          <li><strong>Nomor Kendaraan:</strong> {kendaraan.nomor_kendaraan}</li>
          <li><strong>Tahun Pembuatan:</strong> {kendaraan.tahun_pembuatan}</li>
          <li><strong>Warna:</strong> {kendaraan.warna}</li>
          <li><strong>Jenis Kendaraan:</strong> {kendaraan.jenis_kendaraan}</li>
          <li><strong>Pemilik:</strong> {kendaraan.pemilik}</li>
        </ul>
      </div>
    </main>
  );
}