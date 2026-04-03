import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";

import { cn } from "@/lib/utils";

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        orientation,
      }}>
      <div
        className={cn("relative", className)}
        role='region'
        aria-roledescription='carousel'
        data-slot='carousel'
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className='overflow-hidden'
      data-slot='carousel-content'>
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }) {
  const { orientation } = useCarousel();

  return (
    <div
      role='group'
      aria-roledescription='slide'
      data-slot='carousel-item'
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPills({
  count,
  activeIndex,
  onSelect,
  ariaLabel = "Carousel controls",
  getItemAriaLabel,
  autoplayCycle,
  autoplayDelay,
  isAutoplayPaused,
  className,
  activePillClassName,
  inactivePillClassName,
  progressClassName,
}) {
  return (
    <div
      role='tablist'
      aria-label={ariaLabel}
      className={cn("flex items-center gap-3", className)}>
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={`carousel-pill-${index}`}
            type='button'
            onClick={() => onSelect(index)}
            aria-label={
              getItemAriaLabel
                ? getItemAriaLabel(index)
                : `Go to slide ${index + 1}`
            }
            aria-selected={isActive}
            role='tab'
            className={cn(
              "overflow-hidden h-2 rounded-full transition-all cursor-pointer relative duration-300",
              isActive
                ? activePillClassName ?? "w-10 bg-neutral-400"
                : inactivePillClassName ?? "w-2 bg-neutral-400 hover:bg-neutral-500",
            )}>
            {isActive && (
              <span
                key={`${activeIndex}-${autoplayCycle}`}
                style={{
                  animationDuration: `${autoplayDelay}ms`,
                  animationPlayState: isAutoplayPaused
                    ? "paused"
                    : "running",
                }}
                className={cn(
                  "carousel-pill-progress absolute inset-0",
                  progressClassName ?? "bg-brand-accent",
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPills };
