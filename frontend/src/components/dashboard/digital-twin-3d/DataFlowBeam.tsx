"use client";
import { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { DevicePosition3D } from "@/lib/dashboard/deviceTypes";

type FlowKind = "data" | "power";

export function DataFlowBeam({
  from,
  to = { x: 0, y: 0.35, z: 0 },
  kind = "data",
  color,
  active = true,
}: {
  from: DevicePosition3D;
  to?: DevicePosition3D;
  kind?: FlowKind;
  color?: string;
  active?: boolean;
}) {
  const pulse = useRef<Mesh>(null);
  const flowColor = color || (kind === "power" ? "#facc15" : "#22d3ee");
  const yOffset = kind === "power" ? 0.16 : 0.24;
  const points = useMemo(
    () => [
      [from.x, from.y + yOffset, from.z] as [number, number, number],
      [(from.x + to.x) / 2, Math.max(from.y, to.y) + yOffset + 0.2, (from.z + to.z) / 2] as [number, number, number],
      [to.x, to.y + yOffset, to.z] as [number, number, number],
    ],
    [from.x, from.y, from.z, to.x, to.y, to.z, yOffset]
  );

  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const t = (clock.elapsedTime * (kind === "power" ? 0.42 : 0.62)) % 1;
    pulse.current.position.set(
      lerp(from.x, to.x, t),
      lerp(from.y + yOffset + 0.06, to.y + yOffset + 0.06, t),
      lerp(from.z, to.z, t)
    );
  });

  return (
    <group>
      <Line points={points} color={flowColor} lineWidth={kind === "power" ? 2.5 : 1.35} transparent opacity={active ? 0.78 : 0.25} />
      {active && (
        <mesh ref={pulse}>
          <sphereGeometry args={[kind === "power" ? 0.045 : 0.032, 12, 12]} />
          <meshStandardMaterial color={flowColor} emissive={flowColor} emissiveIntensity={1.8} />
        </mesh>
      )}
    </group>
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
