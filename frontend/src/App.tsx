import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { AuthProvider, RequireAdmin } from './admin/auth';

const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./admin/Login'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const ProductList = lazy(() => import('./admin/ProductList'));
const ProductForm = lazy(() => import('./admin/ProductForm'));
const Enquiries = lazy(() => import('./admin/Enquiries'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogList = lazy(() => import('./admin/BlogList'));
const BlogForm = lazy(() => import('./admin/BlogForm'));
const HeroSlides = lazy(() => import('./admin/HeroSlides'));

/** Scroll to top on route change, or to #hash targets. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PublicLayout() {
  useEffect(() => {
    document.title = 'APSL Solutions LLP | Surveying Instruments, GNSS, Total Stations & Drones';
  });
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="min-h-screen" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<AuthProvider><Outlet /></AuthProvider>}>
            <Route path="admin/login" element={<Login />} />
            <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<ProductList />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="blog" element={<BlogList />} />
              <Route path="blog/:id" element={<BlogForm />} />
              <Route path="hero" element={<HeroSlides />} />
              <Route path="enquiries" element={<Enquiries />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
