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
        const res = await fetch("/api/complaints");
        if (!res.ok) {
          throw new Error("Failed to load complaints");
        }
        const data = await res.json();
        
        if (mounted) {
          setComplaints(data || []);
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
    fetch("/api/complaints")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load complaints");
        return res.json();
      })
      .then(data => {
        setComplaints(data || []);
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
