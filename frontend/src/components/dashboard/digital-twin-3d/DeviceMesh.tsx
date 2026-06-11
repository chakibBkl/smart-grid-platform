"use client";
import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import type { DeviceData } from "@/lib/dashboard/deviceTypes";
import type { DigitalTwinViewMode } from "./DigitalTwinControls";
import { statusColor } from "./DeviceStatusBadge";

export function DeviceMesh({
  device,
  selected,
  viewMode,
  showCards,
  showLabels,
  onSelect,
}: {
  device: DeviceData;
  selected: boolean;
  viewMode: DigitalTwinViewMode;
  showCards: boolean;
  showLabels: boolean;
  onSelect: (device: DeviceData) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const root = useRef<Group>(null);
  const color = statusColor(device.status);
  const p = device.position3D;
  const emphasizeStatus = viewMode === "status";

  useEffect(() => {
    root.current?.traverse((obj) => {
      if ((obj as Mesh).isMesh) obj.castShadow = true;
    });
  }, [device.id]);

  function handleOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }

  function handleOut(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "default";
  }

  return (
    <group
      ref={root}
      position={[p.x, p.y, p.z]}
      scale={hovered || selected ? 1.07 : 1}
      onClick={(event) => { event.stopPropagation(); onSelect(device); }}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <SelectionRing color={color} selected={selected} active={hovered || emphasizeStatus} />
      <DeviceShape device={device} color={color} selected={selected} viewMode={viewMode} />
      {(showCards || showLabels) && <DeviceLabel device={device} selected={selected} showCard={showCards} showLabel={showLabels} onSelect={() => onSelect(device)} />}
    </group>
  );
}

function SelectionRing({ color, selected, active }: { color: string; selected: boolean; active: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[selected ? 0.58 : 0.42, selected ? 0.72 : 0.55, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.9 : active ? 0.38 : 0.12} transparent opacity={selected ? 0.72 : 0.32} />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.095, 0]}>
          <circleGeometry args={[0.82, 48]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} transparent opacity={0.12} />
        </mesh>
      )}
    </group>
  );
}

function DeviceShape({ device, color, selected, viewMode }: { device: DeviceData; color: string; selected: boolean; viewMode: DigitalTwinViewMode }) {
  const glow = selected || viewMode === "status" ? 0.55 : 0.18;
  if (device.type === "data_hub") return <DataHubMesh color={color} glow={glow} />;
  if (device.type === "solar_plant") return <SolarPlantMesh color={color} glow={glow} />;
  if (device.type === "wind_site") return <WindTurbineMesh color={color} glow={glow} />;
  if (device.type === "battery") return <BatteryStorageMesh device={device} color={color} glow={glow} />;
  if (device.type === "transformer") return <TransformerMesh color={color} glow={glow} />;
  if (device.type === "industrial_load_zone") return <IndustrialLoadMesh color={color} glow={glow} />;
  if (device.type === "smart_meter") return <SmartMeterClusterMesh color={color} glow={glow} />;
  if (device.type === "weather_station") return <WeatherStationMesh color={color} glow={glow} />;
  if (device.type === "sensor_network") return <SensorNetworkMesh color={color} glow={glow} />;
  return <mesh><boxGeometry args={[0.38, 0.38, 0.38]} /><meshStandardMaterial color={color} /></mesh>;
}

function SolarPlantMesh({ color, glow }: { color: string; glow: number }) {
  return (
    <group>
      <mesh position={[0, -0.02, 0]}><boxGeometry args={[1.25, 0.06, 0.85]} /><meshStandardMaterial color="#55606e" roughness={0.78} /></mesh>
      {[-0.42, 0, 0.42].map((x) => [-0.22, 0.22].map((z) => (
        <group key={`${x}-${z}`} position={[x, 0.14, z]} rotation={[-0.55, 0, 0]}>
          <mesh><boxGeometry args={[0.34, 0.035, 0.25]} /><meshStandardMaterial color="#0b4a6f" metalness={0.35} roughness={0.2} emissive="#075985" emissiveIntensity={0.12} /></mesh>
          <mesh position={[0, 0.022, 0]}><boxGeometry args={[0.38, 0.012, 0.29]} /><meshStandardMaterial color="#93c5fd" metalness={0.2} roughness={0.18} transparent opacity={0.28} /></mesh>
        </group>
      )))}
      <mesh position={[0, 0.16, 0.5]}><sphereGeometry args={[0.055, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} /></mesh>
    </group>
  );
}

function WindTurbineMesh({ color, glow }: { color: string; glow: number }) {
  const blades = useRef<Group>(null);
  useFrame((_, delta) => {
    if (blades.current) blades.current.rotation.z += delta * 0.8;
  });
  return (
    <group>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.22, 0.28, 0.08, 24]} /><meshStandardMaterial color="#334155" roughness={0.55} /></mesh>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.035, 0.06, 1.0, 18]} /><meshStandardMaterial color="#dbeafe" metalness={0.25} roughness={0.35} /></mesh>
      <mesh position={[0, 1.04, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.07, 0.24, 8, 16]} /><meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.3} /></mesh>
      <group ref={blades} position={[0.14, 1.04, 0]} rotation={[0, Math.PI / 2, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, i * Math.PI * 2 / 3]} position={[0, 0.18, 0]}>
            <boxGeometry args={[0.025, 0.45, 0.01]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.1} roughness={0.28} />
          </mesh>
        ))}
      </group>
      <mesh position={[0.18, 1.04, 0]}><sphereGeometry args={[0.045, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} /></mesh>
    </group>
  );
}

