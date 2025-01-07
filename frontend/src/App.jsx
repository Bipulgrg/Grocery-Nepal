import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Nav from './components/nav/nav'
import Footer from './components/footer/footer'
import SignIn from './pages/sigin/signin'
import SignUp from './pages/signup/signup'
import Hero from './components/heroSection/heroSection';
import HomePage from './pages/homepage/homepage';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
      <Nav />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
    <Hero />
    <HomePage />
    <Footer />
    </>
  )
}

export default App
