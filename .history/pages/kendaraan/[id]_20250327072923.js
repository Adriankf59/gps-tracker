import { useState } from 'react';

export async function getStaticPaths() {
  const response = await fetch('http://localhost:8055/items/daftar_kendaraan');
  const data = await response.json();

  const paths = data.data.map((kendaraan) => ({
    params: { id: kendaraan.id.toString() },
  }));

  return { paths, fallback: 'blocking' }; // Ini digunakan di halaman dinamis, misal di `[id].js`.
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
  // ... kode fungsi halaman dinamis lainnya
}