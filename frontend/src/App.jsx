import React from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
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
import AdminIngredients from './pages/Admin/AdminIngredients';
import Categories from './pages/Categories/Categories';
import Purchase from './pages/Purchase/Purchase';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageRecipes from './pages/Admin/ManageRecipes';
import ManageIngredients from './pages/Admin/ManageIngredients';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentFailed from './pages/Payment/PaymentFailed';
import PaymentComponent from './pages/Payment/payment';
import MyOrders from './pages/Orders/MyOrders';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About/About';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admindashboard');

  return (
    <>
      {!isAdminRoute && <Nav />}
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/purchase/:id" element={<Purchase />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/payment" element={<PaymentComponent />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/ingredients" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminIngredients />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admindashboard/*" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/recipes/manage" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManageRecipes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/ingredients/manage" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <ManageIngredients />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected User Routes */}
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={
          <>
            <Hero />
            <HomePage />
          </>
        } />
      </Routes>
      {!isAdminRoute && <Footer />}
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

