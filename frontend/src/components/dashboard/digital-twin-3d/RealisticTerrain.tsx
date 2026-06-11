"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { DeviceData } from "@/lib/dashboard/deviceTypes";

const SIZE = 18;
const SEGMENTS = 150;
const TEX = 512;
const WATER_LEVEL = -0.06;

type TerrainKind = "coastal" | "desert" | "oasis" | "highland";

const regionTerrainKind: Record<string, TerrainKind> = {
  algiers: "coastal",
  arzew: "coastal",
  skikda: "coastal",
  annaba: "coastal",
  "setif-bba": "highland",
  ghardaia: "oasis",
  biskra: "oasis",
  adrar: "desert",
  tamanrasset: "desert",
  "bechar-tindouf": "desert",
  "hassi-messaoud": "desert",
  "hassi-rmel": "desert",
};

// ---------- deterministic noise helpers ----------

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

function vnHash(x: number, y: number, seed: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function noise2(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = vnHash(xi, yi, seed);
  const b = vnHash(xi + 1, yi, seed);
  const c = vnHash(xi, yi + 1, seed);
  const d = vnHash(xi + 1, yi + 1, seed);
  const u = smooth(xf);
  const v = smooth(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, seed: number, octaves = 4) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x * freq, y * freq, seed + i * 13.7);
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum;
}

function ridged(x: number, y: number, seed: number, octaves = 4) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    const n = noise2(x * freq, y * freq, seed + i * 7.3);
    sum += amp * (1 - Math.abs(2 * n - 1));
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum;
}

