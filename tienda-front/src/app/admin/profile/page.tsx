import StoreProfileForm from "@/components/Admin/StoreProfileForm";

export default function AdminStoreProfile() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Mi Tienda</h1>
        <p className="text-gray-4 text-sm font-medium mt-1">Configura los detalles públicos y datos de contacto de tu tienda.</p>
      </div>
      <StoreProfileForm storeId="me" />
    </div>
  );
}
