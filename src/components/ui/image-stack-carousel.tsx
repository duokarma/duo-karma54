import React, { useState, forwardRef, useImperativeHandle } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

// Compatible image component that works in Next.js, Vite, and standard React environments
const FallbackImage = ({
  src,
  alt,
  fill,
  className,
  priority,
  sizes,
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
  swipeThreshold: 100, // how far someone has to drag before the card flies off
  stackRotation: 4, // degrees each card behind the front one tilts
  stackScale: 0.04, // how much smaller each card behind the front one gets
  tiltStrength: 22, // how far the card tilts while dragging (3D effect)
  springStiffness: 300, // how snappy the drag/return animation feels
  springDamping: 28, // how quickly the bounce settles
  mobileBreakpoint: 640,
  mobileScale: 0.88,
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

  // Turn drag distance into a 3D tilt effect
  const rotateX = useTransform(
    y,
    [-200, 200],
    [settings.tiltStrength, -settings.tiltStrength],
  );
  const rotateY = useTransform(
    x,
    [-200, 200],
    [-settings.tiltStrength, settings.tiltStrength],
  );

  function handleDragEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const draggedFarEnough =
      Math.abs(info.offset.x) > settings.swipeThreshold ||
      Math.abs(info.offset.y) > settings.swipeThreshold;

    if (draggedFarEnough) {
      onSendToBack();
    } else {
      // Snap back to center
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute cursor-grab select-none active:cursor-grabbing"
      style={{
        width: settings.width,
        height: settings.height,
        x: isFront ? x : 0,
        y: isFront ? y : 0,
        rotateX: isFront ? rotateX : 0,
        rotateY: isFront ? rotateY : 0,
        zIndex,
        touchAction: "none",
      }}
      drag={isFront}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.45}
      onDragEnd={handleDragEnd}
      whileHover={isFront ? { scale: 1.02 } : {}}
      transition={{
        type: "spring",
        stiffness: settings.springStiffness,
        damping: settings.springDamping,
      }}
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

// Shrinks stack smoothly on small screens to fit mobile viewports
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

    // Update if incoming cards list changes length or identity
    React.useEffect(() => {
      setCardList(cards);
    }, [cards]);

    // Notify parent whenever front card changes
    React.useEffect(() => {
      if (cardList.length > 0 && onCardChange) {
        onCardChange(cardList[0], 0);
      }
    }, [cardList, onCardChange]);

    // Send the front card to the back of the pile after a swipe
    const moveToBack = (id: number | string) => {
      setCardList((prev) => {
        const updated = [...prev];
        const cardIndex = updated.findIndex((card) => card.id === id);
        if (cardIndex !== -1) {
          const [movedCard] = updated.splice(cardIndex, 1);
          updated.push(movedCard);
        }
        return updated;
      });
    };

    // Bring the previous card from the back to the front
    const moveToFront = () => {
      setCardList((prev) => {
        if (prev.length <= 1) return prev;
        const updated = [...prev];
        const lastCard = updated.pop();
        if (lastCard) {
          updated.unshift(lastCard);
        }
        return updated;
      });
    };

    // Jump directly to a card by ID
    const bringToFront = (id: number | string) => {
      setCardList((prev) => {
        const updated = [...prev];
        const cardIndex = updated.findIndex((card) => card.id === id);
        if (cardIndex > 0) {
          const itemsToMove = updated.splice(0, cardIndex);
          updated.push(...itemsToMove);
        }
        return updated;
      });
    };

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
            // Only render top 4 cards for optimal performance
            if (index > 3) return null;
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
                  style={{ borderRadius: config.radius }}
                  animate={{
                    rotateZ: index * config.stackRotation,
                    scale: 1 - index * config.stackScale,
                    y: index * 6,
                    transformOrigin: "85% 85%",
                  }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
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
