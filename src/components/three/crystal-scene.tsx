import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Sparkles, Lightformer, Environment } from "@react-three/drei";
import * as THREE from "three";

function CrystalCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.3, 0), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.08 + mouse.current.y * 0.15;
    meshRef.current.rotation.y = t * 0.12 + mouse.current.x * 0.15;

    mouse.current.x += (state.pointer.x - mouse.current.x) * 0.03;
    mouse.current.y += (state.pointer.y - mouse.current.y) * 0.03;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef} geometry={geometry} scale={Math.min(viewport.width / 6, 1.4)}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.5}
          samples={10}
          resolution={512}
          thickness={0.8}
          chromaticAberration={0.55}
          anisotropy={0.4}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[0, 1400]}
          color="#cfe0ff"
          roughness={0}
          ior={1.5}
          envMapIntensity={2.2}
          clearcoat={1}
        />
      </mesh>
      {/* Inner emissive core so the crystal reads as a light source, not a void */}
      <mesh scale={Math.min(viewport.width / 6, 1.4) * 0.5}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.18} />
      </mesh>
    </Float>
  );
}

/** Procedural studio environment built from emissive panels — no external HDR fetch required. */
function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={3} color="#6366f1" position={[3, 2, 2]} scale={[3, 3, 1]} />
      <Lightformer form="rect" intensity={3} color="#22d3ee" position={[-3, -1, -2]} scale={[3, 3, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#a855f7" position={[0, 3, -3]} scale={[4, 2, 1]} />
      <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 0, 4]} scale={3} />
    </Environment>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 3, 4]} intensity={60} color="#6366f1" />
      <pointLight position={[-4, -2, -3]} intensity={45} color="#22d3ee" />
      <pointLight position={[0, 4, -2]} intensity={40} color="#a855f7" />
      <pointLight position={[0, 0, 5]} intensity={20} color="#ffffff" />
    </>
  );
}

export function CrystalScene({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <StudioEnvironment />
          <Lighting />
          <CrystalCore />
          <Sparkles count={40} scale={6} size={1.5} speed={0.3} color="#9bb8ff" opacity={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
