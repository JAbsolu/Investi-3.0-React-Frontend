import { useMemo } from "react";
import { useAuth } from "./useAuth";

export const useIsPremium = () => {
  const { plan, loading } = useAuth();

  const premiumAcces = {
    "free": false,
    undefined: false,
    null: false,
    "silver": true,
    "gold": true,
  }

  const hasPremiumAccess = useMemo(() => {
    if (loading) return false; // Default to no access while loading
    return premiumAcces[plan];
  }, [plan, loading]);

  return hasPremiumAccess;
}