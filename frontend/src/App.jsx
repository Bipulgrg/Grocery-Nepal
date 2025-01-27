import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Nav from './components/nav/nav'
import Footer from './components/footer/footer'
import SignIn from './pages/sigin/signin'
import SignUp from './pages/signup/signup'
import Hero from './components/heroSection/heroSection';
import HomePage from './pages/homepage/homepage';
function App() {
  const location = useLocation();

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
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

