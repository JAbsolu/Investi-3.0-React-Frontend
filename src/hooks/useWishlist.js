import { useState, useCallback } from 'react';
import { ref, set, get } from "firebase/database";
import { database } from "../firebaseConfig";

export const useWishlist = (userId) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);

      if (snapshot.exists()) {
        setWishlist(snapshot.val());
        console.log("Wishlist loaded:", snapshot.val());
      } else {
        setWishlist([]);
      }
    } catch (error) {
      setError(error.message);
      console.log("Error fetching wishlist:", error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToWishlist = useCallback(async (ticker) => {
    if (!userId || !ticker) {
      console.log("Missing userId or ticker");
      return;
    }

    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);

      let currentWishlist = [];
      if (snapshot.exists()) {
        currentWishlist = snapshot.val();
      }

      if (!currentWishlist.includes(ticker)) {
        const updatedWishlist = [...currentWishlist, ticker.toUpperCase()];
        await set(wishlistRef, updatedWishlist);
        setWishlist(updatedWishlist);
        console.log("Stock added to wishlist!");
      } else {
        console.log("Stock already in wishlist");
      }
    } catch (error) {
      setError(error.message);
      console.log("Error saving to wishlist:", error.message);
    }
  }, [userId]);

  const removeFromWishlist = useCallback(async (tickerToRemove) => {
    if (!userId) return;

    try {
      const wishlistRef = ref(database, `wishlist/${userId}`);
      const snapshot = await get(wishlistRef);

      if (snapshot.exists()) {
        const currentWishlist = snapshot.val();
        const updatedWishlist = currentWishlist.filter((ticker) => ticker !== tickerToRemove);

        await set(wishlistRef, updatedWishlist);
        setWishlist(updatedWishlist);
        console.log(`${tickerToRemove} removed from wishlist`);
      }
    } catch (error) {
      setError(error.message);
      console.log("Error removing stock from wishlist:", error.message);
    }
  }, [userId]);

  return {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist
  };
};