/** Smooth ramp from 0 at `a` to 1 at `b` (works in either direction). */
function ramp(a: number, b: number, v: number) {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return smooth(t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixColor(c1: number[], c2: number[], t: number) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

// ---------- terrain height model ----------

function makeHeightFn(kind: TerrainKind, seed: number) {
  return (x: number, z: number): number => {
    const r = Math.hypot(x, z);
    // device plateau stays dead flat; gentle relief starts past the boundary ring
    let h = 0.02 * (fbm(x * 0.55, z * 0.55, seed, 3) - 0.5) * ramp(4.2, 5.2, r);

    if (kind === "coastal") {
      const inlandMask = ramp(5.0, 6.2, r) * ramp(-2.5, -0.5, z);
      h += inlandMask * (0.4 + 1.0 * ridged(x * 0.3, z * 0.3, seed, 4));
      const sea = ramp(-4.5, -6.7, z);
      h = h * (1 - sea) + sea * (WATER_LEVEL - 0.34);
    } else if (kind === "desert") {
      const duneMask = ramp(4.7, 5.9, r);
      h += duneMask * (0.12 + 0.5 * ridged(x * 0.18 + z * 0.05, z * 0.26, seed, 4));
      h += 0.06 * ridged(x * 0.6, z * 0.5, seed + 4, 3) * ramp(4.2, 5.4, r);
    } else if (kind === "oasis") {
      const duneMask = ramp(4.7, 5.9, r);
      h += duneMask * (0.1 + 0.4 * ridged(x * 0.2 + z * 0.04, z * 0.24, seed, 4));
    } else {
      const mountainMask = ramp(4.8, 6.1, r);
      h += mountainMask * (0.5 + 1.05 * ridged(x * 0.34, z * 0.34, seed, 4));
    }
    return h;
  };
}

// ---------- satellite-style texture painting ----------

function paintTexture(
  kind: TerrainKind,
  seed: number,
  heightFn: (x: number, z: number) => number,
  devices: DeviceData[]
) {
  const canvas = document.createElement("canvas");
  canvas.width = TEX;
  canvas.height = TEX;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // height grid (one extra row/col for slope shading)
  const grid = new Float32Array((TEX + 1) * (TEX + 1));
  for (let py = 0; py <= TEX; py++) {
    const z = (py / TEX - 0.5) * SIZE;
    for (let px = 0; px <= TEX; px++) {
      const x = (px / TEX - 0.5) * SIZE;
      grid[py * (TEX + 1) + px] = heightFn(x, z);
    }
  }

  const img = ctx.createImageData(TEX, TEX);
  const data = img.data;
  const cell = SIZE / TEX;
  // dusk sun roughly from the south-east, matching the directional light
  const lx = 0.46;
  const ly = 0.74;
  const lz = 0.49;

  for (let py = 0; py < TEX; py++) {
    const z = (py / TEX - 0.5) * SIZE;
    for (let px = 0; px < TEX; px++) {
      const x = (px / TEX - 0.5) * SIZE;
      const h = grid[py * (TEX + 1) + px];
      const dhx = (grid[py * (TEX + 1) + px + 1] - h) / cell;
      const dhz = (grid[(py + 1) * (TEX + 1) + px] - h) / cell;
      const invLen = 1 / Math.sqrt(dhx * dhx + dhz * dhz + 1);
      const shade = 0.78 + 0.22 * Math.max(0, (-dhx * lx + ly - dhz * lz) * invLen);

      const m = fbm(x * 0.7 + 31, z * 0.7 - 17, seed + 51, 3); // moisture / variation
      let c: number[];

      if (kind === "coastal") {
        if (h < WATER_LEVEL - 0.01) {
          const depth = Math.min(1, (WATER_LEVEL - h) / 0.36);
          c = mixColor([198, 184, 150], [10, 44, 66], smooth(depth));
        } else if (z < -3.55 || h < 0.02) {
          c = mixColor([214, 192, 150], [196, 174, 132], m);
        } else {
          c = mixColor([104, 124, 74], [136, 142, 86], m);
          if (h > 0.42) c = mixColor(c, [136, 122, 102], ramp(0.42, 0.9, h));
        }
      } else if (kind === "desert") {
        c = mixColor([219, 191, 140], [189, 156, 108], m);
        if (m < 0.3) c = mixColor(c, [173, 142, 98], 0.35);
        if (h > 0.45) c = mixColor(c, [232, 207, 160], ramp(0.45, 0.8, h));
      } else if (kind === "oasis") {
        c = mixColor([208, 179, 128], [180, 147, 99], m);
        const green = ramp(0.6, 0.92, m) * ramp(4.4, 2.6, Math.hypot(x, z));
        c = mixColor(c, [96, 128, 72], green * 0.7);
      } else {
        c = mixColor([148, 140, 99], [112, 121, 79], m);
        if (h > 0.5) c = mixColor(c, [128, 114, 96], ramp(0.5, 1.1, h));
      }

      const grain = (vnHash(px * 0.91, py * 1.71, seed) - 0.5) * 12;
      const idx = (py * TEX + px) * 4;
      data[idx] = Math.max(0, Math.min(255, c[0] * shade + grain));
      data[idx + 1] = Math.max(0, Math.min(255, c[1] * shade + grain));
      data[idx + 2] = Math.max(0, Math.min(255, c[2] * shade + grain));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // service roads from every site to the data hub, plus a perimeter track
  const toPx = (x: number, z: number) => [((x / SIZE) + 0.5) * TEX, ((z / SIZE) + 0.5) * TEX] as const;
  const hub = devices.find((d) => d.type === "data_hub");
  const [hx, hy] = toPx(hub?.position3D.x ?? 0, hub?.position3D.z ?? 0);
  const sites = devices.filter((d) => d.type !== "data_hub");

  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(52, 53, 56, 0.78)";
  ctx.lineWidth = 4.6;
  for (const site of sites) {
    const [sx, sy] = toPx(site.position3D.x, site.position3D.z);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + hx) / 2 + (sy - hy) * 0.12, (sy + hy) / 2 + (hx - sx) * 0.12, hx, hy);
    ctx.stroke();
  }

  const ordered = [...sites].sort(
    (a, b) => Math.atan2(a.position3D.z, a.position3D.x) - Math.atan2(b.position3D.z, b.position3D.x)
  );
  ctx.strokeStyle = "rgba(58, 59, 62, 0.5)";
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ordered.forEach((site, i) => {
    const [sx, sy] = toPx(site.position3D.x, site.position3D.z);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.closePath();
  ctx.stroke();

  // compacted gravel pads under every installation
  for (const dev of devices) {
    const [sx, sy] = toPx(dev.position3D.x, dev.position3D.z);
    const radius = (dev.type === "industrial_load_zone" ? 0.85 : 0.62) * (TEX / SIZE);
    const pad = ctx.createRadialGradient(sx, sy, radius * 0.2, sx, sy, radius);
    pad.addColorStop(0, "rgba(118, 120, 124, 0.9)");
    pad.addColorStop(0.75, "rgba(104, 106, 110, 0.75)");
    pad.addColorStop(1, "rgba(104, 106, 110, 0)");
    ctx.fillStyle = pad;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// ---------- scatter (vegetation, rocks, settlement) ----------

type ScatterItem = {
  x: number;
  z: number;
  y: number;
  kind: "tree" | "palm" | "rock" | "shrub";
  scale: number;
  rotation: number;
};

function buildScatter(
  kind: TerrainKind,
  seed: number,
  heightFn: (x: number, z: number) => number,
  devices: DeviceData[]
): ScatterItem[] {
  const rng = mulberry32(seed + 0.137);
  const items: ScatterItem[] = [];
  let guard = 0;
  const target = 26;
  while (items.length < target && guard < 500) {
    guard++;
    const angle = rng() * Math.PI * 2;
    const radius = 2.3 + rng() * 3.6;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (devices.some((d) => Math.hypot(d.position3D.x - x, d.position3D.z - z) < 1.2)) continue;
    if (kind === "coastal" && z < -2.8) continue;
    const y = heightFn(x, z);
    if (y > 0.55 || y < -0.02) continue;
    const t = rng();
    let type: ScatterItem["kind"];
    if (kind === "coastal") type = t < 0.62 ? "tree" : t < 0.88 ? "rock" : "shrub";
    else if (kind === "desert") type = t < 0.48 ? "rock" : t < 0.8 ? "shrub" : "palm";
    else if (kind === "oasis") type = t < 0.55 ? "palm" : t < 0.8 ? "shrub" : "rock";
    else type = t < 0.5 ? "tree" : t < 0.85 ? "rock" : "shrub";
    items.push({ x, z, y, kind: type, scale: 0.7 + rng() * 0.6, rotation: rng() * Math.PI * 2 });
  }
  return items;
}

function buildSettlement(seed: number, heightFn: (x: number, z: number) => number, devices: DeviceData[]) {
  const rng = mulberry32(seed + 0.731);
  const industrial = devices.find((d) => d.type === "industrial_load_zone");
  const ax = (industrial?.position3D.x ?? 3.3) * 1.3;
  const az = (industrial?.position3D.z ?? 1.8) * 1.3;
  const buildings: { x: number; z: number; y: number; w: number; h: number; d: number; rotation: number }[] = [];
  let guard = 0;
  while (buildings.length < 22 && guard < 160) {
    guard++;
    const x = ax + (rng() - 0.5) * 3.2;
    const z = az + (rng() - 0.5) * 2.6;
    if (devices.some((d) => Math.hypot(d.position3D.x - x, d.position3D.z - z) < 0.95)) continue;
    if (Math.hypot(x, z) > 5.6) continue;
    buildings.push({
      x,
      z,
      y: heightFn(x, z),
      w: 0.24 + rng() * 0.34,
      h: 0.22 + rng() * 0.62,
      d: 0.24 + rng() * 0.34,
      rotation: (rng() - 0.5) * 0.6,
    });
  }
  return buildings;
}

// ---------- component ----------

export function RealisticTerrain({
  regionId,
  devices,
  showGeographicLayer,
}: {
  regionId: string;
  devices: DeviceData[];
  showGeographicLayer: boolean;
}) {
  const kind = regionTerrainKind[regionId] ?? "desert";
  const seed = useMemo(() => hashString(regionId) * 97.3, [regionId]);
  const heightFn = useMemo(() => makeHeightFn(kind, seed), [kind, seed]);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      // plane is rotated -90deg around X, so geometry +y maps to world -z
      pos.setZ(i, heightFn(pos.getX(i), -pos.getY(i)));
    }
    geo.computeVertexNormals();
    return geo;
  }, [heightFn]);

  const texture = useMemo(() => paintTexture(kind, seed, heightFn, devices), [kind, seed, heightFn, devices]);
  const scatter = useMemo(() => buildScatter(kind, seed, heightFn, devices), [kind, seed, heightFn, devices]);
  const settlement = useMemo(() => buildSettlement(seed, heightFn, devices), [seed, heightFn, devices]);

  return (
    <group>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial map={texture ?? undefined} color={texture ? "#ffffff" : "#8a7757"} roughness={0.96} metalness={0.02} />
      </mesh>

      {kind === "coastal" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_LEVEL, 0]}>
          <planeGeometry args={[SIZE, SIZE]} />
          <meshStandardMaterial color="#2d7fb5" transparent opacity={0.78} roughness={0.16} metalness={0.32} />
        </mesh>
      )}

      {/* diorama pedestal under the patch — warm earth tone */}
      <mesh position={[0, -0.66, 0]}>
        <boxGeometry args={[SIZE + 0.02, 0.5, SIZE + 0.02]} />
        <meshStandardMaterial color="#6b5a44" roughness={0.92} metalness={0.02} />
      </mesh>

      {scatter.map((item, index) => (
        <ScatterMesh key={index} item={item} />
      ))}

      {settlement.map((b, index) => (
        <group key={`b-${index}`} position={[b.x, b.y, b.z]} rotation={[0, b.rotation, 0]}>
          <mesh position={[0, b.h / 2, 0]} castShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color="#b9bfc9" roughness={0.88} />
          </mesh>
          <mesh position={[0, b.h * 0.55, b.d / 2 + 0.004]}>
            <boxGeometry args={[b.w * 0.7, b.h * 0.22, 0.006]} />
            <meshStandardMaterial color="#ffd9a0" emissive="#ffc97a" emissiveIntensity={0.55} />
          </mesh>
        </group>
      ))}

      <InfrastructureLayer kind={kind} devices={devices} heightFn={heightFn} />

      {showGeographicLayer && <Compass heightFn={heightFn} />}
    </group>
  );
}

