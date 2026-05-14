import { useState } from "react";
import { API_URL } from "@/utils/api";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (
    file: File,
    currentUrl?: string,
    folder: string = 'general'
  ): Promise<string | null> => {
    if (!file) return null;
    const uploadData = new FormData();
    uploadData.append("file", file);

    setIsUploading(true);
    try {
      // If replacing an existing image, delete the old one first
      if (currentUrl) {
        await fetch(`${API_URL}/upload/image`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: currentUrl }),
          credentials: "include",
        }).catch((err) => console.error("No se pudo borrar imagen antigua", err));
      }

      const res = await fetch(`${API_URL}/upload/image?folder=${folder}`, {
        method: "POST",
        body: uploadData,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        return data.url;
      } else {
        alert("Error al subir la imagen");
        return null;
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al subir la imagen");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (currentUrl: string): Promise<boolean> => {
    if (!currentUrl) return false;

    try {
      const res = await fetch(`${API_URL}/upload/image`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl }),
        credentials: "include",
      });

      if (res.ok) {
        return true;
      } else {
        console.error("Error al borrar la imagen en el servidor");
        return false;
      }
    } catch (err) {
      console.error("Error al borrar la imagen:", err);
      return false;
    }
  };

  return {
    isUploading,
    handleUpload,
    handleRemove,
  };
};
