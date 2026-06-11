"use client";
import { useEffect } from "react";
import { Html, OrbitControls, Sky } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { DeviceData, DevicePosition3D, DeviceType } from "@/lib/dashboard/deviceTypes";
import type { DigitalTwinViewMode } from "./DigitalTwinControls";
import { DeviceMesh } from "./DeviceMesh";
import { DataFlowBeam } from "./DataFlowBeam";
import { statusColor } from "./DeviceStatusBadge";
import { GeographicBase } from "./GeographicBase";
import { LifeLayer } from "./LifeLayer";
import { RealisticTerrain } from "./RealisticTerrain";

const dashboardOutputPosition: DevicePosition3D = { x: 0, y: 0.85, z: 3.65 };

export function EnergyScene({
  devices,
  selectedId,
  viewMode,
  showCards,
  showLabels,
  showLines,
  showGeographicLayer,
  cameraResetKey,
  cameraZoomCommand,
  onSelect,
}: {
  devices: DeviceData[];
  selectedId?: string;
  viewMode: DigitalTwinViewMode;
  showCards: boolean;
  showLabels: boolean;
  showLines: boolean;
  showGeographicLayer: boolean;
  cameraResetKey: number;
  cameraZoomCommand: { id: number; direction: number };
  onSelect: (device: DeviceData) => void;
}) {
  const hub = findDevice(devices, "data_hub");
  const transformer = findDevice(devices, "transformer");
  const selected = devices.find((device) => device.id === selectedId);
  const flowActive = viewMode === "flow";

  return (
    <>
      <Sky distance={45000} sunPosition={[14, 20, 10]} turbidity={4.5} rayleigh={1.6} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <fog attach="fog" args={["#cfe0ee", 16, 34]} />

      <hemisphereLight args={["#dbeafe", "#a08a66", 0.75]} />
      <directionalLight
        castShadow
        position={[8, 11, 6]}
        intensity={1.9}
        color="#fff4dd"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 5, -4]} intensity={0.35} color="#bcd6f5" />
      <pointLight position={[0, 2.3, 0]} intensity={0.9} color="#22d3ee" distance={6} />

      <CameraRig resetKey={cameraResetKey} zoomCommand={cameraZoomCommand} />
      <RealisticTerrain regionId={devices[0]?.regionId ?? "default"} devices={devices} showGeographicLayer={showGeographicLayer} />
      <LifeLayer devices={devices} seedKey={devices[0]?.regionId ?? "default"} />
      <GeographicBase visible={showGeographicLayer} />
      {!showGeographicLayer && <gridHelper args={[9.2, 24, "#164e63", "#0f2741"]} position={[0, 0.03, 0]} />}
      {showGeographicLayer && <ZoneMarkers devices={devices} />}

      {showLines && hub && devices.filter((device) => device.id !== hub.id).map((device) => (
        <DataFlowBeam key={`${device.id}-data`} from={device.position3D} to={hub.position3D} kind="data" active={flowActive || selected?.id === device.id || selected?.id === hub.id} />
      ))}

      {showLines && hub && <DataFlowBeam from={hub.position3D} to={dashboardOutputPosition} kind="data" color="#a3e635" active />}

      {showLines && transformer && powerFlowPairs(devices).map(([from, to, bidirectional]) => (
        <group key={`${from.id}-${to.id}-power`}>
          <DataFlowBeam from={from.position3D} to={to.position3D} kind="power" color={bidirectional ? "#38bdf8" : "#facc15"} active={flowActive || viewMode === "3d"} />
          {bidirectional && <DataFlowBeam from={to.position3D} to={from.position3D} kind="power" color="#38bdf8" active={flowActive} />}
          <TransmissionPylon position={[(from.position3D.x + to.position3D.x) / 2, 0, (from.position3D.z + to.position3D.z) / 2]} />
        </group>
      ))}

      {devices.map((device) => (
        <DeviceMesh key={device.id} device={device} selected={selectedId === device.id} viewMode={viewMode} showCards={showCards} showLabels={showLabels} onSelect={onSelect} />
      ))}

      <DashboardOutput devices={devices} showCard={showCards} />
      <OrbitControls makeDefault enablePan enableDamping dampingFactor={0.08} zoomSpeed={0.75} rotateSpeed={0.65} minDistance={3.2} maxDistance={12.5} maxPolarAngle={Math.PI / 2.05} target={[0, 0.25, 0]} />
    </>
  );
}

