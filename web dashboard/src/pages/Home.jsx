import Apple from "../assets/logos/apple.svg?react";
import Grandma from "../assets/illustrations/grandma.svg?react"
import Android from "../assets/logos/android.svg?react";
import BrandLogo from "../assets/logos/shield.svg?react";
import Notification from "../assets/illustrations/notification.svg?react";
import UserInterface from "../assets/illustrations/user_interface.svg?react";
import Privacy from "../assets/illustrations/privacy.svg?react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPills,
} from "@/components/ui/carousel";
import {
  Activity,
  BellRing,
  ArrowRight,
  Quote,
  Users2,
  CircleCheckBig,
  Headset,
  ShieldCheck,
  Settings2,
  ShieldUser,
  OctagonX,
  StarHalf,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useCarouselControls } from "../hooks/useCarouselControls";

const Home = () => {
  const AUTOPLAY_DELAY = 5000;
  const HOLD_TO_PAUSE_DELAY = 180;
  const signupPhoneRef = useRef(null);
  const [testimonialCarouselApi, setTestimonialCarouselApi] = useState(null);
  const [activeTestimonialPage, setActiveTestimonialPage] = useState(0);
  const [testimonialAutoplayCycle, setTestimonialAutoplayCycle] = useState(0);
  const [isTestimonialAutoplayPaused, setIsTestimonialAutoplayPaused] =
    useState(false);
  const testimonialHoldPauseTimeoutRef = useRef(null);

  const testimonialPages = [
    [
      {
        image: "/temp/testimonials/ananya-rao.jpg",
        quote:
          "Smart Saathi made it easy to keep track of reminders and daily check-ins without feeling overwhelming.",
        rating: 4.5,
        name: "Ananya Rao",
      },
      {
        image: "/temp/testimonials/ravi-mehta.jpg",
        quote:
          "The app gives our family confidence because alerts are clear and we always know what needs attention.",
        rating: 4,
        name: "Ravi Mehta",
      },
      {
        image: "/temp/testimonials/priya-sharma.jpg",
        quote:
          "The interface is simple, the flow is smooth, and my father was able to start using it quickly.",
        rating: 5,
        name: "Priya Sharma",
      },
    ],
    [
      {
        image: "/temp/testimonials/suresh-patel.jpg",
        quote:
          "Medication reminders and the clean dashboard helped us stay consistent with care every day.",
        rating: 4.5,
        name: "Suresh Patel",
      },
      {
        image: "/temp/testimonials/meera-iyer.jpg",
        quote:
          "It feels like a reliable companion for the whole family, especially when we need to respond fast.",
        rating: 4,
        name: "Meera Iyer",
      },
      {
        image: "/temp/testimonials/myra-das.jpg",
        quote:
          "Adding family support and setting things up was straightforward, which saved us a lot of time.",
        rating: 5,
        name: "Myra Das",
      },
    ],
  ];

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => {
      const starPosition = index + 1;

      if (rating >= starPosition) {
        return (
          <Star key={index} className='text-amber-400 size-4 fill-amber-400' />
        );
      }

      if (rating >= starPosition - 0.5) {
        return (
          <span key={index} className='inline-flex relative size-4'>
            <Star
              className='
                text-neutral-400
                absolute inset-0 size-4 fill-neutral-400
              '
            />
            <Star
              style={{ clipPath: "inset(0 50% 0 0)" }}
              className='
                text-amber-400
                absolute inset-0 size-4 fill-amber-400
              '
            />
          </span>
        );
      }

      return (
        <Star
          key={index}
          className='text-neutral-400 size-4 fill-neutral-400'
        />
      );
    });

  useEffect(() => {
    if (!testimonialCarouselApi) return;

    const onSelect = () => {
      setActiveTestimonialPage(testimonialCarouselApi.selectedScrollSnap());
    };

    onSelect();
    testimonialCarouselApi.on("select", onSelect);

    return () => {
      testimonialCarouselApi.off("select", onSelect);
    };
  }, [testimonialCarouselApi]);

  useEffect(() => {
    if (!testimonialCarouselApi || isTestimonialAutoplayPaused) return;

    const autoplayTimeoutId = window.setTimeout(() => {
      setTestimonialAutoplayCycle((value) => value + 1);
      testimonialCarouselApi.scrollNext();
    }, AUTOPLAY_DELAY);

    return () => {
      window.clearTimeout(autoplayTimeoutId);
    };
  }, [
    testimonialCarouselApi,
    activeTestimonialPage,
    isTestimonialAutoplayPaused,
    AUTOPLAY_DELAY,
  ]);

  useEffect(() => {
    return () => {
      if (testimonialHoldPauseTimeoutRef.current) {
        window.clearTimeout(testimonialHoldPauseTimeoutRef.current);
      }
    };
  }, []);

  const clearTestimonialHoldPauseTimeout = () => {
    if (!testimonialHoldPauseTimeoutRef.current) return;
    window.clearTimeout(testimonialHoldPauseTimeoutRef.current);
    testimonialHoldPauseTimeoutRef.current = null;
  };

  const handleTestimonialPointerDown = () => {
    clearTestimonialHoldPauseTimeout();
    testimonialHoldPauseTimeoutRef.current = window.setTimeout(() => {
      setIsTestimonialAutoplayPaused(true);
    }, HOLD_TO_PAUSE_DELAY);
  };

  const handleTestimonialPointerRelease = () => {
    clearTestimonialHoldPauseTimeout();
    setIsTestimonialAutoplayPaused(false);
  };

  const handleTestimonialDotClick = (pageIndex) => {
    setActiveTestimonialPage(pageIndex);
    if (testimonialCarouselApi) testimonialCarouselApi.scrollTo(pageIndex);
  };

  const signupSteps = [
    {
      title: "Create your senior account",
      description: "Enter your details and choose a secure password.",
      image: "/temp/signup_filled.png",
      stepLabel: "Step 1",
      fitMode: "cover",
    },
    {
      title: "Add your family member",
      description:
        "Enter member details, configure essentials, and complete profile setup.",
      image: "/temp/add_member_filled.png",
      stepLabel: "Step 2",
      fitMode: "cover",
    },
    {
      title: "Explore your healthcare app",
      description:
        "Track reminders, updates, and alerts from a simple and streamlined dashboard.",
      image: "/temp/home.png",
      stepLabel: "Step 3",
      fitMode: "contain",
    },
  ];

  const {
    setCarouselApi: setSignupCarouselApi,
    activeStep: activeSignupStep,
    autoplayCycle,
    isAutoplayPaused: isSignupAutoplayPaused,
    sectionRef: signupSectionRef,
    handlePointerDown: handleSignupPointerDown,
    handlePointerRelease: handleSignupPointerRelease,
    handleDotClick: handleSignupDotClick,
  } = useCarouselControls({
    totalSteps: signupSteps.length,
    autoplayDelay: AUTOPLAY_DELAY,
    holdToPauseDelay: HOLD_TO_PAUSE_DELAY,
    introTriggerRef: signupPhoneRef,
  });

  return (
    <>
      <NavBar />
      <main>
        <section
          id='hero'
          className='min-h-[70vh] mx-4 sm:mx-8 lg:mx-16 xl:mx-30 mt-8 sm:mt-10 lg:mt-12 mb-14 sm:mb-20 lg:mb-30 relative'>
          <h1 className='max-w-5xl text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-left'>
            Let's provide the{" "}
            <span className='relative'>
              care{" "}
              {/* <Underline className="w-70 absolute -right-5 -top-8" /> */}
            </span>
            they deserve
            <span
              className='
                inline-block
                animate-[scale-pulse_2s_ease-in-out_infinite]
              '>
              ❤️
            </span>
          </h1>
          <p
            className='
              py-6 sm:py-8
              text-base sm:text-lg lg:text-2xl text-neutral-200 font-medium
            '>
            The all-in-one solution designed for you to oversee daily care of
            <br className='hidden md:block' />
            your loved ones, receive alerts, and take action when it matters
            most.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className='
                  group
                  py-5 sm:py-6
                  text-base sm:text-lg
                  select-none
                  cursor-pointer
                  transition-transform
                  duration-300
                  ease-out
                  hover:scale-105
                '>
                <span className='flex items-center justify-center gap-2 text-center'>
                  Get Cared with Smart Saathi
                  <ArrowRight
                    strokeWidth={3}
                    className='size-4 transition-transform duration-300 ease-out group-hover:translate-x-1'
                  />
                </span>
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className='max-w-md rounded-2xl border border-slate-300 bg-linear-to-b from-white to-slate-100 p-7 shadow-[0_36px_90px_-42px_rgba(2,6,23,0.65)]'>
              <AlertDialogHeader className='items-center text-center'>
                <p className='inline-flex items-center rounded-full border border-brand-accent/45 bg-brand-accent/15 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-brand-accent uppercase'>
                  Companion App
                </p>
                <AlertDialogTitle className='text-2xl font-black tracking-tight text-slate-950'>
                  Scan to Download
                </AlertDialogTitle>
                <AlertDialogDescription className='max-w-xs text-sm text-slate-800'>
                  Open your phone camera and scan this QR to download Smart Saathi.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className='mx-auto mt-1 overflow-hidden rounded-2xl border-2 border-slate-300 bg-white p-4 shadow-[0_16px_34px_-18px_rgba(15,23,42,0.45)]'>
                <img
                  src='/temp/smart_sarthi_qr_v2.png'
                  alt='Smart Saathi app download QR code'
                  draggable={false}
                  className='h-52 w-52 sm:h-58 sm:w-58 select-none object-contain'
                />
              </div>

              <p className='text-center text-xs text-slate-700'>
                You can also find direct download links in the App Download section.
              </p>

              <AlertDialogFooter>
                <AlertDialogCancel className='w-full sm:w-full'>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* <div className='hidden lg:block absolute right-10 top-44'>
            <BrandLogo className='size-72 text-white transition-transform duration-300 ease-out hover:scale-110 cursor-pointer' />
          </div> */}

          <Grandma className='size-52 sm:size-64 lg:size-80 absolute right-3 sm:right-0 -bottom-5 drop-shadow-[12px_-8px_20px_rgba(15,23,42,0.22)] hover:-rotate-2 hover:scale-[1.05] transition' />
          {/* <CheckPattern className="size-50 absolute -bottom-55 left-[30%] "/> */}
        </section>

        <section
          id='core-features'
          className='
            flex flex-col lg:flex-row
            min-h-screen
            px-6 py-14 sm:px-10 lg:px-20 xl:px-30
            bg-amber-50
            relative gap-10 lg:gap-6 items-baseline
          '>
          <div className='flex flex-col flex-1 items-center gap-3'>
            <Notification className='mb-6 sm:mb-10 size-24 sm:size-30 lg:size-38 translate-x-0 lg:-translate-x-5' />
            <div
              className='
                inline-block
                p-3 mx-auto
                text-white
                bg-brand-accent
                border-6 border-neutral-300 rounded-[100%]
                hover:bg-brand-accent/90
              '>
              <CircleCheckBig size={32} strokeWidth={2} />
            </div>
            <h2>Simplicity </h2>
            <p className='text-base sm:text-lg text-center'>
              Easily access health charts, daily check-in messages, medical
              history details, wellness summaries, activity logs, hydration &
              medication reminders and SOS alerts.
            </p>
          </div>
          <div className='flex flex-col flex-1 items-center gap-3'>
            <Privacy className='mb-6 sm:mb-10 size-24 sm:size-30 lg:size-38' />
            <div
              className='
                inline-block
                p-3 mx-auto
                text-white
                bg-brand-accent
                border-6 border-neutral-300 rounded-[100%]
                hover:bg-brand-accent/90
              '>
              <ShieldUser size={32} strokeWidth={2} />
            </div>
            <h2>Privacy </h2>
            <p className='text-base sm:text-lg text-center'>
              We collect only essential data to operate the service. Any
              additional data is collected with your consent and handled
              transparently. All data is anonymized, never used for advertising,
              and never shared with third parties.
            </p>
          </div>
          <div className='flex flex-col flex-1 items-center gap-3'>
            <UserInterface className='mb-6 sm:mb-10 size-24 sm:size-30 lg:size-38' />
            <div
              className='
                inline-block
                p-3 mx-auto
                text-white
                bg-brand-accent
                border-6 border-neutral-300 rounded-[100%]
                hover:bg-brand-accent/90
              '>
              <Settings2 size={32} strokeWidth={2} />
            </div>
            <h2>Control</h2>
            <p className='text-base sm:text-lg text-center'>
              Easily customizable dashboard with one-click presets and advanced
              filters, Personalize feature access, notifications and user
              settings to fit your needs.
            </p>
          </div>
        </section>

        <section
          id='app-download'
          className='
            flex flex-col
            min-h-screen
            px-6 py-14 sm:px-10 lg:px-20 xl:px-30
            bg-amber-50
            gap-3 relative items-start
          '>
          <h2>Set up the companion app for your loved one</h2>
          <p className='text-base sm:text-lg'>
            Download the app on their phone and connect it to your dashboard{" "}
            <br className='hidden sm:block' /> using a secure pairing code.
          </p>
          <div className='flex mt-5 gap-4 sm:gap-6'>
            <Button
              asChild
              onClick={() => {
                console.log("download for android");
              }}
              className='py-5 sm:py-6 text-base sm:text-lg select-none cursor-pointer'>
              <a href='https://github.com/tarun-hu/Smart-Saathi/releases/download/v-2.0.0/app-release.apk'>
                <Android className='size-5 shrink-0' />
                <span className='flex-1 text-center'>Download for Android</span>
              </a>
            </Button>
          </div>
          <p className='text-sm text-gray-800 -translate-y-2'>
            By downloading the app you agree to our{" "}
            <a className='hover:underline'>terms & conditions</a>
          </p>
          <div
            id='setup-phone'
            className='
              w-52 sm:w-64 lg:w-80
              rotate-0 lg:rotate-6
              mt-8
              self-center lg:self-auto
              drop-shadow-[0_22px_26px_rgba(15,23,42,0.28)]
              relative lg:absolute lg:right-16 xl:right-40 lg:bottom-26
            '>
            <div className='w-full relative aspect-842/1589'>
              <div
                className='
                  overflow-hidden
                  rounded-[2rem] sm:rounded-[2.35rem] lg:rounded-[2.6rem]
                  absolute inset-x-[8%] inset-y-[6%]
                '>
                <img
                  src='/temp/home_voice_active.png'
                  alt='app home page'
                  draggable={false}
                  className='
                    object-contain object-top
                    h-full w-full
                    select-none
                  '
                />
              </div>
              <img
                src='/iphone_gray.png'
                alt='app on iphone'
                draggable={false}
                className='z-10 h-full w-full select-none absolute'
              />
            </div>
          </div>
          <ul
            className='
              flex flex-col
              px-1 sm:px-5 pt-8 sm:pt-10
              text-lg sm:text-xl
              gap-4 list-disc
            '>
            <li>AI-enabled voice chat assistant</li>
            <li>100% tranparency</li>
            <li>No Ads, No distractions</li>
          </ul>
          <p
            className='
              pl-3 my-5
              text-base sm:text-lg
              border-l-3 border-neutral-600
              italic
            '>
            The companion app is designed for elderly users with limited digital
            experience,
            <br className='hidden sm:block' /> using voice prompts, big easy access buttons, and minimal
            on-screen interaction.
          </p>

          <div className='flex flex-col pt-5 gap-4 items-start'>
            <h3 className='text-2xl font-bold'>
              Having an issue with the app? Report a bug
            </h3>
            <Button size='lg' asChild className='text-lg'>
              <Link to='/contact'>
                <Headset className='size-4.5' />
                Contact Support
              </Link>
            </Button>
          </div>
        </section>

        <section
          id='signup-process'
          ref={signupSectionRef}
          className='
            min-h-screen
            px-6 py-14 pb-22 sm:px-10 lg:px-20 xl:px-30 lg:py-20 lg:pb-36
            bg-neutral-200
            relative
          '>
          <h2>Get started in 3 easy steps</h2>
          <p className='mt-3 text-base sm:text-lg text-neutral-700'>
            Start in seconds with a simple signup flow and secure account setup.
          </p>

          <Carousel
            opts={{ loop: true, align: "start" }}
            setApi={setSignupCarouselApi}
            onPointerDown={handleSignupPointerDown}
            onPointerUp={handleSignupPointerRelease}
            onPointerCancel={handleSignupPointerRelease}>
            <CarouselContent>
              {signupSteps.map((step) => (
                <CarouselItem key={step.stepLabel}>
                  <div
                    className='
                      flex flex-col lg:flex-row
                      w-full
                      pr-0 lg:pr-20 pb-8 pt-4
                      items-start lg:items-center justify-between gap-8
                    '>
                    <div className='max-w-xl min-h-52 sm:min-h-46 lg:min-h-0'>
                      <p
                        className='
                          text-sm tracking-[0.2em] text-brand-accent font-semibold
                          uppercase
                        '>
                        {step.stepLabel}
                      </p>
                      <h3 className='mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold'>{step.title}</h3>
                      <p className='mt-4 text-base sm:text-xl text-neutral-700'>
                        {step.description}
                      </p>
                    </div>

                    <div ref={signupPhoneRef} className='w-52 sm:w-64 lg:w-76 shrink-0 mx-auto lg:mx-0'>
                      <div className='w-full relative aspect-842/1589'>
                        <div
                          className={`
                            overflow-hidden
                            rounded-[2rem] sm:rounded-[2.35rem] lg:rounded-[2.6rem]
                            absolute inset-x-[9.5%] sm:inset-x-[8%] inset-y-[5%] lg:inset-x-[10%]
                            ${step.fitMode === "cover" ? "bg-black" : "bg-neutral-100"}
                          `}>
                          <img
                            src={step.image}
                            alt={step.title}
                            draggable={false}
                            className={`
                              object-top
                              h-full w-full
                              ${step.fitMode === "cover" ? "object-cover" : "object-contain"}
                            `}
                          />
                        </div>
                        <img
                          src='/iphone_gray.png'
                          alt='iPhone mockup'
                          draggable={false}
                          className='z-10 h-full w-full select-none absolute drop-shadow-[0_18px_28px_rgba(2,6,23,0.24)]'
                        />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div
            className='
              absolute bottom-10 lg:bottom-30 left-1/2 -translate-x-1/2
            '>
            <CarouselPills
              count={signupSteps.length}
              activeIndex={activeSignupStep}
              onSelect={handleSignupDotClick}
              ariaLabel='Signup process steps'
              getItemAriaLabel={(index) =>
                `Go to ${signupSteps[index].stepLabel}`
              }
              autoplayCycle={autoplayCycle}
              autoplayDelay={AUTOPLAY_DELAY}
              isAutoplayPaused={isSignupAutoplayPaused}
            />
          </div>
        </section>

        <section
          id='stats'
          className='
            flex flex-col
            min-h-50vh h-auto
            px-6 py-14 sm:px-10 lg:px-20 xl:px-30 lg:py-20
            bg-neutral-800
            gap-10 lg:gap-20 relative
          '>
          {/* <h2 className="text-center text-neutral-50">Numbers that matter</h2> */}
          <div
            className='
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5
              divide-y divide-white/15 sm:divide-x sm:divide-y-0
            '>
            <div
              className='
                px-6 py-7
                text-center
                sm:first:pl-0 lg:first:pl-0
              '>
              <div
                className='
                  inline-flex
                  mx-auto mb-3
                  bg-white/10
                  rounded-2xl
                  transition-colors
                  size-11 items-center justify-center duration-300 hover:bg-white/20
                '>
                <Users2 strokeWidth={2.1} className='text-neutral-100 size-6' />
              </div>
              <h3
                className='
                  text-4xl sm:text-5xl font-black leading-none text-brand-accent
                '>
                100
                <span
                  className='
                    inline-block
                    ml-0.5
                    text-3xl align-bottom text-neutral-400
                  '>
                  +
                </span>
              </h3>
              <p
                className='
                  mt-3
                  text-lg font-semibold text-neutral-100
                '>
                Seniors
              </p>
              <p className='mt-1 text-sm text-neutral-300'>protected daily</p>
            </div>
            <div className='px-6 py-7 text-center'>
              <div
                className='
                  inline-flex
                  mx-auto mb-3
                  bg-white/10
                  rounded-2xl
                  transition-colors
                  size-11 items-center justify-center duration-300 hover:bg-white/20
                '>
                <ShieldCheck
                  strokeWidth={2.1}
                  className='text-neutral-100 size-6'
                />
              </div>
              <h3
                className='
                  text-4xl sm:text-5xl font-black leading-none text-brand-accent
                '>
                200
                <span
                  className='
                    inline-block
                    ml-0.5
                    text-3xl align-bottom text-neutral-400
                  '>
                  +
                </span>
              </h3>
              <p
                className='
                  mt-3
                  text-lg font-semibold text-neutral-100
                '>
                Family members
              </p>
              <p className='mt-1 text-sm text-neutral-300'>
                actively serving the community
              </p>
            </div>
            <div className='px-6 py-7 text-center'>
              <div
                className='
                  inline-flex
                  mx-auto mb-3
                  bg-white/10
                  rounded-2xl
                  transition-colors
                  size-11 items-center justify-center duration-300 hover:bg-white/20
                '>
                <BellRing
                  strokeWidth={2.1}
                  className='text-neutral-100 size-6'
                />
              </div>
              <h3
                className='
                  text-4xl sm:text-5xl font-black leading-none text-brand-accent
                '>
                999
                <span
                  className='
                    inline-block
                    ml-0.5
                    text-3xl align-bottom text-neutral-400
                  '>
                  +
                </span>
              </h3>
              <p
                className='
                  mt-3
                  text-lg font-semibold text-neutral-100
                '>
                Alerts
              </p>
              <p className='mt-1 text-sm text-neutral-300'>delivered weekly</p>
            </div>
            <div className='px-6 py-7 text-center'>
              <div
                className='
                  inline-flex
                  mx-auto mb-3
                  bg-white/10
                  rounded-2xl
                  transition-colors
                  size-11 items-center justify-center duration-300 hover:bg-white/20
                '>
                <Activity
                  strokeWidth={2.1}
                  className='text-neutral-100 size-6'
                />
              </div>
              <h3
                className='
                  text-4xl sm:text-5xl font-black leading-none text-brand-accent
                '>
                24
                <span
                  className='
                    inline-block
                    ml-0.5
                    text-3xl align-bottom text-neutral-400
                  '>
                  /7
                </span>
              </h3>
              <p
                className='
                  mt-3
                  text-lg font-semibold text-neutral-100
                '>
                Monitoring
              </p>
              <p className='mt-1 text-sm text-neutral-300'>
                always-on coverage
              </p>
            </div>
            <div
              className='
                px-6 py-7
                text-center
                sm:last:pr-0 lg:last:pr-0
              '>
              <div
                className='
                  inline-flex
                  mx-auto mb-3
                  bg-white/10
                  rounded-2xl
                  transition-colors
                  size-11 items-center justify-center duration-300 hover:bg-white/20
                '>
                <OctagonX
                  strokeWidth={2.1}
                  className='text-neutral-100 size-6'
                />
              </div>
              <h3
                className='
                  text-4xl sm:text-5xl font-black leading-none text-brand-accent
                '>
                0
              </h3>
              <p
                className='
                  mt-3
                  text-lg font-semibold text-neutral-100
                '>
                Ads
              </p>
              <p className='mt-1 text-sm text-neutral-300'>forever ad-free</p>
            </div>
          </div>
        </section>
        <section
          id='testimonials'
          className='
            flex flex-col
            min-h-screen
            px-6 py-14 pb-24 sm:px-10 lg:px-20 xl:px-30 lg:py-20 lg:pb-40
            bg-neutral-100
            relative
          '>
          <div className='max-w-3xl mb-10'>
            <p
              className='
                text-sm font-semibold tracking-[0.3em] text-brand-accent
                uppercase
              '>
              Testimonials
            </p>
            <h2 className='mt-3 text-neutral-950'>What families are saying</h2>
            <p className='mt-4 text-base sm:text-lg text-neutral-700'>
              Dont just take our word for it, experience what our customers have
              to say about the product
            </p>
          </div>

          <Carousel
            opts={{ loop: true, align: "start" }}
            setApi={setTestimonialCarouselApi}
            onPointerDown={handleTestimonialPointerDown}
            onPointerUp={handleTestimonialPointerRelease}
            onPointerCancel={handleTestimonialPointerRelease}>
            <CarouselContent>
              {testimonialPages.map((page, pageIndex) => (
                <CarouselItem key={`testimonial-page-${pageIndex}`}>
                  <div
                    className='
                      grid xl:grid-cols-3
                      justify-items-center gap-6
                    '>
                    {page.map((testimonial) => (
                      <Card
                        key={testimonial.name}
                        className='
                          overflow-hidden
                          w-full max-w-sm
                          bg-white
                          rounded-xl border border-neutral-200
                          shadow-sm
                        '>
                        <div className='overflow-hidden relative aspect-16/10'>
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            draggable={false}
                            className='object-cover h-full w-full'
                          />
                          <div
                            className='
                              bg-linear-to-t from-neutral-950/55 via-neutral-950/10 to-transparent
                              absolute inset-0
                            '
                          />
                          <div
                            className='
                              inline-flex
                              text-white
                              bg-neutral-950/55
                              rounded-2xl
                              absolute left-4 top-4 size-11 items-center justify-center
                            '>
                            <Quote
                              strokeWidth={2}
                              className='text-white size-6 fill-white'
                            />
                          </div>
                        </div>
                        <CardContent className='p-6'>
                          <p className='text-base leading-7 text-neutral-700'>
                            {testimonial.quote}
                          </p>
                          <div className='flex mt-5 items-center gap-1'>
                            {renderStars(testimonial.rating)}
                          </div>
                          <p
                            className='
                              mt-3
                              text-sm font-semibold tracking-[0.2em] text-neutral-500
                              uppercase
                            '>
                            - {testimonial.name}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div
            className='
              absolute bottom-8 lg:bottom-20 left-1/2 -translate-x-1/2
            '>
            <CarouselPills
              count={testimonialPages.length}
              activeIndex={activeTestimonialPage}
              onSelect={handleTestimonialDotClick}
              ariaLabel='Testimonial pages'
              getItemAriaLabel={(index) =>
                `Go to testimonial page ${index + 1}`
              }
              autoplayCycle={testimonialAutoplayCycle}
              autoplayDelay={AUTOPLAY_DELAY}
              isAutoplayPaused={isTestimonialAutoplayPaused}
            />
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
