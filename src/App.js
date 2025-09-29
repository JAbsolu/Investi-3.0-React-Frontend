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
import PricingPlans from './pages/dashboard/plans';
// import CheckoutForm from './pages/dashboard/stripeCheckout';
// import StripeWrapper from './pages/dashboard/stripeWrapper';

function App() {
  const [userIsAuth, setUserIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserIsAuth(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", paddingTop: "3em", background: "black", height: "100vh" }}>
        Loading...
      </div>
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
      <Route path="/dashboard/plans" element={userIsAuth ? <PricingPlans /> : <SignIn />} />
      {/* <Route 
        path="/dashboard/checkout" 
        element={
          userIsAuth ? 
          <StripeWrapper>
            <CheckoutForm />
          </StripeWrapper> 
          : <SignIn />
        }/> */}
    </Routes>
  );
}

export default App;