function TransmissionPylon({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.05, 0.68, 4]} />
        <meshStandardMaterial color="#8a94a3" metalness={0.65} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.3, 0.018, 0.018]} />
        <meshStandardMaterial color="#8a94a3" metalness={0.65} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.47, 0]} castShadow>
        <boxGeometry args={[0.22, 0.016, 0.016]} />
        <meshStandardMaterial color="#8a94a3" metalness={0.65} roughness={0.45} />
      </mesh>
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.545, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.05, 6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ resetKey, zoomCommand }: { resetKey: number; zoomCommand: { id: number; direction: number } }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    camera.position.set(4.8, 4.2, 5.2);
    camera.lookAt(0, 0.2, 0);
    const orbitControls = controls as { target?: { set: (x: number, y: number, z: number) => void }; update?: () => void } | null;
    orbitControls?.target?.set(0, 0.25, 0);
    orbitControls?.update?.();
  }, [camera, controls, resetKey]);

  useEffect(() => {
    if (zoomCommand.id === 0 || zoomCommand.direction === 0) return;
    const direction = zoomCommand.direction > 0 ? 1.12 : 0.88;
    camera.position.multiplyScalar(direction);
    const orbitControls = controls as { update?: () => void } | null;
    orbitControls?.update?.();
  }, [camera, controls, zoomCommand]);

  return null;
}

function ZoneMarkers({ devices }: { devices: DeviceData[] }) {
  return (
    <>
      {devices.filter((device) => device.type !== "data_hub").map((device) => (
        <mesh key={`${device.id}-zone`} rotation={[-Math.PI / 2, 0, 0]} position={[device.position3D.x, 0.006, device.position3D.z]}>
          <circleGeometry args={[device.type === "industrial_load_zone" ? 0.82 : 0.62, 32]} />
          <meshStandardMaterial color={statusColor(device.status)} emissive={statusColor(device.status)} emissiveIntensity={0.08} transparent opacity={0.08} />
        </mesh>
      ))}
    </>
  );
}

function DashboardOutput({ devices, showCard }: { devices: DeviceData[]; showCard: boolean }) {
  const transformer = findDevice(devices, "transformer");
  const industrial = findDevice(devices, "industrial_load_zone");
  const battery = findDevice(devices, "battery");
  const status = industrial?.status || transformer?.status || "Normal";
  return (
    <group position={[dashboardOutputPosition.x, dashboardOutputPosition.y, dashboardOutputPosition.z]} rotation={[-0.15, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.48, 0.78, 0.06]} />
        <meshStandardMaterial color="#0f172a" metalness={0.35} roughness={0.28} emissive="#0e7490" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[1.3, 0.58, 0.02]} />
        <meshStandardMaterial color="#082f49" emissive="#155e75" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.62, 0.32, 0.08]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color={statusColor(status)} emissive={statusColor(status)} emissiveIntensity={1.1} />
      </mesh>
      {showCard && <Html position={[0, 0, 0.1]} center distanceFactor={7} zIndexRange={[20, 0]}>
        <div className="w-48 rounded-lg border border-cyan-300/20 bg-slate-950/90 p-3 text-xs text-white shadow-xl backdrop-blur">
          <p className="font-bold text-cyan-200">Dashboard Output</p>
          <p className="mt-1 text-slate-300">Risk: <span className="font-semibold" style={{ color: statusColor(status) }}>{status}</span></p>
          <p className="text-slate-300">Grid Health: {transformer?.metrics.healthPercent ?? "N/A"}%</p>
          <p className="text-slate-300">Battery SOC: {battery?.metrics.socPercent ?? "N/A"}%</p>
          <p className="mt-1 text-[10px] text-lime-300">Recommendation ready</p>
        </div>
      </Html>}
    </group>
  );
}

function findDevice(devices: DeviceData[], type: DeviceType) {
  return devices.find((device) => device.type === type);
}

function powerFlowPairs(devices: DeviceData[]): [DeviceData, DeviceData, boolean][] {
  const solar = findDevice(devices, "solar_plant");
  const wind = findDevice(devices, "wind_site");
  const battery = findDevice(devices, "battery");
  const transformer = findDevice(devices, "transformer");
  const industrial = findDevice(devices, "industrial_load_zone");
  const pairs: [DeviceData, DeviceData, boolean][] = [];
  if (solar && transformer) pairs.push([solar, transformer, false]);
  if (wind && transformer) pairs.push([wind, transformer, false]);
  if (battery && transformer) pairs.push([battery, transformer, true]);
  if (transformer && industrial) pairs.push([transformer, industrial, false]);
  return pairs;
}
