import { socketService } from "@/api/socket";
import { useSession } from "@/contexts/AuthContext";
import type { PressureReadingData, ThresholdUpdateData } from "@/types/socket";
import {
  createContext,
  use,
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
  const prevTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const prevToken = prevTokenRef.current;
    prevTokenRef.current = token;

    if (token === prevToken) return;

    if (!token) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    socketService.connect(token);

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
        sendSetThreshold,
        sendGetThreshold,
        sendSetDeviceConfig,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
