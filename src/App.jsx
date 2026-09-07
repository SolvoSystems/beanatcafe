import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminLayout from './pages/AdminLayout.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminImport from './pages/AdminImport.jsx';
import AdminClients from './pages/AdminClients.jsx';
import AdminReports from './pages/AdminReports.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="confirmation/:ref" element={<ConfirmationPage />} />
          <Route path="admin/login" element={<AdminLogin />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOrders />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="import" element={<AdminImport />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}