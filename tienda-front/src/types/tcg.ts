export interface TcgSet {
  id: string;
  name: string;
  releaseDate: string;
}

export interface ExpansionMeta {
  name: string;
  products: number;
}

export interface SyncProgress {
  current: number;
  total: number;
  active: boolean;
}
