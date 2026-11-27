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
const IndustriesPage = lazy(() => import('./pages/Industries'));
const AboutPage = lazy(() => import('./pages/About'));
const ContactPage = lazy(() => import('./pages/Contact'));
const BlogList = lazy(() => import('./admin/BlogList'));
const BlogForm = lazy(() => import('./admin/BlogForm'));
const HeroSlides = lazy(() => import('./admin/HeroSlides'));

/**
 * Scroll to top on route change, or to #hash targets.
 *
 * Arriving at the home page from another route, sections above the target
 * (categories, featured products) are still fetching, so they grow after the
 * first scroll and push the target down. Re-check a few times as the layout
 * settles and correct the position if it has drifted.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = hash.slice(1);
    const timers: number[] = [];
    let settled = false;

    const align = (smooth: boolean) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      // Already within a few pixels of the top: nothing to correct.
      if (settled && Math.abs(top) < 8) return;
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      settled = true;
    };

    timers.push(window.setTimeout(() => align(true), 80));
    [500, 900, 1400].forEach((ms) => timers.push(window.setTimeout(() => align(false), ms)));
    return () => timers.forEach(window.clearTimeout);
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
            <Route path="industries" element={<IndustriesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
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
