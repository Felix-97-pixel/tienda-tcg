import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

export function useCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/coupons`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error("Error fetching coupons", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (coupon: any) => {
    if (!confirm(`¿Estás seguro que deseas eliminar el cupón ${coupon.code}?`)) return;

    try {
      const res = await fetch(`${API_URL}/coupons/${coupon.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Cupón eliminado correctamente", "success");
        fetchCoupons();
      } else {
        const error = await res.json();
        showToast(error.message || "Error al eliminar el cupón", "error");
      }
    } catch (error) {
      showToast("Error de red", "error");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return { coupons, loading, refresh: fetchCoupons, deleteCoupon };
}
