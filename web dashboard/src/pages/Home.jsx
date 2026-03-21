import Apple from "../assets/logos/apple.svg?react";
import Android from "../assets/logos/android.svg?react";
import Grandma from "../assets/illustrations/grandma.svg?react";
import FlowerElement from "../assets/patterns/flower-element.svg?react";
import Underline from "../assets/patterns/underline.svg?react";
import CheckPattern from "../assets/patterns/check-pattern.svg?react";
import CoreFeatures from "../components/illustrations/CoreFeatures";
import Notification from "../assets/illustrations/notification.svg?react";
import UserInterface from "../assets/illustrations/user_interface.svg?react";
import Privacy from "../assets/illustrations/privacy.svg?react";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CircleCheckBig,
  Headset,
  Settings2,
  ShieldUser,
} from "lucide-react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

const Home = () => {
  return (
    <>
      <NavBar />
      <main>
        <section id='hero' className='mx-30 mt-12 mb-30 min-h-[70vh] relative '>
          <h1 className='text-8xl font-bold text-left'>
            Let's provide the{" "}
            <span className='relative'>
              care{" "}
              {/* <Underline className="w-70 absolute -right-5 -top-8" /> */}
            </span>
            they deserve.
            <span className='inline-block animate-[scale-pulse_2s_ease-in-out_infinite]'>
              ❤️
            </span>
          </h1>
          <p className='text-2xl py-8 text-gray-600 font-medium'>
            The all-in-one solution designed for you to oversee daily care of
            <br />
            your loved ones, receive alerts, and take action when it matters
            most.
          </p>
          <Button
            asChild
            className='text-lg py-6 group select-none cursor-pointer'
            onClick={() => {
              console.log("caretaker signup");
            }}>
            <a>
              <span className='flex-1 text-center'>
                Get started as a caregiver
              </span>
              <ArrowRightIcon className=' size-5 shrink-0 group-hover:translate-x-1.5 transition' />
            </a>
          </Button>

          <Grandma className='size-80 absolute right-0 -bottom-5 hover:-rotate-2 hover:scale-[1.05] transition' />
          {/* <FlowerElement className="size-30 text-brand-accent m-10 rotate-12 block animate-[scale-n-rotate_8s_ease-in-out_infinite]" /> */}
          {/* <CheckPattern className="size-50 absolute -bottom-55 left-[30%] "/> */}
        </section>

        <section
          id='core-features'
          className='p-30 bg-amber-50 border-b-8 border-neutral-200  min-h-screen relative flex gap-6 items-baseline'>
          <div className='flex flex-col items-center flex-1 gap-3'>
            <Notification className='size-38 mb-10 -translate-x-5' />
            <div
              /*icon border*/ className='border-6 border-neutral-300 p-3 mx-auto inline-block bg-brand-accent text-white rounded-[100%]
            hover:bg-brand-accent/90'>
              <CircleCheckBig size={32} strokeWidth={2} />
            </div>
            <h2>Simplicity </h2>
            <p className='text-lg text-center'>
              Easily access health charts, daily check-in messages, medical
              history details, wellness summaries, activity logs, hydration &
              medication reminders and SOS alerts.
            </p>
          </div>
          <div className='flex flex-col items-center flex-1 gap-3'>
            <Privacy className='size-38 mb-10' />
            <div
              /*icon border*/ className='border-6 border-neutral-300 p-3 mx-auto inline-block bg-brand-accent text-white rounded-[100%] hover:bg-brand-accent/90'>
              <ShieldUser size={32} strokeWidth={2} />
            </div>
            <h2>Privacy </h2>
            <p className='text-lg text-center'>
              We collect only essential data to operate the service. Any
              additional data is collected with your consent and handled
              transparently. All data is anonymized, never used for advertising,
              and never shared with third parties.
            </p>
          </div>
          <div className='flex flex-col items-center flex-1 gap-3'>
            <UserInterface className='size-38 mb-10' />
            <div
              /*icon border*/ className='border-6 border-neutral-300 p-3 mx-auto inline-block bg-brand-accent text-white rounded-[100%] hover:bg-brand-accent/90'>
              <Settings2 size={32} strokeWidth={2} />
            </div>
            <h2>Control</h2>
            <p className='text-lg text-center'>
              Easily customizable dashboard with one-click presets and advanced
              filters, Personalize feature access, notifications and user
              settings to fit your needs.
            </p>
          </div>
        </section>

        <section
          id='app-download'
          className='p-30 bg-amber-50 border-b-8 border-neutral-200  min-h-screen flex flex-col gap-3 relative items-start'>
          {/* <h2 >Aimed towards the elderly and built with privacy in mind.</h2> */}
          <h2>Set up the companion app for your loved one</h2>
          <p className='text-lg'>
            Download the app on their phone and connect it to your dashboard{" "}
            <br /> using a secure pairing code.
          </p>
          <div className='flex gap-6 mt-5'>
            <Button
              asChild
              className='text-lg py-6 select-none cursor-pointer'
              onClick={() => {
                console.log("download for android");
              }}>
              <a>
                <Android className=' size-5 shrink-0 ' />
                <span className='flex-1 text-center'>Download for Android</span>
              </a>
            </Button>
            <Button
              asChild
              className='text-lg py-6 select-none cursor-pointer'
              onClick={() => {
                console.log("download for ios");
              }}>
              <a>
                <Apple className=' size-5 shrink-0' />
                <span className='flex-1 text-center'>Download for iOS</span>
              </a>
            </Button>
          </div>
          <p className='text-sm text-gray-800 -translate-y-2'>
            By downloading the app you agree to our{" "}
            <a className='hover:underline'>terms & conditions</a>
          </p>
          <img
            src='/iphone_gray.png'
            alt='app on iphone'
            className='w-80 rotate-6 absolute right-40'
          />
          <ul className='px-5 pt-10 text-xl  flex flex-col gap-4 list-disc'>
            <li>AI-enabled voice chat assistant</li>
            <li>100% tranparency</li>
            <li>No Ads, No distractions</li>
          </ul>
          <p className='text-lg italic border-l-3 border-neutral-600 pl-3 my-5'>
            The companion app is designed for elderly users with limited digital
            experience,
            <br /> using voice prompts, big easy access buttons, and minimal
            on-screen interaction.
          </p>

          <div className='flex flex-col gap-4 items-start pt-5'>
            <h3 className='text-2xl font-bold'>
              Having an issue with the app? Report a bug
            </h3>
            <Button size='lg' className='text-lg' asChild>
              <Link to='/contact'>
                <Headset className='size-4.5' />
                Contact Support
              </Link>
            </Button>
          </div>
        </section>

        <section
          id='signup-process'
          className='px-30 py-20 bg-amber-50 border-b-8 border-neutral-200 min-h-screen relative flex flex-col justify-center'></section>

        <section
          id='stats'
          className='px-30 py-20 bg-amber-50 border-b-8 border-neutral-200 min-h-screen relative flex flex-col justify-center'></section>
        <section
          id='features'
          className='px-30 py-20 bg-amber-50 border-b-8 border-neutral-200 min-h-screen relative flex flex-col justify-center'></section>
        <section
          id='footer'
          className='px-30 py-20 bg-amber-50 border-b-8 border-neutral-200 min-h-screen relative flex flex-col justify-center'></section>
      </main>
    </>
  );
};

export default Home;
