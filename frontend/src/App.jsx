import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Nav from './components/nav/nav'
import Footer from './components/footer/footer'
import SignIn from './pages/sigin/signin'
import SignUp from './pages/signup/signup'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ForgotPassword/ResetPassword';
import Hero from './components/heroSection/heroSection';
import HomePage from './pages/homepage/homepage';
import RecipeList from './pages/RecipeList/RecipeList';
import Admin from './pages/Admin/Admin';

function App() {
  const location = useLocation();

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/recipes" element={<RecipeList/>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={
          <>
            <Hero />
            <HomePage />
          </>
        } />
      </Routes>
      <Footer />
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

