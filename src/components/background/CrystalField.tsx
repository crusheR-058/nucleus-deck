"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  DoubleSide,
  type Group,
  type Mesh,
  type Points,
} from "three";
import { pointer } from "@/lib/hooks";

/** A single faceted ice/glass crystal shard with silver reflections. */
function Crystal({
  position,
  scale,
  geo,
  speed = 1,
}: {
  position: [number, number, number];
  scale: number;
  geo: "ico" | "octa" | "dodeca";
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const d = Math.min(dt, 0.05);
    ref.current.rotation.x += d * 0.06 * speed;
    ref.current.rotation.y += d * 0.09 * speed;
  });
  return (
    <Float speed={1.1 * speed} rotationIntensity={0.35} floatIntensity={1.3}>
      <mesh ref={ref} position={position} scale={scale}>
        {geo === "ico" && <icosahedronGeometry args={[1, 0]} />}
        {geo === "octa" && <octahedronGeometry args={[1, 0]} />}
        {geo === "dodeca" && <dodecahedronGeometry args={[1, 0]} />}
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.34}
          roughness={0.07}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.08}
          ior={1.5}
          reflectivity={0.7}
          envMapIntensity={1.7}
          flatShading
          side={DoubleSide}
        />
      </mesh>
    </Float>
  );
}

/** Drifting silver particle dust with additive glow. */
function Dust({ count = 700 }: { count?: number }) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.015 + pointer.sx * 0.18;
    ref.current.rotation.x = pointer.sy * 0.1;
    ref.current.position.y = Math.sin(t * 0.1) * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

/** Subtle camera parallax that follows the smoothed pointer. */
function Rig({ group }: { group: React.RefObject<Group> }) {
  useFrame((state) => {
    const cam = state.camera;
    const tx = pointer.sx * 0.7;
    const ty = -pointer.sy * 0.45;
    cam.position.x += (tx - cam.position.x) * 0.045;
    cam.position.y += (ty - cam.position.y) * 0.045;
    cam.lookAt(0, 0, 0);
    if (group.current) {
      group.current.rotation.y = pointer.sx * 0.12;
      group.current.rotation.x = pointer.sy * 0.06;
    }
  });
  return null;
}

function Scene({ particles }: { particles: number }) {
  const group = useRef<Group>(null);
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-6, -2, 2]} intensity={0.4} color="#dfe3ec" />

      <group ref={group}>
        <Crystal position={[-3.6, 1.4, -1]} scale={1.5} geo="ico" speed={0.8} />
        <Crystal position={[3.8, -1.2, -2]} scale={2.1} geo="dodeca" speed={0.6} />
        <Crystal position={[1.4, 2.2, -3]} scale={1.0} geo="octa" speed={1.1} />
        <Crystal position={[-2.2, -2.0, -1.5]} scale={1.2} geo="octa" speed={0.9} />
        <Crystal position={[0.2, -0.4, 0.6]} scale={0.8} geo="ico" speed={1.3} />
        <Crystal position={[5.0, 2.0, -4]} scale={1.3} geo="ico" speed={0.7} />
        <Dust count={particles} />
      </group>

      <Rig group={group} />

      {/* Procedural bright "studio" reflections — no network HDR, works offline. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 2.5, 4]} scale={[10, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.3} position={[-5, 1, 2]} scale={[3, 8, 1]} color="#eef1f6" />
        <Lightformer form="circle" intensity={1.6} position={[4, 3, 3]} scale={4} color="#ffffff" />
        <Lightformer form="ring" intensity={1.0} position={[-3, -3, 1]} scale={5} color="#d7dbe5" />
      </Environment>
    </>
  );
}

export function CrystalField({ particles = 700 }: { particles?: number }) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <Scene particles={particles} />
      </Suspense>
    </Canvas>
  );
}