function InfrastructureLayer({
  kind,
  devices,
  heightFn,
}: {
  kind: TerrainKind;
  devices: DeviceData[];
  heightFn: (x: number, z: number) => number;
}) {
  return (
    <group>
      <ConstructedRoad from={[-6.2, 2.9]} to={[-2.2, 1.2]} heightFn={heightFn} />
      <ConstructedRoad from={[-2.2, 1.2]} to={[0.2, 0.15]} heightFn={heightFn} />
      <ConstructedRoad from={[0.2, 0.15]} to={[4.6, 1.4]} heightFn={heightFn} />
      <ConstructedRoad from={[2.4, 1.1]} to={[6.5, 3.5]} heightFn={heightFn} />
      {kind === "coastal" ? (
        <CoastalInfrastructure devices={devices} heightFn={heightFn} />
      ) : (
        <DesertInfrastructure heightFn={heightFn} />
      )}
    </group>
  );
}

function ConstructedRoad({ from, to, heightFn }: { from: [number, number]; to: [number, number]; heightFn: (x: number, z: number) => number }) {
  const midX = (from[0] + to[0]) / 2;
  const midZ = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  const y = heightFn(midX, midZ) + 0.018;
  return (
    <group position={[midX, y, midZ]} rotation={[0, angle, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[0.24, 0.018, length]} />
        <meshStandardMaterial color="#33363a" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.025, 0.004, length * 0.92]} />
        <meshStandardMaterial color="#e5e7eb" emissive="#d1d5db" emissiveIntensity={0.05} />
      </mesh>
    </group>
  );
}

