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
import MarketActivityPage from './pages/dashboard/market-activity';
import SettingsPage from './pages/dashboard/settings';

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
      <Route path="/dashboard/market-activity" element={userIsAuth ? <MarketActivityPage /> : <SignIn />} />
      <Route path="/dashboard/settings" element={userIsAuth ? <SettingsPage /> : <SignIn />} />
    </Routes>
  );
}

export default App;
