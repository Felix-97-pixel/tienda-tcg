export interface StorePlan {
  id: string;
  name: string;
  price: number;
  isStandard?: boolean;
}

export interface StoreProfileFormData {
  name: string;
  subdomain?: string;
  logoUrl: string;
  subscriptionPlanIds: string[];
  description: string;
  facebook: string;
  instagram: string;
  twitter: string;
  twitch: string;
  whatsapp: string;
  website: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  rut?: string;
  legalName?: string;
  taxActivity?: string;
  supportedGames?: { id: string; name: string }[];
  devaluations?: { conditionId: string; conditionName: string; gameId: string; multiplier: number }[];
  languageDevaluations?: { languageId: string; languageName: string; gameId: string; multiplier: number }[];
}
