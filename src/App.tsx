import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { AuthProvider } from '@/context/AuthContext';

// Pages
import Home from '@/pages/Home';
import SERP from '@/pages/SERP';
import ManagerDetail from '@/pages/ManagerDetail';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import ListCompany from '@/pages/ListCompany';
import GetStarted from '@/pages/GetStarted';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Locations from '@/pages/Locations';
import ClaimListing from '@/pages/ClaimListing';
import AdminDashboard from '@/pages/AdminDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/managers" element={<SERP />} />
          <Route path="/location/:locationSlug" element={<SERP />} />
          <Route path="/manager/:slug" element={<ManagerDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/list-company" element={<ListCompany />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/claim-listing/:managerId" element={<ClaimListing />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<ManagerDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
