import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AuthLayout from "./pages/auth/AuthLayout";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";

function App() {
  const location = useLocation();
  const footerEnabledPaths = [
    "/",
    "/about",
    "/features",
    "/contact",
    "/login",
    "/signup",
  ];
  const showFooter = footerEnabledPaths.includes(location.pathname);

  // console.log(navigator.userAgentData?.platform);
  return (
    <AuthProvider>
      <div
        className='
        flex flex-col
        min-h-screen
        bg-linear-to-br from-brand-accent to-blue-800
      '>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/features' element={<Features />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/login' element={<AuthLayout />} />
          <Route path='/signup' element={<AuthLayout />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
