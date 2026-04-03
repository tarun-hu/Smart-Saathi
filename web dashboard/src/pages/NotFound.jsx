import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { Button } from "@/components/ui/button";
import Cat from "../assets/illustrations/undraw_cat_lqdj.svg?react";
import { useEffect, useState } from "react";

const NotFound = () => {
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.getElementById("navbar");
      setNavbarHeight(navbar ? navbar.offsetHeight : 0);
    };

    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);

    return () => {
      window.removeEventListener("resize", updateNavbarHeight);
    };
  }, []);

  return (
    <>
      <NavBar />
      <main
        className='mx-8 h-[calc(95dvh-var(--navbar-height))] lg:mx-20'
        style={{ "--navbar-height": `${navbarHeight}px` }}>
        <section className='relative flex h-full overflow-hidden rounded-[2rem] border border-neutral-200 bg-amber-50 p-6 lg:p-10'>
          <div className='pointer-events-none absolute -top-16 right-0 h-56 w-56 rounded-full bg-brand-accent/15 blur-3xl' />

          <div className='relative grid w-full items-stretch gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-[0.22em] text-brand-accent'>
                Error 404
              </p>
              <h1 className='mt-4 text-5xl font-black leading-tight text-neutral-900 lg:text-6xl'>
                Page not found.
              </h1>
              <p className='mt-5 max-w-2xl text-lg leading-relaxed text-neutral-700'>
                The page you are looking for does not exist or may have been
                moved.
              </p>

              <div className='mt-8 flex flex-wrap gap-4'>
                <Button asChild size='lg' className='text-base'>
                  <Link to='/'>Go to Home</Link>
                </Button>
                <Button
                  asChild
                  size='lg'
                  variant='outline'
                  className='text-base'>
                  <Link to='/contact'>Contact Support</Link>
                </Button>
              </div>
            </div>

            <div className='flex items-end justify-center lg:justify-end'>
              <Cat className='h-auto w-full max-w-sm max-h-[42vh] lg:max-h-[60vh]' />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default NotFound;
