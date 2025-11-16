import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from "./pages/home";
import SignIn from './pages/signin';
import Signup from './pages/signup';
import DashboardPage from './pages/dashboard';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import News from './pages/dashboard/news';
import FeaturesPage from "./pages/features";
import CongressPage from './pages/dashboard/congress';
import MoversPage from './pages/dashboard/movers';
import SettingsPage from './pages/dashboard/settings';
import StatementsPage from './pages/dashboard/statements';
import StockDetailsPage from './pages/dashboard/research';
import PricingPlans from './pages/plans';
import { useIsSubscribed } from './hooks/isSubscribed';
import DashboardSkeleton from './pages/dashboard/DashboardSkeleton';

function App() {
  const [userIsAuth, setUserIsAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { isSubscribed, loading: subLoading } = useIsSubscribed();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserIsAuth(!!user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading || subLoading) {
    return (
      <DashboardSkeleton />
    ); 
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={userIsAuth ? <DashboardPage /> : <SignIn />} />
      <Route path="/signup" element={userIsAuth ? <DashboardPage /> : <Signup />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/dashboard" element={userIsAuth ? <DashboardPage /> : <SignIn />} />
      <Route path="/dashboard/news" element={userIsAuth ? <News /> : <SignIn />} />
      <Route path="/dashboard/congress" element={userIsAuth ? <CongressPage /> : <SignIn />} />
      <Route path="/dashboard/movers" element={userIsAuth ? <MoversPage /> : <SignIn />} />
      <Route path="/dashboard/research" element={userIsAuth ? <StockDetailsPage /> : <SignIn />} />
      <Route path="/dashboard/research/:ticker" element={userIsAuth ? <StockDetailsPage /> : <SignIn />} />
      <Route path="/dashboard/statements" element={userIsAuth ? <StatementsPage /> : <SignIn />} />
      <Route path="/dashboard/settings" element={userIsAuth ? <SettingsPage /> : <SignIn />} />
      <Route path="/onboarding" element={userIsAuth ? <PricingPlans /> : <SignIn />} />
      <Route path="/upgrades" element={userIsAuth ? <PricingPlans /> : <SignIn />} />
    </Routes>
  );

  // return (
  //   <Routes>
  //     <Route path="/" element={<Home />} />
  //     <Route path="/signin" element={userIsAuth && isSubscribed ? <DashboardPage /> : <SignIn />} />
  //     <Route path="/signup" element={userIsAuth && isSubscribed ? <DashboardPage /> : <Signup />} />
  //     <Route path="/features" element={<FeaturesPage />} />
  //     <Route path="/dashboard" element={userIsAuth && isSubscribed ? <DashboardPage /> : userIsAuth && !isSubscribed ? <PricingPlans /> : <SignIn />} />
  //     <Route path="/dashboard/news" element={userIsAuth && isSubscribed ? <News /> : userIsAuth && !isSubscribed ? <PricingPlans /> : <SignIn />} />
  //     <Route path="/dashboard/congress" element={userIsAuth && isSubscribed ? <CongressPage /> : userIsAuth && !isSubscribed ? <PricingPlans /> : <SignIn />} />
  //     <Route path="/dashboard/movers" element={userIsAuth && isSubscribed ? <MoversPage /> : userIsAuth && !isSubscribed ? <PricingPlans /> : <SignIn />} />
  //     <Route path="/dashboard/research" element={userIsAuth && isSubscribed ? <StockDetailsPage /> : userIsAuth && !isSubscribed ? <PricingPlans /> : <SignIn />} />
  //     <Route path="/dashboard/research/:ticker" element={userIsAuth && isSubscribed ? <StockDetailsPage /> : userIsAuth && !isSubscribed ? <PricingPlans /> : <SignIn />} />
  //     <Route path="/dashboard/statements" element={userIsAuth && isSubscribed ? <StatementsPage /> : userIsAuth && !isSubscribed ? <PricingPlans /> : <SignIn />} />
  //     <Route path="/dashboard/settings" element={userIsAuth && isSubscribed ? <SettingsPage /> : <SignIn />} />
  //     <Route path="/onboarding" element={userIsAuth ? <PricingPlans /> : <SignIn />} />
  //     <Route path="/upgrades" element={userIsAuth && isSubscribed ? <PricingPlans /> : <SignIn />} />
  //   </Routes>
  // );
}

// testtt

export default App;