function BatteryStorageMesh({ device, color, glow }: { device: DeviceData; color: string; glow: number }) {
  const soc = Number(device.metrics.socPercent || 0);
  return (
    <group>
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}><boxGeometry args={[0.42, 0.4, 0.48]} /><meshStandardMaterial color="#7b8aa0" metalness={0.5} roughness={0.35} /></mesh>
      ))}
      <mesh position={[0, 0.19, 0.255]}><boxGeometry args={[Math.max(0.08, soc / 100 * 0.72), 0.08, 0.02]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} /></mesh>
      <mesh position={[0.55, 0.38, 0]}><sphereGeometry args={[0.055, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} /></mesh>
    </group>
  );
}

function TransformerMesh({ color, glow }: { color: string; glow: number }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.58, 0.42, 0.45]} /><meshStandardMaterial color="#8295ab" metalness={0.6} roughness={0.3} /></mesh>
      {[-0.36, -0.24, 0.24, 0.36].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}><boxGeometry args={[0.035, 0.42, 0.5]} /><meshStandardMaterial color="#64748b" metalness={0.45} roughness={0.35} /></mesh>
      ))}
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.52, 0]}><cylinderGeometry args={[0.04, 0.04, 0.24, 12]} /><meshStandardMaterial color="#f8fafc" roughness={0.3} /></mesh>
      ))}
      <mesh position={[0, 0.54, 0.22]}><sphereGeometry args={[0.052, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} /></mesh>
    </group>
  );
}

function IndustrialLoadMesh({ color, glow }: { color: string; glow: number }) {
  return (
    <group>
      <mesh position={[-0.28, 0.2, -0.02]}><boxGeometry args={[0.38, 0.4, 0.45]} /><meshStandardMaterial color="#9aa8ba" roughness={0.6} /></mesh>
      <mesh position={[0.16, 0.28, 0.02]}><boxGeometry args={[0.42, 0.56, 0.5]} /><meshStandardMaterial color="#7e8da1" roughness={0.55} /></mesh>
      <mesh position={[0.46, 0.48, -0.08]}><cylinderGeometry args={[0.045, 0.055, 0.58, 12]} /><meshStandardMaterial color="#aab6c6" roughness={0.45} /></mesh>
      <mesh position={[0.46, 0.82, -0.08]}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} transparent opacity={0.8} /></mesh>
      <mesh position={[0, 0.02, 0.35]}><boxGeometry args={[1.0, 0.035, 0.08]} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.18} /></mesh>
    </group>
  );
}

function SmartMeterClusterMesh({ color, glow }: { color: string; glow: number }) {
  return (
    <group>
      {[-0.36, -0.12, 0.12, 0.36].map((x, index) => (
        <group key={x} position={[x, 0.16 + (index % 2) * 0.04, 0]}>
          <mesh><boxGeometry args={[0.16, 0.32, 0.1]} /><meshStandardMaterial color="#e2e8f0" metalness={0.1} roughness={0.42} /></mesh>
          <mesh position={[0, 0.09, 0.058]}><sphereGeometry args={[0.025, 10, 10]} /><meshStandardMaterial color={index === 3 ? "#f59e0b" : color} emissive={index === 3 ? "#f59e0b" : color} emissiveIntensity={glow} /></mesh>
          <mesh position={[0, 0.23, 0]}><cylinderGeometry args={[0.009, 0.009, 0.18, 8]} /><meshStandardMaterial color="#94a3b8" /></mesh>
        </group>
      ))}
    </group>
  );
}

