import { Metadata } from 'next';
import StoresClient from './StoresClient';

export const metadata: Metadata = {
  title: 'Tiendas | SuperAdmin',
};

export default function StoresPage() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Gestión de Tiendas (Dealers)
        </h2>
      </div>
      <StoresClient />
    </>
  );
}