function CoastalInfrastructure({ devices, heightFn }: { devices: DeviceData[]; heightFn: (x: number, z: number) => number }) {
  const city = [
    [-6.4, -2.9, 0.45], [-5.9, -2.55, 0.62], [-5.35, -2.95, 0.38], [-4.8, -2.5, 0.78],
    [-6.05, -3.45, 0.34], [-5.45, -3.55, 0.54], [-4.85, -3.25, 0.42], [-4.35, -2.78, 0.68],
  ] as const;
  return (
    <group>
      <Harbor heightFn={heightFn} />
      {city.map(([x, z, h], index) => (
        <CityBuilding key={index} x={x} z={z} h={h} heightFn={heightFn} />
      ))}
      <FactoryCity devices={devices} heightFn={heightFn} />
      <Pipeline from={[-5.8, -4.8]} to={[-2.2, -4.1]} y={WATER_LEVEL + 0.02} color="#0f172a" />
      <Pipeline from={[-3.8, -4.6]} to={[0.4, -3.4]} y={WATER_LEVEL + 0.025} color="#92400e" />
      <Ship position={[-6.1, WATER_LEVEL + 0.08, -5.8]} rotation={0.3} color="#1d4ed8" />
      <Ship position={[-2.2, WATER_LEVEL + 0.08, -5.4]} rotation={-0.15} color="#b91c1c" />
      <OffshorePlatform position={[1.2, WATER_LEVEL + 0.03, -5.8]} />
      <ExtraSolarFarm origin={[5.4, 2.3]} rows={3} cols={5} heightFn={heightFn} />
      <ExtraWindFarm points={[[6.2, -1.6], [7.1, 0.3], [5.8, 3.9]]} heightFn={heightFn} />
      <Pipeline from={[devices.find((d) => d.type === "industrial_load_zone")?.position3D.x ?? 3.3, devices.find((d) => d.type === "industrial_load_zone")?.position3D.z ?? 1.8]} to={[-4.8, -3.0]} y={0.07} color="#334155" />
    </group>
  );
}

