import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from './ui/theme';
import { Eyebrow } from './ui/Eyebrow';
import { MagneticButton } from './ui/MagneticButton';

function Panel({ position, rotation, scale = 1, color = COLORS.accent, speed = 1 }: any) {
  const ref = useRef<THREE.Mesh>(null!);
  const seed = useMemo(() => Math.random() * 100, []);
  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime() * speed + seed;
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.18;
    ref.current.rotation.x = rotation[0] + mouse.y * 0.15;
    ref.current.rotation.y = rotation[1] + mouse.x * 0.25 + Math.sin(t * 0.3) * 0.05;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.6, 1, 1]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.08}
        roughness={0.2}
        metalness={0.3}
        transmission={0.6}
        thickness={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Rays() {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.02;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, 0.4]} position={[0, 0, -3]}>
        <planeGeometry args={[12, 0.4]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.04} />
      </mesh>
      <mesh rotation={[0, 0, -0.3]} position={[1, -1, -3]}>
        <planeGeometry args={[14, 0.3]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.35 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 2, 4]} intensity={1.2} color={COLORS.accent2} />
      <pointLight position={[-3, -1, 2]} intensity={0.5} color={COLORS.emerald} />
      <Suspense fallback={null}>
        <Panel position={[-1.4, 0.4, -1]} rotation={[0.1, 0.4, 0]} scale={1.1} speed={0.8} />
        <Panel position={[1.5, -0.3, -1.5]} rotation={[-0.15, -0.3, 0.1]} scale={0.9} color={COLORS.emerald} speed={1.1} />
        <Panel position={[0.2, 0.9, -2]} rotation={[0.2, 0.1, -0.1]} scale={0.7} speed={0.6} />
        <Panel position={[-0.6, -0.9, -0.5]} rotation={[-0.05, 0.2, 0.05]} scale={0.6} speed={1.3} />
        <Rays />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);
  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 640,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <HeroScene />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 0%, rgba(10,9,8,0.4) 60%, rgba(10,9,8,0.95) 100%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 20px" }}>
        <AnimatePresence>
          {loaded && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Eyebrow>
                  <span style={{ margin: "0 auto" }} />
                </Eyebrow>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 400,
                  fontSize: "clamp(38px, 6.2vw, 84px)",
                  lineHeight: 1.05,
                  color: COLORS.text,
                  maxWidth: 900,
                  margin: "0 auto",
                }}
              >
                We build software
                <br />
                businesses <em style={{ color: COLORS.accent, fontStyle: "italic" }}>actually use.</em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35 }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  color: COLORS.secondary,
                  maxWidth: 480,
                  margin: "22px auto 36px",
                  lineHeight: 1.6,
                }}
              >
                DuoKarma designs and builds custom dashboards, booking platforms, and
                business systems — the kind that replace spreadsheets, not decorate a homepage.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ display: "flex", gap: 14, justifyContent: "center" }}
              >
                <MagneticButton primary onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}>Book free consultation</MagneticButton>
                <MagneticButton onClick={() => {
                  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
                }}>See our work</MagneticButton>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.15em",
          color: COLORS.secondary,
          textTransform: "uppercase",
        }}
      >
        Scroll
      </motion.div>
    </section>
  );
}