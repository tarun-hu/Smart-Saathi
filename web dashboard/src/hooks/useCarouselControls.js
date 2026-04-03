import { useEffect, useRef, useState } from "react";

export const useCarouselControls = ({
  totalSteps,
  autoplayDelay,
  holdToPauseDelay,
}) => {
  const [carouselApi, setCarouselApi] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [autoplayCycle, setAutoplayCycle] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [isIntroScrollActive, setIsIntroScrollActive] = useState(true);
  const sectionRef = useRef(null);
  const holdPauseTimeoutRef = useRef(null);
  const wheelLockTimeoutRef = useRef(null);
  const isWheelLockedRef = useRef(false);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setActiveStep(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;

    let autoplayTimeoutId;

    const scheduleNext = () => {
      window.clearTimeout(autoplayTimeoutId);
      if (isAutoplayPaused || isIntroScrollActive) return;
      setAutoplayCycle((value) => value + 1);
      autoplayTimeoutId = window.setTimeout(() => {
        carouselApi.scrollNext();
      }, autoplayDelay);
    };

    scheduleNext();
    carouselApi.on("select", scheduleNext);

    return () => {
      window.clearTimeout(autoplayTimeoutId);
      carouselApi.off("select", scheduleNext);
    };
  }, [carouselApi, autoplayDelay, isAutoplayPaused, isIntroScrollActive]);

  useEffect(() => {
    if (!isAutoplayPaused) return;

    const resumeAutoplay = () => {
      setIsAutoplayPaused(false);
    };

    window.addEventListener("pointerup", resumeAutoplay);
    window.addEventListener("pointercancel", resumeAutoplay);

    return () => {
      window.removeEventListener("pointerup", resumeAutoplay);
      window.removeEventListener("pointercancel", resumeAutoplay);
    };
  }, [isAutoplayPaused]);

  const clearHoldPauseTimeout = () => {
    if (!holdPauseTimeoutRef.current) return;
    window.clearTimeout(holdPauseTimeoutRef.current);
    holdPauseTimeoutRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearHoldPauseTimeout();
      if (wheelLockTimeoutRef.current) {
        window.clearTimeout(wheelLockTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isIntroScrollActive || !carouselApi) return;

    const onWheel = (event) => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const isSectionInFocus =
        rect.top < window.innerHeight * 0.75 &&
        rect.bottom > window.innerHeight * 0.25;

      if (!isSectionInFocus) return;
      if (Math.abs(event.deltaY) < 10) return;

      const isScrollingDown = event.deltaY > 0;
      const lastStepIndex = totalSteps - 1;
      const isAtLastStep = activeStep >= lastStepIndex;

      if (isScrollingDown && isAtLastStep) {
        setIsIntroScrollActive(false);
        return;
      }

      event.preventDefault();
      if (isWheelLockedRef.current) return;

      isWheelLockedRef.current = true;
      if (isScrollingDown) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollPrev();
      }

      wheelLockTimeoutRef.current = window.setTimeout(() => {
        isWheelLockedRef.current = false;
      }, 350);
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [isIntroScrollActive, carouselApi, activeStep, totalSteps]);

  const handlePointerDown = () => {
    clearHoldPauseTimeout();
    holdPauseTimeoutRef.current = window.setTimeout(() => {
      setIsAutoplayPaused(true);
    }, holdToPauseDelay);
  };

  const handlePointerRelease = () => {
    clearHoldPauseTimeout();
    setIsAutoplayPaused(false);
  };

  const handleDotClick = (stepIndex) => {
    setActiveStep(stepIndex);
    if (carouselApi) carouselApi.scrollTo(stepIndex);
  };

  return {
    carouselApi,
    setCarouselApi,
    activeStep,
    autoplayCycle,
    isAutoplayPaused,
    isIntroScrollActive,
    sectionRef,
    handlePointerDown,
    handlePointerRelease,
    handleDotClick,
  };
};
