import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Abstract from "./pages/Abstract";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Download from "./pages/Download";
import AuthLayout from "./pages/auth/AuthLayout";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div style={{minHeight:'100vh',background:'#f5f5f7'}}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/abstract"  element={<Abstract />} />
          <Route path="/features"  element={<Features />} />
          <Route path="/contact"   element={<Contact />} />
          <Route path="/download"  element={<Download />} />
          <Route path="/login"     element={<AuthLayout />} />
          <Route path="/signup"    element={<AuthLayout />} />
          {/* Legacy routes */}
          <Route path="/about"     element={<Abstract />} />
          <Route path="/help"      element={<Features />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
