export type DeviceType =
  | "smart_meter"
  | "weather_station"
  | "solar_plant"
  | "wind_site"
  | "battery"
  | "transformer"
  | "sensor_network"
  | "industrial_load_zone"
  | "data_hub";

export type DeviceStatus = "Normal" | "Warning" | "Critical" | "Offline";

export interface DevicePosition3D {
  x: number;
  y: number;
  z: number;
}

export interface DeviceData {
  id: string;
  name: string;
  type: DeviceType;
  regionId: string;
  regionName: string;
  status: DeviceStatus;
  lastUpdate: string;
  dataSource: string;
  dataMode: "Simulated" | "CSV Demo Dataset" | "Pilot Ready" | "API Ready";
  dataQuality: number;
  confidence: number;
  position3D: DevicePosition3D;
  metrics: Record<string, string | number>;
  alerts: string[];
  recommendation: string;
  explanation: string;
}
