import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import BrandLogo from "../assets/logos/smart_sarthi.png";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const NavBar = () => {
  const useAuth = useContext(AuthContext);
  const { user, login, logout } = useAuth;

  return (
    <div
      id='navbar'
      className='
        flex
        h-22
        py-14 px-30
        justify-between items-center
      '>
      <NavLink
        to={"/"}
        className='
            select-none cursor-pointer flex flex-row items-center gap-1
          '>
        <img src={BrandLogo} className='size-30 -mx-6' />
        <p className='text-4xl font-extrabold text-black'>
          Smart
          <span className='text-[#2f3192]'>Sarthi</span>
          {/* साथी */}
        </p>
      </NavLink>

      <div className='flex'>
        <Button size='md' asChild variant='link'>
          <NavLink to={"/"}>Home</NavLink>
        </Button>
        <Button size='md' asChild variant='link'>
          <NavLink to={"/about"}>About Us</NavLink>
        </Button>
        <Button size='md' asChild variant='link'>
          <NavLink to={"/contact"}>Contact</NavLink>
        </Button>
        <Button size='md' asChild variant='link'>
          <NavLink to={"/help"}>Help</NavLink>
        </Button>
        {!user ? (
          <>
            <Button
              size='md'
              asChild
              variant='outline'
              className='ml-8 border-gray-300'>
              <NavLink to='/signup'>Sign Up</NavLink>
            </Button>
            <Button size='md' asChild className='ml-6'>
              <NavLink to='/login'>Log In</NavLink>
            </Button>
          </>
        ) : (
          <Button size='md' asChild className='ml-6'>
            <NavLink>Dashboard</NavLink>
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
