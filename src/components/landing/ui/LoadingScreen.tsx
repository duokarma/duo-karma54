/**
 * LoadingScreen — now a thin wrapper around IntroOverlay.
 *
 * The full intro logic (context, responsive video, fade-out) lives in:
 *   - src/context/IntroContext.tsx
 *   - src/hooks/use-intro.ts
 *   - src/components/landing/IntroVideo.tsx
 *   - src/components/landing/IntroOverlay.tsx
 *
 * This component keeps the same export name so nothing else needs to change.
 */
export { IntroOverlay as LoadingScreen } from '@/components/landing/IntroOverlay';
