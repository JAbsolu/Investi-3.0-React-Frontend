import { useMemo } from "react";
import { useAuth } from "./useAuth";

export const useIsSubscribed = () => {
  const { subscriptions, loading } = useAuth();

  const isSubscribed = useMemo(() => {
    return subscriptions?.status === "active";
  }, [subscriptions]);

  // Return both subscription status and loading state
  return { isSubscribed, loading };
};