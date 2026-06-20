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
          fetch(`${API_URL}/features/plans`),
          fetch(`${API_URL}/features`)
        ]);
        
        if (plansRes.ok) setPlans(await plansRes.json());
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
