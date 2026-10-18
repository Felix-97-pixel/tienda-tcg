"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";

export interface Feature {
  id: string;
  key: string;
  name: string;
  description: string;
  price: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  skuLimit: number;
  commissionRate: string | number;
  isStandard?: boolean;
  features: Feature[];
}

export function useMarketingPricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, featuresRes] = await Promise.all([
          fetch(`${API_URL}/features/plans?standardOnly=true`, { cache: "no-store" }),
          fetch(`${API_URL}/features`, { cache: "no-store" })
        ]);
        
        if (plansRes.ok) {
          const rawPlans: Plan[] = await plansRes.json();
          // Solo mostrar planes marcados como estándar en la landing pública
          setPlans(rawPlans.filter(p => p.isStandard !== false));
        }
        if (featuresRes.ok) setFeatures(await featuresRes.json());
      } catch (error) {
        console.error("Error fetching pricing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { plans, features, loading };
}
