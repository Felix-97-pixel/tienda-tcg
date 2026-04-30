export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "undefined")
      ? process.env.NEXT_PUBLIC_API_URL
      : `http://${window.location.hostname}:3001/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
};

export const API_URL = getApiUrl();
