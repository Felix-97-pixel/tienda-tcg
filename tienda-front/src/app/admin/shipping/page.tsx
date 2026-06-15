"use client";
import { useEffect, useState, FormEvent } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { List, Column } from "@/components/ui/List";
import { ShippingProvider } from "@/types/shippingProvider";
import { ShippingBadge } from "@/components/ui/ShippingBadge";

export default function AdminShipping() {
  const { showToast } = useToast();

  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ShippingProvider | null>(null);

  // Form states
  const [price, setPrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProviders = () => {
    setLoading(true);
    fetch(`${API_URL}/shipping/providers/all`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching shipping providers:", err);
        showToast("Error al cargar proveedores de envío", "error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const openModal = (provider: ShippingProvider) => {
    setSelectedProvider(provider);
    setPrice(Number(provider.price));
    setIsActive(provider.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    setSaving(true);

    const payload = {
      price: Number(price),
      isActive,
    };

    try {
      const res = await fetch(`${API_URL}/shipping/providers/${selectedProvider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Tarifa de envío guardada correctamente", "success");
        setIsModalOpen(false);
        fetchProviders();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al guardar tarifa de envío", "error");
      }
    } catch (error) {
      showToast("Error de red", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<ShippingProvider>[] = [
    {
      key: "name",
      header: "Proveedor",
      render: (provider) => {
        const isChilexpress = provider.name.toUpperCase() === "CHILEXPRESS";
        return (
          <div className="flex items-center gap-3.5">
            <ShippingBadge name={provider.name} size="sm" />
            <span className="font-bold text-white text-sm tracking-wide">
              {provider.name.toUpperCase()}
            </span>
          </div>
        );
      },
    },
    {
      key: "price",
      header: "Tarifa Plana",
      render: (provider) => (
        <span className="font-bold text-green-600 text-sm">
          ${Number(provider.price).toLocaleString("es-CL")}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (provider) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${provider.isActive
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          : 'bg-rose-100 text-rose-700 border border-rose-200'
          }`}>
          {provider.isActive ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (provider) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="px-3.5 py-1.5 bg-blue/10 text-blue hover:bg-blue hover:text-white transition-all duration-200 flex items-center gap-1.5 font-bold"
            onClick={() => openModal(provider)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between  pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Métodos de Envío</h1>
          <p className="text-gray-4 text-sm mt-1.5 font-medium">
            Configura las tarifas y disponibilidad de los proveedores de despacho a domicilio
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#1a1d24] rounded-[10px] shadow-1 overflow-hidden">
        <List
          columns={columns}
          data={providers}
          loading={loading}
          keyExtractor={(provider) => provider.id}
        />
      </div>

      {/* Modal de edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProvider ? `Configurar ${selectedProvider.name}` : "Configurar Método de Envío"}
        maxWidth="md"
      >
        {selectedProvider && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Visual Brand Badge Header inside the Modal */}
            <div className="flex items-center justify-center p-6 bg-[#222630] rounded-xl border border-stroke mb-4">
              <ShippingBadge name={selectedProvider.name} size="lg" className="scale-110" />
            </div>

            <div className="space-y-1.5">
              <Input
                label="Tarifa Plana (CLP) *"
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ej: 9990"
                className="font-bold text-white"
              />
              <p className="text-xs text-gray-4 font-semibold ml-1">
                Ingresa el valor total que se cobrará al cliente por este método de envío.
              </p>
            </div>

            <div className="pt-2">
              <Switch
                label="Proveedor de Envío Activo"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <p className="text-xs text-gray-4 font-medium ml-7 mt-1.5">
                Si se desactiva, este courier no aparecerá como opción disponible para los clientes en la página de checkout.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stroke mt-6">
              <Button
                type="button"
                variant="secondary"
                className="font-bold"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={saving} className="font-bold px-6">
                Guardar Cambios
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
