import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { CheckboxList, CheckboxItem } from "@/components/ui/CheckboxList";

import { adminFetch } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: any;
  onSuccess: () => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, coupon, onSuccess }) => {
  const t = useTranslations("coupons_page");
  const isEditing = !!coupon;
  const { showToast } = useToast();

  const SCOPE_OPTIONS = [
    { label: t("scope_store_wide"), value: "STORE_WIDE" },
    { label: t("scope_category_specific"), value: "CATEGORY_SPECIFIC" },
    { label: t("scope_game_specific"), value: "GAME_SPECIFIC" },
  ];

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
      const res = await adminFetch("/products/meta/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGames = async () => {
    try {
      const res = await adminFetch("/products/meta/games");
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
      return;
    }
    if (formData.scope === "GAME_SPECIFIC" && formData.gameIds.length === 0) {
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
      const url = isEditing ? `/coupons/${coupon.id}` : "/coupons";
      const method = isEditing ? "PATCH" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("OK", "success");
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        showToast(error.message || "Error", "error");
      }
    } catch (error) {
      showToast("Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? t("modal_edit_title") : t("modal_create_title")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{t("promo_code")}</label>
          <Input
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
            placeholder="VERANO20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">{t("discount_percent")}</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-1">{t("valid_from")}</label>
            <Input
              name="validFrom"
              type="date"
              value={formData.validFrom}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t("valid_until")}</label>
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
          <label className="block text-sm font-medium text-gray-300 mb-1">{t("discount_scope")}</label>
          <SearchableSelect
            options={SCOPE_OPTIONS}
            value={formData.scope}
            onChange={(val) => setFormData({ ...formData, scope: val })}
            placeholder={t("discount_scope")}
          />
        </div>

        {formData.scope === "CATEGORY_SPECIFIC" && (
          <CheckboxList
            label={t("select_categories")}
            searchPlaceholder="..."
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            selectedValues={formData.categoryIds}
            onChange={(vals) => setFormData({ ...formData, categoryIds: vals })}
          />
        )}

        {formData.scope === "GAME_SPECIFIC" && (
          <CheckboxList
            label={t("select_games")}
            searchPlaceholder="..."
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
            label={t("active_coupon")}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("btn_cancel")}
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEditing ? t("btn_save_changes") : t("modal_create_title")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CouponModal;
