export interface StoreFeature {
  id: string;
  name: string;
  key: string;
  price: number;
}

export interface StorePlan {
  id: string;
  name: string;
  price: number;
}

export interface StoreProfileFormData {
  name: string;
  logoUrl: string;
  subscriptionPlanIds: string[];
  customFeatureIds: string[];
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
}
