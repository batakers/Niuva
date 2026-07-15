import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Server-backed merchandise catalog.
 * Public visitors can only read active products; write operations use the
 * protected /admin endpoints and therefore require an administrator token.
 */
export function useMerchandiseCatalog({ admin = false } = {}) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(admin ? "/admin/merchandise" : "/merchandise");
      setCatalog(response.data);
    } catch (requestError) {
      setCatalog([]);
      setError("Katalog belum dapat dimuat. Silakan coba lagi.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const addProduct = async (product) => {
    const { data } = await api.post("/admin/merchandise", product);
    setCatalog((current) => [data, ...current]);
    return data;
  };

  const updateProduct = async (id, product) => {
    const { data } = await api.put(`/admin/merchandise/${id}`, product);
    setCatalog((current) => current.map((item) => (item.id === id ? data : item)));
    return data;
  };

  const deleteProduct = async (id) => {
    await api.delete(`/admin/merchandise/${id}`);
    setCatalog((current) => current.filter((item) => item.id !== id));
  };

  return { catalog, loading, error, load, addProduct, updateProduct, deleteProduct };
}