function DesertInfrastructure({ heightFn }: { heightFn: (x: number, z: number) => number }) {
  return (
    <group>
      <OilField wells={[[-7.4, -3.1], [-6.4, -2.3], [-5.3, -1.2], [-7.2, -0.4], [-6.8, 0.6], [-5.7, 1.8], [-4.9, 1.1], [5.0, -4.0], [5.6, -3.1], [6.9, -1.9], [7.3, -0.5], [6.2, 0.9]]} heightFn={heightFn} />
      <ExtraSolarFarm origin={[4.5, 2.55]} rows={6} cols={9} heightFn={heightFn} />
      <ExtraSolarFarm origin={[-7.3, 2.7]} rows={5} cols={8} heightFn={heightFn} />
      <ExtraSolarFarm origin={[-1.6, 5.0]} rows={4} cols={10} heightFn={heightFn} />
      <ExtraWindFarm points={[[-7.2, -3.4], [-7.5, 1.8], [-6.5, 2.6], [-4.8, 4.8], [6.1, -2.3], [7.2, 1.6], [4.8, 4.7], [7.5, 4.0]]} heightFn={heightFn} />
      <Pipeline from={[-6.4, -2.3]} to={[-1.6, 0.8]} y={0.07} color="#7c2d12" />
      <Pipeline from={[5.6, -3.1]} to={[1.9, 1.0]} y={0.07} color="#7c2d12" />
      <CampBuildings origin={[-6.3, 4.5]} heightFn={heightFn} />
      <Helipad x={-5.25} z={4.25} heightFn={heightFn} />
      <Helicopter x={-4.7} z={3.85} y={heightFn(-4.7, 3.85) + 0.46} rotation={0.55} />
      <Helicopter x={5.9} z={-4.85} y={heightFn(5.9, -4.85) + 0.72} rotation={-0.35} />
    </group>
  );
}

