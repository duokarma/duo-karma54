import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

// Compatible image component that works in Next.js, Vite, and standard React environments
const FallbackImage = ({
  src,
  alt,
  fill,
  className,
  priority,
  ...props
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  [key: string]: any;
}) => (
  <img
    src={src}
    alt={alt}
    loading={priority ? "eager" : "lazy"}
    className={`${fill ? "absolute inset-0 w-full h-full object-cover" : ""} ${className || ""}`}
    {...props}
  />
);

// Default images for preview and standalone use
const defaultCards = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  },
];

// Stack configuration tokens
const defaultSettings = {
  width: 340, // card width in px
  height: 420, // card height in px
  radius: 20, // corner roundness in px
  swipeThreshold: 80, // how far someone has to drag before the card flies off
  stackRotation: 3.5, // degrees each card behind the front one tilts
  stackScale: 0.04, // how much smaller each card behind the front one gets
  tiltStrength: 18, // how far the card tilts while dragging (3D effect)
  springStiffness: 340, // snappy drag return animation
  springDamping: 26, // quick settling bounce
  mobileBreakpoint: 640,
  mobileScale: 0.84,
};

export type SwipeCardsSettings = typeof defaultSettings;

export interface SwipeCardItem {
  id: number | string;
  img?: string;
  [key: string]: any;
}

interface SwipeCardProps {
  children: React.ReactNode;
  isFront: boolean;
  zIndex: number;
  onSendToBack: () => void;
  settings: SwipeCardsSettings;
}

