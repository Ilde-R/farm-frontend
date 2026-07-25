import { socketService } from "@/api/socket";
import { useSession } from "@/contexts/AuthContext";
import { listDevices } from "@/services/iot.service";
import type { DeviceInfo } from "@/types/blower";
import type { PressureReadingData, ThresholdUpdateData } from "@/types/socket";
import * as Notifications from "expo-notifications";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

interface SocketContextType {
  isConnected: boolean;
  lastReadingAt: number | null;
  latestReadings: Map<string, PressureReadingData>;
  thresholds: Map<string, number>;
  onlineDevices: Set<string>;
  devices: DeviceInfo[];
  devicesLoading: boolean;
  refreshDevices: () => Promise<void>;
  sendSetThreshold: (blowerId: string, threshold: number) => void;
  sendGetThreshold: (blowerId?: string) => void;
  sendSetDeviceConfig: (blowerId: string, config: { readIntervalMs?: number }) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket() {
  const value = use(SocketContext);
  if (!value) {
    throw new Error("useSocket must be wrapped in <SocketProvider>");
  }
  return value;
}

export function SocketProvider({ children }: PropsWithChildren) {
  const { token } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [latestReadings, setLatestReadings] = useState(
    () => new Map<string, PressureReadingData>(),
  );
  const [thresholds, setThresholds] = useState(
    () => new Map<string, number>(),
  );
  const [lastReadingAt, setLastReadingAt] = useState<number | null>(null);
  const [onlineDevices, setOnlineDevices] = useState<Set<string>>(new Set());
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const prevTokenRef = useRef<string | null>(null);
  const lastNotifiedRef = useRef<Map<string, number>>(new Map());
  const thresholdsRef = useRef(thresholds);

  useEffect(() => {
    thresholdsRef.current = thresholds;
  }, [thresholds]);

  const refreshDevices = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listDevices(token);
      setDevices(Array.isArray(data) ? data : []);
    } catch {
      
    } finally {
      setDevicesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const prevToken = prevTokenRef.current;
    prevTokenRef.current = token;

    if (token === prevToken) return;

    if (!token) {
      socketService.disconnect();
      setIsConnected(false);
      setDevices([]);
      setDevicesLoading(false);
      return;
    }

    socketService.connect(token);
    setDevicesLoading(true);
    refreshDevices();

    function onConnected() {
      setIsConnected(true);
      socketService.send("get_threshold", {});
    }

    function onDisconnected() {
      setIsConnected(false);
    }

    function onPressureReading(data: PressureReadingData) {
      setLastReadingAt(Date.now());
      setLatestReadings((prev) => {
        const next = new Map(prev);
        next.set(data.blowerId, data);
        return next;
      });

      const threshold = thresholdsRef.current.get(data.blowerId) ?? 2.0;
      if (data.psi <= threshold) {
        const now = Date.now();
        const lastNotified = lastNotifiedRef.current.get(data.blowerId) ?? 0;
        if (now - lastNotified > 60_000) {
          lastNotifiedRef.current.set(data.blowerId, now);
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Presión baja",
              body: `${data.blowerId}: ${data.psi.toFixed(1)} PSI (umbral: ${threshold} PSI)`,
              data: { blowerId: data.blowerId },
            },
            trigger: null,
          });
        }
      }
    }

    function onUpdateThreshold(data: ThresholdUpdateData) {
      setThresholds((prev) => {
        const next = new Map(prev);
        next.set(data.blowerId, data.threshold);
        return next;
      });
    }

    function onCurrentThreshold(data: {
      threshold: number;
      blowerId?: string;
      thresholds?: { blowerId: string; threshold: number }[];
    }) {
      setThresholds((prev) => {
        const next = new Map(prev);
        if (data.thresholds) {
          for (const t of data.thresholds) {
            next.set(t.blowerId, t.threshold);
          }
        } else if (data.blowerId) {
          next.set(data.blowerId, data.threshold);
        }
        return next;
      });
    }

    function onDeviceOnline(data: { blowerId: string }) {
      setOnlineDevices((prev) => new Set(prev).add(data.blowerId));
    }

    function onDeviceOffline(data: { blowerId: string }) {
      setOnlineDevices((prev) => {
        const next = new Set(prev);
        next.delete(data.blowerId);
        return next;
      });
    }

    function onDevicesOnline(data: { devices: { blowerId: string }[] }) {
      setOnlineDevices(new Set(data.devices.map((d) => d.blowerId)));
    }

    socketService.on("connected", onConnected);
    socketService.on("disconnected", onDisconnected);
    socketService.on("pressure_reading", onPressureReading);
    socketService.on("update_threshold", onUpdateThreshold);
    socketService.on("current_threshold", onCurrentThreshold);
    socketService.on("device_online", onDeviceOnline);
    socketService.on("device_offline", onDeviceOffline);
    socketService.on("devices_online", onDevicesOnline);

    return () => {
      socketService.off("connected", onConnected);
      socketService.off("disconnected", onDisconnected);
      socketService.off("pressure_reading", onPressureReading);
      socketService.off("update_threshold", onUpdateThreshold);
      socketService.off("current_threshold", onCurrentThreshold);
      socketService.off("device_online", onDeviceOnline);
      socketService.off("device_offline", onDeviceOffline);
      socketService.off("devices_online", onDevicesOnline);
    };
  }, [token]);

  function sendSetThreshold(blowerId: string, threshold: number) {
    socketService.send("set_new_threshold", { blowerId, threshold });
  }

  function sendGetThreshold(blowerId?: string) {
    socketService.send("get_threshold", { blowerId });
  }

  function sendSetDeviceConfig(blowerId: string, config: { readIntervalMs?: number }) {
    socketService.send("set_device_config", { blowerId, ...config });
  }

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        lastReadingAt,
        latestReadings,
        thresholds,
        onlineDevices,
        devices,
        devicesLoading,
        refreshDevices,
        sendSetThreshold,
        sendGetThreshold,
        sendSetDeviceConfig,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