function CityBuilding({ x, z, h, heightFn }: { x: number; z: number; h: number; heightFn: (x: number, z: number) => number }) {
  const y = heightFn(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[0.42, h, 0.34]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.55} />
      </mesh>
      <mesh position={[0, h * 0.55, 0.175]}>
        <boxGeometry args={[0.28, h * 0.5, 0.01]} />
        <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}

function FactoryCity({ devices, heightFn }: { devices: DeviceData[]; heightFn: (x: number, z: number) => number }) {
  const industrial = devices.find((device) => device.type === "industrial_load_zone");
  const cx = (industrial?.position3D.x ?? 3.3) + 1.05;
  const cz = (industrial?.position3D.z ?? 1.8) + 0.95;
  const blocks = [
    [-0.9, -0.55, 0.72], [-0.45, -0.62, 0.52], [0.05, -0.58, 0.88], [0.52, -0.54, 0.46], [0.98, -0.48, 0.68],
    [-1.05, -0.08, 0.5], [-0.52, -0.1, 0.95], [0.0, -0.06, 0.62], [0.48, -0.04, 1.05], [1.0, 0.02, 0.56],
    [-0.88, 0.48, 0.66], [-0.35, 0.45, 0.42], [0.2, 0.5, 0.76], [0.74, 0.45, 0.58], [1.25, 0.4, 0.92],
  ] as const;
  return (
    <group>
      <ConstructedRoad from={[cx - 1.6, cz + 0.85]} to={[cx + 1.55, cz + 0.65]} heightFn={heightFn} />
      <ConstructedRoad from={[cx - 1.35, cz - 0.85]} to={[cx + 1.35, cz - 0.55]} heightFn={heightFn} />
      <ConstructedRoad from={[cx - 1.45, cz - 0.9]} to={[cx - 1.2, cz + 0.95]} heightFn={heightFn} />
      {blocks.map(([dx, dz, h], index) => (
        <CityBuilding key={`factory-city-${index}`} x={cx + dx} z={cz + dz} h={h} heightFn={heightFn} />
      ))}
      <mesh position={[cx + 1.62, heightFn(cx + 1.62, cz + 0.82) + 0.04, cz + 0.82]} receiveShadow>
        <boxGeometry args={[0.9, 0.035, 0.45]} />
        <meshStandardMaterial color="#1f2937" roughness={0.78} />
      </mesh>
    </group>
  );
}

function Harbor({ heightFn }: { heightFn: (x: number, z: number) => number }) {
  const y = Math.max(heightFn(-5.2, -4.0), WATER_LEVEL) + 0.025;
  return (
    <group position={[-5.2, y, -4.0]}>
      <mesh receiveShadow>
        <boxGeometry args={[2.2, 0.08, 0.28]} />
        <meshStandardMaterial color="#4b5563" roughness={0.8} />
      </mesh>
      <mesh position={[0.85, 0.11, 0.15]} castShadow>
        <boxGeometry args={[0.16, 0.22, 0.16]} />
        <meshStandardMaterial color="#f97316" roughness={0.55} />
      </mesh>
      <mesh position={[0.45, 0.1, 0.15]} castShadow>
        <boxGeometry args={[0.18, 0.2, 0.16]} />
        <meshStandardMaterial color="#2563eb" roughness={0.55} />
      </mesh>
    </group>
  );
}

