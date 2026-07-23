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
  latestReadings: Map<string, PressureReadingData>;
  thresholds: Map<string, number>;
  sendSetThreshold: (blowerId: string, threshold: number) => void;
  sendGetThreshold: (blowerId?: string) => void;
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
    }) {
      if (data.blowerId) {
        setThresholds((prev) => {
          const next = new Map(prev);
          next.set(data.blowerId!, data.threshold);
          return next;
        });
      }
    }

    socketService.on("connected", onConnected);
    socketService.on("disconnected", onDisconnected);
    socketService.on("pressure_reading", onPressureReading);
    socketService.on("update_threshold", onUpdateThreshold);
    socketService.on("current_threshold", onCurrentThreshold);

    return () => {
      socketService.off("connected", onConnected);
      socketService.off("disconnected", onDisconnected);
      socketService.off("pressure_reading", onPressureReading);
      socketService.off("update_threshold", onUpdateThreshold);
      socketService.off("current_threshold", onCurrentThreshold);
    };
  }, [token]);

  function sendSetThreshold(blowerId: string, threshold: number) {
    socketService.send("set_new_threshold", { blowerId, threshold });
  }

  function sendGetThreshold(blowerId?: string) {
    socketService.send("get_threshold", { blowerId });
  }

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        latestReadings,
        thresholds,
        sendSetThreshold,
        sendGetThreshold,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