function WeatherStationMesh({ color, glow }: { color: string; glow: number }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.025, 0.035, 0.75, 12]} /><meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.35} /></mesh>
      <mesh position={[0.18, 0.66, 0]}><boxGeometry args={[0.35, 0.025, 0.025]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
      <mesh position={[0.36, 0.66, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.06, 0.12, 3]} /><meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.45} /></mesh>
      <mesh position={[-0.12, 0.76, 0]}><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} /></mesh>
    </group>
  );
}

function SensorNetworkMesh({ color, glow }: { color: string; glow: number }) {
  const nodes = [[-0.32, 0.16, -0.1], [0, 0.28, 0.14], [0.34, 0.15, -0.08], [0.16, 0.1, 0.38]] as const;
  return (
    <group>
      {nodes.map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]}><sphereGeometry args={[0.07, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} /></mesh>
      ))}
      {nodes.map(([x, y, z], index) => index > 0 && (
        <mesh key={`line-${index}`} position={[x / 2, y / 2 + 0.08, z / 2]} rotation={[0, Math.atan2(x, z), Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, Math.sqrt(x * x + z * z), 6]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function DataHubMesh({ color, glow }: { color: string; glow: number }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.35;
  });
  return (
    <group>
      <mesh position={[0, 0.24, 0]}><cylinderGeometry args={[0.42, 0.5, 0.12, 6]} /><meshStandardMaterial color="#5d6e84" metalness={0.4} roughness={0.38} /></mesh>
      <group ref={group} position={[0, 0.58, 0]}>
        <mesh><boxGeometry args={[0.48, 0.48, 0.48]} /><meshStandardMaterial color="#083344" metalness={0.35} roughness={0.18} emissive="#22d3ee" emissiveIntensity={0.42} /></mesh>
        <mesh><boxGeometry args={[0.62, 0.62, 0.62]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} wireframe transparent opacity={0.75} /></mesh>
      </group>
      <mesh position={[0, 0.58, 0]}><sphereGeometry args={[0.13, 24, 24]} /><meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={1.2} /></mesh>
    </group>
  );
}

function DeviceLabel({ device, selected, showCard, showLabel, onSelect }: { device: DeviceData; selected: boolean; showCard: boolean; showLabel: boolean; onSelect: () => void }) {
  const color = statusColor(device.status);
  return (
    <Html position={[0, selected ? 1.28 : 1.08, 0]} center distanceFactor={6.8} occlude={false} zIndexRange={[20, 0]}>
      {showCard ? (
        <button
          onClick={onSelect}
          className={`min-w-36 rounded-lg border px-3 py-2 text-left shadow-xl backdrop-blur-md transition ${selected ? "scale-105 border-cyan-300 bg-slate-950/95" : "border-white/10 bg-slate-950/80"}`}
          style={{ boxShadow: selected ? `0 0 24px ${color}55` : "0 10px 24px rgba(2,6,23,.35)" }}
        >
          <p className="whitespace-nowrap text-[11px] font-bold text-white">{device.name}</p>
          <p className="mt-1 whitespace-nowrap text-[10px] text-slate-300">{metricSummary(device)}</p>
          <p className="mt-1 text-[10px] font-semibold" style={{ color }}>{device.status}</p>
        </button>
      ) : showLabel ? (
        <button onClick={onSelect} className="rounded-full border border-white/10 bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-white shadow-lg backdrop-blur">
          {device.name}
        </button>
      ) : null}
    </Html>
  );
}

function metricSummary(device: DeviceData) {
  const m = device.metrics;
  if (device.type === "solar_plant") return `${m.currentProductionMW} MW | ${device.status}`;
  if (device.type === "wind_site") return `${m.currentProductionMW} MW | ${device.status}`;
  if (device.type === "battery") return `SOC ${m.socPercent}% | ${device.status}`;
  if (device.type === "transformer") return `Load ${m.loadingPercent}% | ${device.status}`;
  if (device.type === "industrial_load_zone") return `${m.currentDemandMW} MW | ${device.status}`;
  if (device.type === "smart_meter") return `${m.feederCount} feeders | ${m.sampleCoveragePercent}%`;
  if (device.type === "weather_station") return `${m.temperatureC} C | ${m.windSpeedKmh} km/h`;
  if (device.type === "sensor_network") return `${m.packetQualityPercent}% Quality`;
  if (device.type === "data_hub") return "Processing regional signals";
  return device.status;
}
