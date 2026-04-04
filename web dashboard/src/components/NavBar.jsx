import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import BrandLogo from "../assets/logos/shield.svg?react";

const NavBar = () => {
  return (
    <div
      id='navbar'
      className='
        w-full
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
        <BrandLogo className='size-11 bg-brand-accent text-white p-1.5 rounded-2xl border-2 flex flex-col' />
        {/* <p className='text-4xl font-extrabold text-black'>
          Smart
          <span className='text-brand-accent'>Sarthi</span>
          साथी
        </p> */}
        <p className=' text-4xl font-extrabold text-neutral-200 '>
          Smart Saathi
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
          <NavLink to={"/features"}>Features</NavLink>
        </Button>
        <Button size='md' asChild variant='link'>
          <NavLink to={"/contact"}>Contact</NavLink>
        </Button>
        <Button size='md' asChild className='ml-6'>
          <a href='/#app-download'>Download</a>
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
