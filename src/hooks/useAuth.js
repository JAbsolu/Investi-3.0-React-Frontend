import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, off } from "firebase/database";
import { auth, database } from "../firebaseConfig";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile data from database
        const userRef = ref(database, `users/${user.uid}`);
        const profileListener = onValue(userRef, (snapshot) => {
          const profileData = snapshot.val();
          setUserProfile(profileData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          setLoading(false);
        });

        // Cleanup function for profile listener
        return () => off(userRef, 'value', profileListener);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userId: user?.uid,
    email: user?.email,
    userProfile,
    firstName: userProfile?.firstName,
    lastName: userProfile?.lastName,
    plan: userProfile?.plan,
    createdAt: userProfile?.createdAt,
    loading
  };
};