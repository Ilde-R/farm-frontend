import { sendNotification } from "@/core/utils/notifications";
import { aerationSocketService } from "@/features/aeration/services/aeration-socket.service";
import { getAerationDevicesService } from "@/features/aeration/services/aeration.service";
import type { Aeration } from "@/features/aeration/types/aeration";
import { WsEventType, type PressureReading } from "@/features/aeration/types/aeration-socket";
import { useSession } from "@/features/auth/contexts/AuthContext";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

interface AerationSocketContextType {
  isConnected: boolean;
  lastReadingAt: number | null;
  latestReadings: Map<string, PressureReading>;
  thresholds: Map<string, number>;
  onlineDevices: Set<string>;
  devices: Aeration[];
  devicesLoading: boolean;
  refreshDevices: () => Promise<void>;
  sendSetThreshold: (blowerId: string, threshold: number) => void;
  sendGetThreshold: (blowerId?: string) => void;
  sendSetDeviceConfig: (blowerId: string, config: { readIntervalMs?: number }) => void;
}

const AerationSocketContext = createContext<AerationSocketContextType | null>(null);

export function useAerationSocket() {
  const value = use(AerationSocketContext);
  if (!value) {
    throw new Error("useAerationSocket must be wrapped in <AerationSocketProvider>");
  }
  return value;
}

export function AerationSocketProvider({ children }: PropsWithChildren) {
  const { token } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [latestReadings, setLatestReadings] = useState(() => new Map<string, PressureReading>());
  const [thresholds, setThresholds] = useState(() => new Map<string, number>());
  const [lastReadingAt, setLastReadingAt] = useState<number | null>(null);
  const [onlineDevices, setOnlineDevices] = useState<Set<string>>(new Set());
  const [devices, setDevices] = useState<Aeration[]>([]); // <-- Tipado actualizado
  const [devicesLoading, setDevicesLoading] = useState(true);
  
  const lastNotifiedRef = useRef<Map<string, number>>(new Map());
  const thresholdsRef = useRef(thresholds);

  useEffect(() => {
    thresholdsRef.current = thresholds;
  }, [thresholds]);

  const refreshDevices = useCallback(async () => {
    if (!token) return;
    try {
      const result = await getAerationDevicesService();

    const raw = result as any;

    const deviceList: Aeration[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
          ? raw.data.data
          : [];

    setDevices(deviceList);
    } finally {
      setDevicesLoading(false);
    }
  }, [token]);

  const updateDeviceConfig = useCallback(
    (blowerId: string, patch: Partial<Aeration["blowerConfig"]>) => {
      setDevices((prev) =>
        prev.map((device) => {
          if (device.blowerConfig?.blowerId !== blowerId) return device;
          return {
            ...device,
            blowerConfig: {
              ...device.blowerConfig,
              ...patch,
            },
          };
        }),
      );
    },
    [],
  );

  useEffect(() => {
    if (!token) {
      aerationSocketService.disconnect();
      setIsConnected(false);
      setDevices([]);
      setDevicesLoading(false);
      return;
    }

    aerationSocketService.connect(token);
    setDevicesLoading(true);
    refreshDevices();

    function onConnected() {
      setIsConnected(true);
      aerationSocketService.send(WsEventType.GET_THRESHOLD, {});
    }

    function onDisconnected() {
      setIsConnected(false);
    }

    function onPressureReading(data: PressureReading) {
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
          sendNotification(
            "Presión baja",
            `Equipo ${data.blowerId}: ${data.psi.toFixed(1)} PSI (umbral: ${threshold} PSI)`,
            { blowerId: data.blowerId },
          );
        }
      }
    }

    function onUpdateThreshold(data: { blowerId: string; threshold: number }) {
      setThresholds((prev) => {
        const next = new Map(prev);
        next.set(data.blowerId, data.threshold);
        return next;
      });
    }

    function onCurrentThreshold(data: { threshold: number; blowerId?: string; thresholds?: { blowerId: string; threshold: number }[] }) {
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

    aerationSocketService.on(WsEventType.CONNECTED, onConnected);
    aerationSocketService.on(WsEventType.DISCONNECTED, onDisconnected);
    aerationSocketService.on(WsEventType.PRESSURE_READING, onPressureReading);
    aerationSocketService.on(WsEventType.UPDATE_THRESHOLD, onUpdateThreshold);
    aerationSocketService.on(WsEventType.CURRENT_THRESHOLD, onCurrentThreshold);
    aerationSocketService.on(WsEventType.DEVICE_ONLINE, onDeviceOnline);
    aerationSocketService.on(WsEventType.DEVICE_OFFLINE, onDeviceOffline);
    aerationSocketService.on(WsEventType.DEVICES_ONLINE, onDevicesOnline);

    return () => {
      aerationSocketService.off(WsEventType.CONNECTED, onConnected);
      aerationSocketService.off(WsEventType.DISCONNECTED, onDisconnected);
      aerationSocketService.off(WsEventType.PRESSURE_READING, onPressureReading);
      aerationSocketService.off(WsEventType.UPDATE_THRESHOLD, onUpdateThreshold);
      aerationSocketService.off(WsEventType.CURRENT_THRESHOLD, onCurrentThreshold);
      aerationSocketService.off(WsEventType.DEVICE_ONLINE, onDeviceOnline);
      aerationSocketService.off(WsEventType.DEVICE_OFFLINE, onDeviceOffline);
      aerationSocketService.off(WsEventType.DEVICES_ONLINE, onDevicesOnline);
    };
  }, [token, refreshDevices]);

  function sendSetThreshold(blowerId: string, threshold: number) {
    setThresholds((prev) => {
      const next = new Map(prev);
      next.set(blowerId, threshold);
      return next;
    });
    aerationSocketService.send(WsEventType.SET_NEW_THRESHOLD, { blowerId, threshold });
  }

  function sendGetThreshold(blowerId?: string) {
    aerationSocketService.send(WsEventType.GET_THRESHOLD, { blowerId });
  }

  function sendSetDeviceConfig(blowerId: string, config: { readIntervalMs?: number }) {
    if (config.readIntervalMs !== undefined) {
      updateDeviceConfig(blowerId, { readIntervalMs: config.readIntervalMs });
    }
    aerationSocketService.send(WsEventType.SET_DEVICE_CONFIG, { blowerId, ...config });
  }

  return (
    <AerationSocketContext.Provider
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
    </AerationSocketContext.Provider>
  );
}