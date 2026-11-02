"use client";
import { useState, useEffect } from "react";
import {
  fetchCachedConditions,
  fetchCachedLanguages,
  fetchCachedCurrencies,
} from "@/utils/metadataCache";

export function useTcgMetadata() {
  const [conditions, setConditions] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    Promise.all([
      fetchCachedConditions(),
      fetchCachedLanguages(),
      fetchCachedCurrencies(),
    ]).then(([conds, langs, currs]) => {
      if (isSubscribed) {
        setConditions(conds);
        setLanguages(langs);
        setCurrencies(currs);
        setIsLoaded(true);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, []);

  return { conditions, languages, currencies, isLoaded };
}

