import StoreProfileForm from "@/app/admin/_components/StoreProfileForm";
import Link from "next/link";

export default async function SuperAdminEditStore({ params }: { params: Promise<{ storeId: string }> }) {
  const resolvedParams = await params;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/superadmin/stores" className="text-blue hover:text-indigo-400 text-sm font-bold flex items-center gap-2 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a Gestión de Tiendas
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Editar Tienda</h1>
        <p className="text-gray-4 text-sm font-medium mt-1">Configura los detalles públicos y datos de contacto de este dealer.</p>
      </div>
      <StoreProfileForm storeId={resolvedParams.storeId} />
    </div>
  );
}
