import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createCoverTexture,
  createSpineTexture,
  createBackCoverTexture,
  createPageEdgesTexture,
} from './MagazineTextures';

interface MagazineMeshProps {
  onOpenSpread: () => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  rotationYRef: React.MutableRefObject<number>;
  rotationXRef: React.MutableRefObject<number>;
}

function MagazineModel({ onOpenSpread, isDraggingRef, rotationYRef, rotationXRef }: MagazineMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef({ x: 0.18, y: -0.45 });
  const currentRotation = useRef({ x: 0.18, y: -0.45 });
  const hoverRef = useRef(false);

  // Generate textures once and memoize materials
  const materials = useMemo(() => {
    const coverTex = createCoverTexture();
    const spineTex = createSpineTexture();
    const backTex = createBackCoverTexture();
    const edgesTex = createPageEdgesTexture();

    const edgeMat = new THREE.MeshStandardMaterial({
      map: edgesTex,
      roughness: 0.85,
      metalness: 0.1,
    });

    const spineMat = new THREE.MeshStandardMaterial({
      map: spineTex,
      roughness: 0.45,
      metalness: 0.35,
    });

    const frontMat = new THREE.MeshStandardMaterial({
      map: coverTex,
      roughness: 0.35,
      metalness: 0.25,
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: backTex,
      roughness: 0.35,
      metalness: 0.25,
    });

    // Box faces: [+X (right edges), -X (left spine), +Y (top edges), -Y (bottom edges), +Z (front cover), -Z (back cover)]
    return [
      edgeMat,  // +X right edges
      spineMat, // -X spine
      edgeMat,  // +Y top edges
      edgeMat,  // -Y bottom edges
      frontMat, // +Z front cover
      backMat,  // -Z back cover
    ];
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // If user is dragging, sync target to external rotation refs
    if (isDraggingRef.current) {
      targetRotation.current.y = rotationYRef.current;
      targetRotation.current.x = rotationXRef.current;
    } else {
      // Gentle floating turntable rotation when idle
      targetRotation.current.y += delta * 0.25;
      rotationYRef.current = targetRotation.current.y;
    }

    // Smooth dampening towards target rotation
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.12;
    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.12;

    meshRef.current.rotation.y = currentRotation.current.y;
    meshRef.current.rotation.x = currentRotation.current.x;

    // Elegant vertical levitation float
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * 1.4) * 0.12;
  });

  return (
    <group>
      {/* 3D Magazine Volumetric Mesh */}
      <mesh
        ref={meshRef}
        material={materials}
        position={[0, 0, 0]}
        onPointerOver={() => { hoverRef.current = true; }}
        onPointerOut={() => { hoverRef.current = false; }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenSpread();
        }}
      >
        {/* Dimensions: width=2.4, height=3.3, thickness=0.22 */}
        <boxGeometry args={[2.4, 3.3, 0.22]} />
      </mesh>

      {/* Realistic Contact Shadow on ground */}
      <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <meshBasicMaterial
          transparent
          opacity={0.4}
          color="#000000"
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function Magazine3D({ onOpen }: { onOpen: () => void }) {
  const isDraggingRef = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const rotationYRef = useRef(-0.45);
  const rotationXRef = useRef(0.18);
  const hasMovedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }

    rotationYRef.current += dx * 0.008;
    rotationXRef.current = Math.max(-0.6, Math.min(0.6, rotationXRef.current + dy * 0.005));

    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleReset = () => {
    rotationYRef.current = -0.45;
    rotationXRef.current = 0.18;
  };

  return (
    <div
      className="relative w-full h-[540px] sm:h-[620px] md:h-[700px] flex items-center justify-center select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Soft Directional Studio Lighting */}
        <ambientLight intensity={0.9} color="#FFFBF0" />
        <directionalLight position={[4, 5, 5]} intensity={2.2} color="#FFFFFF" />
        <directionalLight position={[-4, 3, -3]} intensity={1.4} color="#C5A46D" />
        <directionalLight position={[0, -3, 3]} intensity={0.7} color="#F2EEE6" />

        <MagazineModel
          onOpenSpread={() => {
            if (!hasMovedRef.current) {
              onOpen();
            }
          }}
          isDraggingRef={isDraggingRef}
          rotationYRef={rotationYRef}
          rotationXRef={rotationXRef}
        />
      </Canvas>

      {/* Floating 3D Interaction Control HUD */}
      <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-3 pointer-events-none px-4 z-20">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#11110F]/90 border border-[#292720] shadow-xl backdrop-blur-md pointer-events-auto">
          <span
            className="text-[11px] font-mono tracking-wider uppercase text-[#C5A46D] flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D] animate-pulse" />
            Drag to Rotate 360°
          </span>

          <span className="w-px h-3.5 bg-[#292720]" />

          <button
            onClick={handleReset}
            className="text-[11px] font-mono tracking-wider uppercase text-[#A6A197] hover:text-[#F2EEE6] transition-colors cursor-pointer px-2 py-0.5"
            title="Reset to 3/4 front view"
          >
            Reset
          </button>

          <span className="w-px h-3.5 bg-[#292720]" />

          <button
            onClick={onOpen}
            className="text-[11px] font-mono tracking-wider uppercase bg-[#C5A46D] hover:bg-[#D7BC8C] text-[#0A0A09] font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer"
          >
            Open Folio ↗
          </button>
        </div>
      </div>
    </div>
  );
}
