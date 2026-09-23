import BlowerCard from "@/core/components/blower-card";
import ScreenLayout from "@/core/components/layout/ScreenLayout"; // <-- NUEVO IMPORT
import { useTheme } from "@/core/theme/use-theme";
import { useSocket } from "@/features/aeration/contexts/AerationSocketContext";
import { deleteAerationDeviceService, updateAerationConfigService } from "@/features/aeration/services/aeration.service";
import { useSession } from "@/features/auth/contexts/AuthContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

interface BlowerDisplay {
  blowerId: string;
  name: string;
  psi: number | null;
  threshold: number;
  firmwareVersion?: string;
  readIntervalMs?: number;
  saveIntervalSeconds?: number;
}

export default function SensorsScreen() {
  const theme = useTheme();
  const { signOut, token } = useSession();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const {
    lastReadingAt,
    latestReadings,
    thresholds,
    onlineDevices,
    devices,
    devicesLoading,
    refreshDevices,
    sendSetThreshold,
    sendSetDeviceConfig,
  } = useSocket();

  const [saveIntervals, setSaveIntervals] = useState<Map<string, number>>(
    () => new Map(),
  );
  const [, setTick] = useState(0);

  const iconSize = Math.round(width * 0.06);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshDevices();
    }, [refreshDevices]),
  );

  useEffect(() => {
    const deviceList = Array.isArray(devices) ? devices : [];
    setSaveIntervals((prev) => {
      const next = new Map(prev);
      for (const d of deviceList) {
        if (d.blowerConfig?.saveIntervalSeconds) {
          next.set(d.blowerConfig.blowerId, d.blowerConfig.saveIntervalSeconds);
        }
      }
      return next;
    });
  }, [devices]);

  const blowers: BlowerDisplay[] = (() => {
    const deviceList = Array.isArray(devices) ? devices : [];
    const seen = new Set<string>();
    return deviceList
      .filter((d) => d.isActive && d.blowerConfig)
      .filter((d) => {
        if (seen.has(d.blowerConfig.blowerId)) return false;
        seen.add(d.blowerConfig.blowerId);
        return true;
      })
      .map((d) => {
        const reading = latestReadings.get(d.blowerConfig.blowerId);
        return {
          blowerId: d.blowerConfig.blowerId,
          name: d.blowerConfig.name ?? d.blowerConfig.blowerId,
          psi: reading?.psi ?? null,
          threshold: thresholds.get(d.blowerConfig.blowerId) ?? 2.0,
          firmwareVersion: d.blowerConfig.firmwareVersion,
          readIntervalMs: d.blowerConfig.readIntervalMs,
          saveIntervalSeconds:
            saveIntervals.get(d.blowerConfig.blowerId) ??
            d.blowerConfig.saveIntervalSeconds,
        };
      });
  })();

  function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => signOut() },
    ]);
  }

  async function handleDelete(blowerId: string) {
    if (!token) return;
    try {
      await deleteAerationDeviceService(blowerId);
      await refreshDevices();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }

  async function handleSaveConfig(
    blowerId: string,
    saveIntervalSeconds: number,
  ) {
    if (!token) return;
    setSaveIntervals((prev) => {
      const next = new Map(prev);
      next.set(blowerId, saveIntervalSeconds);
      return next;
    });
    try {
      await updateAerationConfigService(blowerId, { saveIntervalSeconds });
    } catch (error: any) {
      Alert.alert("Error", error.message);
      refreshDevices();
    }
  }

  const HeaderButtons = (
    <>
      <TouchableOpacity
        onPress={() => router.push("/aerations/add-aeration")}
        hitSlop={8}
      >
        <MaterialCommunityIcons
          name="plus"
          size={iconSize}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} hitSlop={8}>
        <MaterialCommunityIcons
          name="logout"
          size={iconSize}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    </>
  );

  return (
    <ScreenLayout
      title="Sensores"
      headerRight={HeaderButtons}
      isScrollable={true}
    >
      {devicesLoading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color={theme.textSecondary} />
          <Text className="text-textSecondary text-sm mt-3">
            Cargando dispositivos...
          </Text>
        </View>
      ) : blowers.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <MaterialCommunityIcons
            name="thermometer"
            size={64}
            color={theme.textSecondary}
          />
          <Text className="text-textSecondary text-base mt-4 text-center">
            No hay blowers registrados.
          </Text>
          <Text className="text-textSecondary text-sm mt-2 text-center">
            Agrega un dispositivo para comenzar.
          </Text>
        </View>
      ) : (
        blowers.map((b, i) => (
          <View key={b.blowerId || i} style={{ marginBottom: 16 }}>
            <BlowerCard
              blowerId={b.blowerId}
              name={b.name}
              psi={b.psi}
              threshold={b.threshold}
              isOnline={onlineDevices.has(b.blowerId)}
              firmwareVersion={b.firmwareVersion}
              readIntervalMs={b.readIntervalMs}
              saveIntervalSeconds={b.saveIntervalSeconds}
              onSetThreshold={sendSetThreshold}
              onSetDeviceConfig={sendSetDeviceConfig}
              onSaveConfig={handleSaveConfig}
              onDelete={handleDelete}
            />
          </View>
        ))
      )}
    </ScreenLayout>
  );
}