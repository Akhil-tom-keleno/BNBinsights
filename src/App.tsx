import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Locations from '@/pages/Locations';

gsap.registerPlugin(ScrollTrigger);

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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/locations" element={<Locations />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
