import React from "react";
import { useLocation } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";


const AuthLayout = () => {
  const { pathname } = useLocation();
  

  return (
    <>
    {pathname === "/login" && <Login/>}
    {pathname === "/signup" && <Signup/>}
    <h2>Auth</h2>
    </>
  );
};

export default AuthLayout;