function SwipeCard({
  children,
  isFront,
  zIndex,
  onSendToBack,
  settings,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isExiting, setIsExiting] = useState(false);
  const [exitX, setExitX] = useState(0);

  // Turn horizontal drag distance into a dynamic tilt effect
  const rotateZ = useTransform(x, [-250, 250], [-14, 14]);
  const rotateY = useTransform(
    x,
    [-200, 200],
    [-settings.tiltStrength, settings.tiltStrength],
  );

  function handleDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    if (!isFront || isExiting) return;

    const velocityX = info.velocity.x;
    const offsetX = info.offset.x;
    const isFlick = Math.abs(velocityX) > 350;
    const isDrag = Math.abs(offsetX) > settings.swipeThreshold;

    if (isFlick || isDrag) {
      // Determine exit direction based on velocity or drag distance
      const dir = velocityX !== 0 ? Math.sign(velocityX) : Math.sign(offsetX);
      const targetX = dir * (typeof window !== "undefined" ? Math.max(window.innerWidth * 0.7, 420) : 420);
      setExitX(targetX);
      setIsExiting(true);
    } else {
      // Smooth spring snap back to center
      x.set(0);
      y.set(0);
    }
  }

  // Once exit animation finishes, send card to back and reset
  const handleAnimationComplete = () => {
    if (isExiting) {
      onSendToBack();
      setIsExiting(false);
      setExitX(0);
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      className={`absolute select-none ${isFront ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
      style={{
        width: settings.width,
        height: settings.height,
        x: isExiting ? exitX : (isFront ? x : 0),
        y: isFront ? y : 0,
        rotateZ: isExiting ? (exitX > 0 ? 12 : -12) : (isFront ? rotateZ : 0),
        rotateY: isFront ? rotateY : 0,
        zIndex,
        touchAction: "pan-y",
        willChange: "transform, opacity",
      }}
      drag={isFront && !isExiting ? "x" : false}
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.35}
      onDragEnd={handleDragEnd}
      animate={
        isExiting
          ? { x: exitX, opacity: 0, scale: 0.92 }
          : { opacity: 1, scale: 1 }
      }
      transition={
        isExiting
          ? { duration: 0.22, ease: "easeOut" }
          : {
              type: "spring",
              stiffness: settings.springStiffness,
              damping: settings.springDamping,
            }
      }
      onAnimationComplete={handleAnimationComplete}
    >
      {children}
    </motion.div>
  );
}

export interface SwipeCardsRef {
  next: () => void;
  prev: () => void;
  bringToFront: (id: string | number) => void;
}

export interface SwipeCardsProps {
  cards?: SwipeCardItem[];
  settings?: Partial<SwipeCardsSettings>;
  className?: string;
  renderCard?: (card: SwipeCardItem, index: number, isFront: boolean) => React.ReactNode;
  onCardChange?: (currentCard: SwipeCardItem, index: number) => void;
}

// Shrinks stack smoothly on small screens to fit mobile viewports without glitch
function useResponsiveScale(breakpoint: number, mobileScale: number) {
  const [scale, setScale] = useState(1);

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setScale(mq.matches ? mobileScale : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint, mobileScale]);

  return scale;
}

export const SwipeCards = forwardRef<SwipeCardsRef, SwipeCardsProps>(
  function SwipeCards(
    {
      cards = defaultCards,
      settings,
      className = "",
      renderCard,
      onCardChange,
    },
    ref,
  ) {
    const baseConfig = { ...defaultSettings, ...settings };
    const scale = useResponsiveScale(
      baseConfig.mobileBreakpoint,
      baseConfig.mobileScale,
    );
    const config = {
      ...baseConfig,
      width: Math.round(baseConfig.width * scale),
      height: Math.round(baseConfig.height * scale),
    };
    const [cardList, setCardList] = useState(cards);

    // Update if incoming cards list changes length
    React.useEffect(() => {
      setCardList(cards);
    }, [cards]);

    // Send front card to back of pile
    const moveToBack = useCallback((id: number | string) => {
      setCardList((prev) => {
        const updated = [...prev];
        const cardIndex = updated.findIndex((card) => card.id === id);
        if (cardIndex !== -1) {
          const [movedCard] = updated.splice(cardIndex, 1);
          updated.push(movedCard);
        }
        if (updated.length > 0 && onCardChange) {
          onCardChange(updated[0], 0);
        }
        return updated;
      });
    }, [onCardChange]);

    // Bring the previous card from the back to the front
    const moveToFront = useCallback(() => {
      setCardList((prev) => {
        if (prev.length <= 1) return prev;
        const updated = [...prev];
        const lastCard = updated.pop();
        if (lastCard) {
          updated.unshift(lastCard);
        }
        if (updated.length > 0 && onCardChange) {
          onCardChange(updated[0], 0);
        }
        return updated;
      });
    }, [onCardChange]);

    // Jump directly to a card by ID
    const bringToFront = useCallback((id: number | string) => {
      setCardList((prev) => {
        const updated = [...prev];
        const cardIndex = updated.findIndex((card) => card.id === id);
        if (cardIndex > 0) {
          const itemsToMove = updated.splice(0, cardIndex);
          updated.push(...itemsToMove);
        }
        if (updated.length > 0 && onCardChange) {
          onCardChange(updated[0], 0);
        }
        return updated;
      });
    }, [onCardChange]);

    // Expose imperative API for buttons/tabs
    useImperativeHandle(ref, () => ({
      next: () => {
        if (cardList.length > 0) moveToBack(cardList[0].id);
      },
      prev: moveToFront,
      bringToFront,
    }));

    return (
      <div
        className={`flex items-center justify-center select-none ${className}`}
      >
        <div
          className="relative mx-auto flex items-center justify-center"
          style={{
            width: config.width,
            height: config.height,
            perspective: 1200,
          }}
        >
          {cardList.map((card, index) => {
            const isFront = index === 0;
            // Only render top 3 cards for silky 60fps performance on mobile
            if (index > 2) return null;
            const zIndex = cardList.length - index;

            return (
              <SwipeCard
                key={card.id}
                isFront={isFront}
                zIndex={zIndex}
                settings={config}
                onSendToBack={() => moveToBack(card.id)}
              >
                <motion.div
                  className="relative h-full w-full overflow-hidden shadow-2xl"
                  style={{ 
                    borderRadius: config.radius,
                    transformOrigin: "50% 100%", // Anchored at bottom center to eliminate awkward elevation
                  }}
                  animate={{
                    rotateZ: index * (index % 2 === 0 ? config.stackRotation : -config.stackRotation),
                    scale: 1 - index * config.stackScale,
                    y: index * 4,
                  }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                >
                  {renderCard ? (
                    renderCard(card, index, isFront)
                  ) : (
                    <div className="relative w-full h-full bg-neutral-900">
                      <FallbackImage
                        src={card.img || ""}
                        alt={`card-${card.id}`}
                        fill
                        className="pointer-events-none object-cover"
                        priority={isFront}
                      />
                    </div>
                  )}
                </motion.div>
              </SwipeCard>
            );
          })}
        </div>
      </div>
    );
  },
);

export default SwipeCards;
