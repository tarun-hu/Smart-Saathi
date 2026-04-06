import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import BrandLogo from "../assets/logos/shield.svg?react";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div
      id='navbar'
      className='
        w-full
        flex
        min-h-22
        py-4 px-4 sm:px-6 lg:px-10 xl:px-30
        justify-between items-center
        relative
      '>
      <NavLink
        to={"/"}
        onClick={closeMobileMenu}
        className='
            select-none cursor-pointer flex flex-row items-center gap-2
          '>
        <BrandLogo className='size-9 sm:size-10 lg:size-11 bg-brand-accent text-white p-1.5 rounded-2xl border-2 flex flex-col' />
        {/* <p className='text-4xl font-extrabold text-black'>
          Smart
          <span className='text-brand-accent'>Sarthi</span>
          साथी
        </p> */}
        <p className='text-xl sm:text-2xl lg:text-4xl font-extrabold text-neutral-200'>
          Smart Saathi
        </p>
      </NavLink>

      <div className='hidden md:flex'>
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

      <Button
        size='icon'
        variant='ghost'
        className='md:hidden text-neutral-100 hover:text-neutral-100 hover:bg-white/10'
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setIsMobileMenuOpen((value) => !value)}>
        {isMobileMenuOpen ? <X className='size-5' /> : <Menu className='size-5' />}
      </Button>

      {isMobileMenuOpen && (
        <div className='absolute left-4 right-4 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-white/20 bg-neutral-900/95 p-3 shadow-xl backdrop-blur-sm md:hidden'>
          <div className='flex flex-col'>
            <Button variant='ghost' asChild className='justify-start text-neutral-100 hover:bg-white/10'>
              <NavLink onClick={closeMobileMenu} to={"/"}>Home</NavLink>
            </Button>
            <Button variant='ghost' asChild className='justify-start text-neutral-100 hover:bg-white/10'>
              <NavLink onClick={closeMobileMenu} to={"/about"}>About Us</NavLink>
            </Button>
            <Button variant='ghost' asChild className='justify-start text-neutral-100 hover:bg-white/10'>
              <NavLink onClick={closeMobileMenu} to={"/features"}>Features</NavLink>
            </Button>
            <Button variant='ghost' asChild className='justify-start text-neutral-100 hover:bg-white/10'>
              <NavLink onClick={closeMobileMenu} to={"/contact"}>Contact</NavLink>
            </Button>
            <Button asChild className='mt-2 w-full'>
              <a onClick={closeMobileMenu} href='/#app-download'>Download</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
