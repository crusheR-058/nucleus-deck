"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState } from "react";
import { DoubleSide, MathUtils, type Group, type Mesh, type MeshStandardMaterial } from "three";

// Three electron orbit planes (Euler tilts) shared by the rings + electrons.
const RINGS: [number, number, number][] = [
  [0.5, 0.2, 0],
  [Math.PI * 0.55, 0.9, 0.4],
  [Math.PI * 0.9, 1.6, 1.0],
];

/** A glowing electron that orbits around one tilted ring plane. */
function Electron({ tilt, radius, speed, phase }: { tilt: [number, number, number]; radius: number; speed: number; phase: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    ref.current?.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0);
  });
  return (
    <group rotation={tilt}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} roughness={0.25} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Atom({ hovered, reduced }: { hovered: boolean; reduced: boolean }) {
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    // The core brightens smoothly on hover.
    const mat = core.current?.material as MeshStandardMaterial | undefined;
    if (mat) mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, hovered ? 1.5 : 0.65, Math.min(d * 6, 1));
    // Gentle extra life on the whole atom (camera also auto-rotates via controls).
    if (group.current && !reduced) group.current.rotation.y += d * (hovered ? 0.5 : 0.15);
  });

  return (
    <group ref={group}>
      {/* nucleus core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.65} roughness={0.18} metalness={0.25} flatShading />
      </mesh>

      {/* orbit rings */}
      {RINGS.map((tilt, i) => (
        <mesh key={i} rotation={tilt}>
          <torusGeometry args={[1.22, 0.022, 12, 80]} />
          <meshStandardMaterial color="#c8ccd6" roughness={0.35} metalness={0.5} side={DoubleSide} />
        </mesh>
      ))}

      {/* orbiting electrons (static when reduced-motion is on) */}
      {!reduced && RINGS.map((tilt, i) => <Electron key={i} tilt={tilt} radius={1.22} speed={0.8 + i * 0.35} phase={i * 2.1} />)}
    </group>
  );
}

export function NucleusAtom({ reduced }: { reduced: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", cursor: "grab" }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} color="#ffffff" />
      <directionalLight position={[-4, -2, 1]} intensity={0.5} color="#dfe3ec" />
      <pointLight position={[0, 0, 0]} intensity={0.9} color="#ffffff" />
      <Atom hovered={hovered} reduced={reduced} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={!reduced}
        autoRotate={!reduced}
        autoRotateSpeed={hovered ? 3.4 : 1.1}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}
