import { sendNotification } from "@/core/utils/notifications";
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
import { aerationSocketService } from "../services/aeration-socket.service";
import {
  getAerationDevicesService,
  getAerationThresholdService,
} from "../services/aeration.service";
import { Aeration } from "../types/aeration";

interface SocketContextType {
  lastReadingAt: number | null;
  latestReadings: Map<string, PressureReading>;
  thresholds: Map<string, number>;
  devices: Aeration[];
  devicesLoading: boolean;
  refreshDevices: () => Promise<void>;
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
  const [latestReadings, setLatestReadings] = useState(() => new Map<string, PressureReading>());
  const [thresholds, setThresholds] = useState(() => new Map<string, number>());
  const [lastReadingAt, setLastReadingAt] = useState<number | null>(null);
  const [devices, setDevices] = useState<Aeration[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  
  const lastNotifiedRef = useRef<Map<string, number>>(new Map());
  const thresholdsRef = useRef(thresholds);

  useEffect(() => {
    thresholdsRef.current = thresholds;
  }, [thresholds]);

  const refreshDevices = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getAerationDevicesService();
      const deviceList = Array.isArray(data) ? data : [];
      setDevices(deviceList);
      const missingThresholds = deviceList.filter(
        (device) =>
          device.blowerConfig?.blowerId &&
          (typeof device.blowerConfig.currentThreshold !== "number" ||
            !Number.isFinite(device.blowerConfig.currentThreshold)),
      );
      const fetchedThresholds = await Promise.all(
        missingThresholds.map(async (device) => {
          const blowerId = device.blowerConfig.blowerId;
          try {
            return [blowerId, await getAerationThresholdService(blowerId)] as const;
          } catch (error) {
            console.error(
              `[Aeration] No se pudo obtener el umbral guardado para ${blowerId}:`,
              error,
            );
            return null;
          }
        }),
      );
      setThresholds((prev) => {
        const next = new Map(prev);
        for (const device of deviceList) {
          const config = device.blowerConfig;
          if (
            config?.blowerId &&
            typeof config.currentThreshold === "number" &&
            Number.isFinite(config.currentThreshold)
          ) {
            next.set(config.blowerId, config.currentThreshold);
          }
        }
        for (const result of fetchedThresholds) {
          if (result) next.set(result[0], result[1]);
        }
        return next;
      });
    } catch {
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      aerationSocketService.disconnect();
      setDevices([]);
      setDevicesLoading(false);
      return;
    }

    aerationSocketService.connect(token);
    setDevicesLoading(true);
    refreshDevices();

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

    aerationSocketService.on(WsEventType.PRESSURE_READING, onPressureReading);

    return () => {
      aerationSocketService.off(WsEventType.PRESSURE_READING, onPressureReading);
    };
  }, [token, refreshDevices]);

  return (
    <SocketContext.Provider
      value={{
        lastReadingAt,
        latestReadings,
        thresholds,
        devices,
        devicesLoading,
        refreshDevices,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}