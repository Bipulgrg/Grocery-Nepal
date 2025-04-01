import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Nav from './components/nav/nav';
import Hero from './components/heroSection/heroSection';
import HomePage from './pages/homepage/homepage';
import RecipeList from './pages/RecipeList/RecipeList';
import Admin from './pages/Admin/Admin';
import AdminIngredients from './pages/Admin/AdminIngredients';
import Categories from './pages/Categories/Categories';
import Purchase from './pages/Purchase/Purchase';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminLayout from './components/AdminLayout/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="recipes" element={<Admin />} />
            <Route path="ingredients" element={<AdminIngredients />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>

          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Nav />
              <Routes>
                <Route index element={
                  <>
                    <Hero />
                    <HomePage />
                  </>
                } />
                <Route path="recipes" element={<RecipeList />} />
                <Route path="categories" element={<Categories />} />
                <Route path="purchase/:id" element={<Purchase />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

