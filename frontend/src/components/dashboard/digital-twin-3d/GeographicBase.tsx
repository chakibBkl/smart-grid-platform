"use client";
import { Line } from "@react-three/drei";
import { Shape } from "three";

const regionBoundary = [
  [-4.4, 0.035, -2.8],
  [-2.5, 0.045, -3.75],
  [0.85, 0.04, -3.55],
  [4.2, 0.04, -2.25],
  [4.5, 0.04, 1.85],
  [2.1, 0.04, 3.55],
  [-1.25, 0.04, 3.75],
  [-4.55, 0.04, 2.05],
  [-4.4, 0.035, -2.8],
] as [number, number, number][];

const corridors = [
  [[-4.0, 0.055, -0.6], [-1.4, 0.055, -0.2], [1.4, 0.055, 0.4], [4.0, 0.055, 1.2]],
  [[-2.8, 0.055, -3.0], [-1.1, 0.055, -1.0], [0.4, 0.055, 0.2], [2.8, 0.055, 2.75]],
  [[-3.8, 0.055, 2.2], [-1.2, 0.055, 1.4], [1.4, 0.055, 0.9], [3.8, 0.055, -1.5]],
] as [number, number, number][][];

export function GeographicBase({ visible }: { visible: boolean }) {
  if (!visible) return <TechnicalGrid />;
  return (
    <group>
      {/* subtle green tint only — keeps the terrain visible underneath */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <shapeGeometry args={[makeRegionShape()]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} metalness={0} transparent opacity={0.07} />
      </mesh>
      <Line points={regionBoundary} color="#16a34a" lineWidth={2.4} transparent opacity={0.85} />
      {corridors.map((points, index) => (
        <Line key={index} points={points} color={index === 0 ? "#0284c7" : "#d97706"} lineWidth={1.6} transparent opacity={0.5} />
      ))}
      <ZonePatch position={[-2.9, 0.03, -1.65]} color="#38bdf8" />
      <ZonePatch position={[2.35, 0.032, 1.2]} color="#fb923c" />
      <ZonePatch position={[3.25, 0.034, 2.05]} color="#facc15" />
      <ZonePatch position={[0.15, 0.036, -2.65]} color="#60a5fa" />
    </group>
  );
}

function TechnicalGrid() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
      <ringGeometry args={[1.1, 5.0, 96]} />
      <meshStandardMaterial color="#22d3ee" transparent opacity={0.06} />
    </mesh>
  );
}

function ZonePatch({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <circleGeometry args={[0.95, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.05} transparent opacity={0.1} />
    </mesh>
  );
}

function makeRegionShape() {
  const shape = new Shape();
  regionBoundary.forEach(([x, , z], index) => {
    if (index === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  return shape;
}
