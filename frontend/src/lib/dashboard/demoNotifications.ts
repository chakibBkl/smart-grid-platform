export type NotificationSeverity = "Critical" | "High" | "Medium" | "Low";

export interface DemoNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  time: string;
  source: string;
}

export const demoNotifications: DemoNotification[] = [
  {
    id: "peak-pressure",
    severity: "High",
    title: "Peak pressure expected",
    message: "Algiers demand is forecast to peak at 19:00. Review battery dispatch recommendation.",
    time: "Now",
    source: "Optimization",
  },
  {
    id: "solar-drop",
    severity: "Medium",
    title: "Solar output drop",
    message: "Solar contribution may drop by 18% during the evening ramp window.",
    time: "17:30",
    source: "Renewables",
  },
  {
    id: "wind-site-warning",
    severity: "Medium",
    title: "Wind site warning",
    message: "Wind site health is in warning state. Monitor before relying on coastal wind support.",
    time: "16:45",
    source: "Asset Health",
  },
  {
    id: "report-ready",
    severity: "Low",
    title: "Demo report ready",
    message: "Daily operational summary can be exported from Reports.",
    time: "15:20",
    source: "Reports",
  },
];

export function notificationClass(severity: NotificationSeverity) {
  if (severity === "Critical") return "border-red-500/30 bg-red-500/10 text-red-500";
  if (severity === "High") return "border-orange-500/30 bg-orange-500/10 text-orange-500";
  if (severity === "Medium") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-500";
  return "border-blue-500/30 bg-blue-500/10 text-blue-500";
}
