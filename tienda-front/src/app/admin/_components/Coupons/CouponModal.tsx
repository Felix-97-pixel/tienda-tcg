import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { CheckboxList, CheckboxItem } from "@/components/ui/CheckboxList";

const SCOPE_OPTIONS = [
  { label: "Toda la Tienda", value: "STORE_WIDE" },
  { label: "Categorías Específicas", value: "CATEGORY_SPECIFIC" },
  { label: "Juegos Específicos", value: "GAME_SPECIFIC" },
];
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: any;
  onSuccess: () => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, coupon, onSuccess }) => {
  const isEditing = !!coupon;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
    scope: "STORE_WIDE",
    categoryIds: [] as string[],
    gameIds: [] as string[],
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchGames();
    }
  }, [isOpen]);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        discountPercent: coupon.discountPercent.toString(),
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
        isActive: coupon.isActive,
        scope: coupon.scope,
        categoryIds: coupon.categories?.map((c: any) => c.id) || [],
        gameIds: coupon.games?.map((g: any) => g.id) || [],
      });
    } else {
      setFormData({
        code: "",
        discountPercent: "",
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        isActive: true,
        scope: "STORE_WIDE",
        categoryIds: [],
        gameIds: [],
      });
    }
  }, [coupon, isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/products/meta/categories`);
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API_URL}/products/meta/games`);
      if (res.ok) {
        setGames(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.scope === "CATEGORY_SPECIFIC" && formData.categoryIds.length === 0) {
      showToast("Selecciona al menos una categoría", "error");
      return;
    }
    if (formData.scope === "GAME_SPECIFIC" && formData.gameIds.length === 0) {
      showToast("Selecciona al menos un juego", "error");
      return;
    }
    setLoading(true);

    const payload = {
      ...formData,
      discountPercent: Number(formData.discountPercent),
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
    };

    try {
      const url = isEditing ? `${API_URL}/coupons/${coupon.id}` : `${API_URL}/coupons`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
        showToast(isEditing ? "Cupón actualizado exitosamente" : "Cupón creado exitosamente", "success");
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        showToast(error.message || "Error al guardar el cupón", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Cupón" : "Crear Cupón"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Código Promocional</label>
          <Input
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
            placeholder="EJ: VERANO20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Porcentaje de Descuento (%)</label>
          <Input
            name="discountPercent"
            type="number"
            min="1"
            max="100"
            value={formData.discountPercent}
            onChange={handleChange}
            placeholder="20"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Válido Desde</label>
            <Input
              name="validFrom"
              type="date"
              value={formData.validFrom}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Válido Hasta</label>
            <Input
              name="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Alcance del Descuento</label>
          <SearchableSelect
            options={SCOPE_OPTIONS}
            value={formData.scope}
            onChange={(val) => setFormData({ ...formData, scope: val })}
            placeholder="Selecciona el alcance"
            noResultsText="Sin resultados"
          />
        </div>

        {formData.scope === "CATEGORY_SPECIFIC" && (
          <CheckboxList
            label="Seleccionar Categorías"
            searchPlaceholder="Buscar categoría..."
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            selectedValues={formData.categoryIds}
            onChange={(vals) => setFormData({ ...formData, categoryIds: vals })}
          />
        )}

        {formData.scope === "GAME_SPECIFIC" && (
          <CheckboxList
            label="Seleccionar Juegos"
            searchPlaceholder="Buscar juego..."
            options={games.map((g) => ({ label: g.name, value: g.id }))}
            selectedValues={formData.gameIds}
            onChange={(vals) => setFormData({ ...formData, gameIds: vals })}
          />
        )}

        <div className="-mx-3 mt-2">
          <CheckboxItem
            id="isActive"
            checked={formData.isActive}
            onChange={(checked) => setFormData({ ...formData, isActive: checked })}
            label="Cupón Activo"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEditing ? "Guardar Cambios" : "Crear Cupón"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CouponModal;
