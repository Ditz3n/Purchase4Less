import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from "./Layout";
import MainPage from "./pages/MainPage";
import NotFoundPage from './pages/NotFoundPage';
import SearchProductPage from './pages/SearchProductPage';
import MyShoppingListsPage from './pages/MyShoppingListsPage';
import MyProfilePage from './pages/MyProfilePage';
import SubscribeToProductsPage from './pages/SubscribeToProductsPage';
import ProductOverviewPage from './pages/ProductOverviewPage';
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Scraper from './pages/Scraper';
import { ThemeProvider } from "./contexts/ThemeContext";
import { StoreProvider } from './components/StoreContext';
import ProtectedRoute from './services/protectedRoute';
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path='/' element={<Navigate to="/home" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<MainPage />} />
              <Route path="/soeg-produkt" element={<ProtectedRoute><SearchProductPage /></ProtectedRoute>} />
              <Route path="/mine-indkoebslister" element={<ProtectedRoute><MyShoppingListsPage /></ProtectedRoute>} />
              <Route path="/profil" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
              <Route path="/abonner-produkt" element={<ProtectedRoute><SubscribeToProductsPage /></ProtectedRoute>} />
              <Route path="/produktoverblik" element={<ProtectedRoute><ProductOverviewPage /></ProtectedRoute>} />
              <Route path="/om" element={<AboutPage />} />
              <Route path="/kontakt" element={<ContactPage />} />
              <Route path="/vilkaar" element={<TermsAndConditions />} />
              <Route path="/privatliv" element={<PrivacyPolicy />} />
              <Route path="/scraper" element={<Scraper />} />
             <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster />
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;