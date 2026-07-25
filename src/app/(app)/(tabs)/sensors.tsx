import BlowerCard from "@/components/blower-card";
import { Colors } from "@/constants/theme";
import { useSession } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { deleteBlower } from "@/services/iot.service";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BlowerDisplay {
  blowerId: string;
  name: string;
  psi: number | null;
  threshold: number;
  firmwareVersion?: string;
  readIntervalMs?: number;
}

export default function SensorsScreen() {
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

  const [, setTick] = useState(0);

  const iconSize = Math.round(width * 0.06);
  const margin = Math.round(width * 0.04);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshDevices();
    }, [refreshDevices])
  );

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
        };
      });
  })();

  const deviceOnline =
    lastReadingAt !== null && Date.now() - lastReadingAt < 10_000;

  function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => signOut() },
    ]);
  }

  async function handleDelete(blowerId: string) {
    if (!token) return;
    try {
      await deleteBlower(token, blowerId);
      await refreshDevices();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: margin, paddingTop: margin }}
      >
        <Text
          style={{ fontSize: iconSize * 1.2 }}
          className="font-bold text-text"
        >
          Sensores
        </Text>
        <View className="flex-row items-center" style={{ gap: margin }}>
          <TouchableOpacity
            onPress={() => router.push("/add-device")}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="plus"
              size={iconSize}
              color={Colors.light.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} hitSlop={8}>
            <MaterialCommunityIcons
              name="logout"
              size={iconSize}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View
        className="flex-row items-center mt-4 mb-2"
        style={{ marginHorizontal: margin }}
      >
        <View
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor: deviceOnline
              ? Colors.light.text
              : Colors.light.textSecondary,
          }}
        />
        <Text className="text-textSecondary text-xs ml-2">
          {deviceOnline ? "Conectado" : "Desconectado"}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" style={{ paddingTop: margin }}>
        {devicesLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color={Colors.light.textSecondary} />
            <Text className="text-textSecondary text-sm mt-3">Cargando dispositivos...</Text>
          </View>
        ) : blowers.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <MaterialCommunityIcons
              name="thermometer"
              size={64}
              color={Colors.light.textSecondary}
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
            <BlowerCard
              key={b.blowerId || i}
              blowerId={b.blowerId}
              name={b.name}
              psi={b.psi}
              threshold={b.threshold}
              isOnline={onlineDevices.has(b.blowerId)}
              firmwareVersion={b.firmwareVersion}
              readIntervalMs={b.readIntervalMs}
              onSetThreshold={sendSetThreshold}
              onSetDeviceConfig={sendSetDeviceConfig}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
