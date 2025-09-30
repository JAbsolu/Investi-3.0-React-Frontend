import { useMemo } from "react";
import { useAuth } from "./useAuth";

export const useIsSubscribed = () => {
  const { subscriptions, loading } = useAuth();

  const isSubscribed = useMemo(() => {
    if (loading) return false; // Default to not subscribed while loading
    return subscriptions?.status === "active";
  }, [subscriptions, loading]);

  return isSubscribed;
}