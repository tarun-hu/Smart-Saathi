import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import AuthLayout from "./pages/auth/AuthLayout";
import { AuthProvider } from "./context/AuthContext";

function App() {
  // console.log(navigator.userAgentData?.platform);
  return (
    <AuthProvider>
      <div
        className='
        flex flex-col
        min-h-screen
        bg-linear-to-tr from-orange-200 to-orange-300
      '>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/help' element={<Help />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/login' element={<AuthLayout />} />
          <Route path='/signup' element={<AuthLayout />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
