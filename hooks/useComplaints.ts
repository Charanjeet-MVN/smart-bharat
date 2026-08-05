import { useState, useEffect } from "react";
import { ComplaintRow } from "@/types";

export function useComplaints() {
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadComplaints() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/complaints?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to load complaints");
        }
        const result = await res.json();
        
        if (result.success === false) {
          throw new Error(result.error || "Failed to load complaints");
        }
        
        if (mounted) {
          setComplaints(result.data || []);
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load complaints");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadComplaints();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = () => {
    setLoading(true);
    fetch(`/api/complaints?t=${Date.now()}`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load complaints");
        return res.json();
      })
      .then(result => {
        if (result.success === false) throw new Error(result.error || "Failed to load complaints");
        setComplaints(result.data || []);
        setError(null);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Failed to load complaints");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { complaints, loading, error, refetch };
}
