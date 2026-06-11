"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3, type Group } from "three";
import type { DeviceData } from "@/lib/dashboard/deviceTypes";

/** Animated life for the digital twin: cars driving the perimeter road and
 *  small workers walking near the installations. Kept tiny, slow, and subtle
 *  so it adds life without distracting from the grid model itself. */

function hashString(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function mulberry32(seed: number) {
  let a = Math.floor(seed * 4294967296) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const carColors = ["#e2e8f0", "#dc2626", "#2563eb", "#f59e0b"];
const shirtColors = ["#f97316", "#0ea5e9", "#facc15", "#22c55e", "#e2e8f0", "#ef4444"];

export function LifeLayer({ devices, seedKey }: { devices: DeviceData[]; seedKey: string }) {
  const seed = useMemo(() => hashString(seedKey) * 53.7, [seedKey]);

  // closed loop slightly outside the ring road so cars never clip the devices
  const roadCurve = useMemo(() => {
    const sites = devices.filter((device) => device.type !== "data_hub");
    if (sites.length < 3) return null;
    const ordered = [...sites].sort(
      (a, b) => Math.atan2(a.position3D.z, a.position3D.x) - Math.atan2(b.position3D.z, b.position3D.x)
    );
    const points = ordered.map((site) => new Vector3(site.position3D.x * 1.16, 0.02, site.position3D.z * 1.16));
    return new CatmullRomCurve3(points, true, "catmullrom", 0.6);
  }, [devices]);

  const cars = useMemo(() => {
    const rng = mulberry32(seed + 0.31);
    return [0, 1, 2, 3].map((i) => ({
      offset: i / 4 + rng() * 0.1,
      speed: 0.011 + rng() * 0.007,
      color: carColors[i % carColors.length],
      direction: i % 2 === 0 ? 1 : -1,
    }));
  }, [seed]);

  const people = useMemo(() => {
    const rng = mulberry32(seed + 0.77);
    const anchors = devices
      .filter((device) => ["data_hub", "battery", "solar_plant", "smart_meter", "transformer", "wind_site"].includes(device.type))
      .map((device) => device.position3D);
    if (anchors.length === 0) return [];
    return Array.from({ length: 6 }, (_, i) => {
      const anchor = anchors[i % anchors.length];
      return {
        x: anchor.x,
        z: anchor.z,
        radius: 0.55 + rng() * 0.35,
        speed: (0.25 + rng() * 0.25) * (i % 2 === 0 ? 1 : -1),
        phase: rng() * Math.PI * 2,
        shirt: shirtColors[i % shirtColors.length],
      };
    });
  }, [devices, seed]);

  return (
    <group>
      {roadCurve && cars.map((car, index) => <Car key={index} curve={roadCurve} {...car} />)}
      {people.map((person, index) => (
        <Person key={index} {...person} />
      ))}
    </group>
  );
}

function Car({
  curve,
  offset,
  speed,
  color,
  direction,
}: {
  curve: CatmullRomCurve3;
  offset: number;
  speed: number;
  color: string;
  direction: number;
}) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.elapsedTime * speed * direction + offset) % 1 + 1) % 1;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).multiplyScalar(direction);
    ref.current.position.set(point.x, 0.02, point.z);
    ref.current.rotation.y = Math.atan2(tangent.x, tangent.z);
  });

  return (
    <group ref={ref}>
      {/* body */}
      <mesh position={[0, 0.045, 0]} castShadow>
        <boxGeometry args={[0.09, 0.045, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.45} roughness={0.35} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, 0.082, -0.015]} castShadow>
        <boxGeometry args={[0.078, 0.038, 0.1]} />
        <meshStandardMaterial color="#cfe2f3" metalness={0.3} roughness={0.15} />
      </mesh>
      {/* wheels */}
      {[
        [-0.045, 0.06],
        [0.045, 0.06],
        [-0.045, -0.065],
        [0.045, -0.065],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.022, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.018, 10]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
      ))}
      {/* headlights */}
      {[-0.028, 0.028].map((x) => (
        <mesh key={x} position={[x, 0.05, 0.102]}>
          <sphereGeometry args={[0.009, 8, 8]} />
          <meshStandardMaterial color="#fff7d6" emissive="#ffe9a3" emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

function Person({
  x,
  z,
  radius,
  speed,
  phase,
  shirt,
}: {
  x: number;
  z: number;
  radius: number;
  speed: number;
  phase: number;
  shirt: string;
}) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const a = clock.elapsedTime * speed + phase;
    const px = x + Math.cos(a) * radius;
    const pz = z + Math.sin(a) * radius;
    const bob = 0.008 * Math.abs(Math.sin(a * 14));
    ref.current.position.set(px, bob, pz);
    // face the walking direction
    ref.current.rotation.y = Math.atan2(-Math.sin(a) * Math.sign(speed), Math.cos(a) * Math.sign(speed));
  });

  return (
    <group ref={ref}>
      {/* legs */}
      <mesh position={[0, 0.028, 0]}>
        <cylinderGeometry args={[0.013, 0.016, 0.055, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>
      {/* torso (hi-vis vest) */}
      <mesh position={[0, 0.082, 0]} castShadow>
        <capsuleGeometry args={[0.018, 0.05, 4, 10]} />
        <meshStandardMaterial color={shirt} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshStandardMaterial color="#e8b88a" roughness={0.6} />
      </mesh>
      {/* hard hat */}
      <mesh position={[0, 0.152, 0]}>
        <sphereGeometry args={[0.016, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#facc15" roughness={0.5} />
      </mesh>
    </group>
  );
}