function Ship({ position, rotation, color }: { position: [number, number, number]; rotation: number; color: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.12, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.25} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.12, -0.14]} castShadow>
        <boxGeometry args={[0.24, 0.16, 0.28]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.35} />
      </mesh>
    </group>
  );
}

function OffshorePlatform({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.08, 0.45]} />
        <meshStandardMaterial color="#64748b" metalness={0.45} roughness={0.45} />
      </mesh>
      {[-0.22, 0.22].map((x) => [-0.14, 0.14].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, -0.18, z]}>
          <cylinderGeometry args={[0.018, 0.018, 0.45, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
        </mesh>
      )))}
      <mesh position={[0.18, 0.22, 0]} castShadow>
        <boxGeometry args={[0.16, 0.36, 0.16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.45} />
      </mesh>
    </group>
  );
}

function Pipeline({ from, to, y, color }: { from: [number, number]; to: [number, number]; y: number; color: string }) {
  const midX = (from[0] + to[0]) / 2;
  const midZ = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  return (
    <group position={[midX, y, midZ]} rotation={[0, angle, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.035, length, 12]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.38} />
      </mesh>
    </group>
  );
}

function ExtraSolarFarm({ origin, rows, cols, heightFn }: { origin: [number, number]; rows: number; cols: number; heightFn: (x: number, z: number) => number }) {
  return (
    <group>
      {Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((__, c) => {
        const x = origin[0] + c * 0.32;
        const z = origin[1] + r * 0.26;
        const y = heightFn(x, z) + 0.035;
        return (
          <group key={`${r}-${c}`} position={[x, y, z]} rotation={[-0.48, 0.08, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.24, 0.018, 0.16]} />
              <meshStandardMaterial color="#075985" metalness={0.35} roughness={0.22} />
            </mesh>
          </group>
        );
      }))}
    </group>
  );
}

function ExtraWindFarm({ points, heightFn }: { points: [number, number][]; heightFn: (x: number, z: number) => number }) {
  return (
    <group>
      {points.map(([x, z], index) => (
        <MiniWind key={index} x={x} z={z} y={heightFn(x, z)} />
      ))}
    </group>
  );
}

function MiniWind({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.032, 0.62, 12]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.25} roughness={0.35} />
      </mesh>
      <mesh position={[0.08, 0.66, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <coneGeometry args={[0.12, 0.05, 3]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
    </group>
  );
}

function OilField({ wells, heightFn }: { wells: [number, number][]; heightFn: (x: number, z: number) => number }) {
  return (
    <group>
      {wells.map(([x, z], index) => (
        <OilWell key={index} x={x} z={z} y={heightFn(x, z)} />
      ))}
    </group>
  );
}

function OilWell({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.04, 18]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[0.08, 0.55, 0.07]} />
        <meshStandardMaterial color="#1f2937" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0.18, 0.5, 0]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.42, 0.06, 0.06]} />
        <meshStandardMaterial color="#111827" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0.4, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.2, 12]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.45} />
      </mesh>
    </group>
  );
}

function CampBuildings({ origin, heightFn }: { origin: [number, number]; heightFn: (x: number, z: number) => number }) {
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = origin[0] + (i % 3) * 0.45;
        const z = origin[1] + Math.floor(i / 3) * 0.38;
        const y = heightFn(x, z);
        return (
          <mesh key={i} position={[x, y + 0.08, z]} castShadow>
            <boxGeometry args={[0.34, 0.16, 0.24]} />
            <meshStandardMaterial color={i % 2 ? "#e5e7eb" : "#fef3c7"} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

function Helipad({ x, z, heightFn }: { x: number; z: number; heightFn: (x: number, z: number) => number }) {
  const y = heightFn(x, z) + 0.025;
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.42, 36]} />
        <meshStandardMaterial color="#1f2937" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.08, 0.008, 0.52]} />
        <meshStandardMaterial color="#f8fafc" emissive="#e5e7eb" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 0.014, 0]}>
        <boxGeometry args={[0.34, 0.008, 0.08]} />
        <meshStandardMaterial color="#f8fafc" emissive="#e5e7eb" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

function Helicopter({ x, z, y, rotation }: { x: number; z: number; y: number; rotation: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]} scale={0.75}>
      <mesh castShadow>
        <capsuleGeometry args={[0.08, 0.34, 8, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.25} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.04, 0.22]} castShadow>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.55} roughness={0.12} />
      </mesh>
      <mesh position={[0, 0.02, -0.42]} castShadow>
        <boxGeometry args={[0.04, 0.04, 0.48]} />
        <meshStandardMaterial color="#111827" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.13, 0]} castShadow>
        <boxGeometry args={[0.9, 0.012, 0.035]} />
        <meshStandardMaterial color="#334155" metalness={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.9, 0.012, 0.035]} />
        <meshStandardMaterial color="#334155" metalness={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.11, 0.05]}>
        <boxGeometry args={[0.34, 0.018, 0.03]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.11, -0.12]}>
        <boxGeometry args={[0.34, 0.018, 0.03]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>
    </group>
  );
}

function ScatterMesh({ item }: { item: ScatterItem }) {
  const s = item.scale;
  if (item.kind === "tree") {
    return (
      <group position={[item.x, item.y, item.z]} rotation={[0, item.rotation, 0]} scale={s}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.032, 0.16, 6]} />
          <meshStandardMaterial color="#4e3b27" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.26, 0]} castShadow>
          <coneGeometry args={[0.13, 0.28, 7]} />
          <meshStandardMaterial color="#2d4a2c" roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <coneGeometry args={[0.09, 0.2, 7]} />
          <meshStandardMaterial color="#355c33" roughness={0.92} />
        </mesh>
      </group>
    );
  }
  if (item.kind === "palm") {
    return (
      <group position={[item.x, item.y, item.z]} rotation={[0, item.rotation, 0]} scale={s}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.034, 0.44, 6]} />
          <meshStandardMaterial color="#6b513a" roughness={0.9} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i * Math.PI) / 3) * 0.1, 0.46, Math.sin((i * Math.PI) / 3) * 0.1]}
            rotation={[Math.sin((i * Math.PI) / 3) * 1.15, 0, -Math.cos((i * Math.PI) / 3) * 1.15]}
            castShadow
          >
            <coneGeometry args={[0.03, 0.3, 4]} />
            <meshStandardMaterial color="#3e6b35" roughness={0.85} />
          </mesh>
        ))}
      </group>
    );
  }
  if (item.kind === "rock") {
    return (
      <mesh
        position={[item.x, item.y + 0.03 * s, item.z]}
        rotation={[item.rotation * 0.4, item.rotation, 0]}
        scale={[s, s * 0.62, s]}
        castShadow
      >
        <dodecahedronGeometry args={[0.09]} />
        <meshStandardMaterial color="#6e6557" roughness={0.95} />
      </mesh>
    );
  }
  return (
    <mesh position={[item.x, item.y + 0.025 * s, item.z]} scale={[s, s * 0.55, s]} castShadow>
      <icosahedronGeometry args={[0.055]} />
      <meshStandardMaterial color="#44502e" roughness={0.95} />
    </mesh>
  );
}

function Compass({ heightFn }: { heightFn: (x: number, z: number) => number }) {
  const x = 4.9;
  const z = 0.4;
  const y = heightFn(x, z) + 0.02;
  return (
    <group position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.34, 40]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.02, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.22, 3]} />
        <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      <Html position={[0, 0.05, -0.52]} center distanceFactor={9} zIndexRange={[20, 0]}>
        <span className="rounded bg-slate-950/70 px-1.5 py-0.5 text-[10px] font-bold text-red-300">N</span>
      </Html>
    </group>
  );
}
