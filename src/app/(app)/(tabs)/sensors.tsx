import ScreenLayout from "@/core/components/layout/ScreenLayout";
import { useTheme } from "@/core/theme/use-theme";
import BlowerCard from "@/features/aeration/components/blower-card";
import { useSocket } from "@/features/aeration/contexts/AerationSocketContext";
import {
  deleteAerationDeviceService,
  updateAerationConfigService,
} from "@/features/aeration/services/aeration.service";
import type {
  UpdateAerationPayload,
} from "@/features/aeration/types/aeration";
import { useSession } from "@/features/auth/contexts/AuthContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
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
  blowerConfigId: string;
  psi: number | null;
  threshold: number;
  firmwareVersion?: string;
  saveIntervalSeconds?: number;
}

export default function SensorsScreen() {
  const theme = useTheme();
  const { signOut, token } = useSession();
  const { width } = useWindowDimensions();
  const router = useRouter();
  
  const {
    latestReadings,
    thresholds,
    devices,
    devicesLoading,
    refreshDevices,
    applyDeviceConfig,
  } = useSocket();

  const iconSize = Math.round(width * 0.06);

  useFocusEffect(
    useCallback(() => {
      refreshDevices();
    }, [refreshDevices]),
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
          blowerConfigId: d.blowerConfigId,
          psi: reading?.psi ?? null,
          threshold:
            thresholds.get(d.blowerConfig.blowerId) ??
            d.blowerConfig.currentThreshold ??
            2.0,
          firmwareVersion: d.blowerConfig.firmwareVersion,
          saveIntervalSeconds: d.blowerConfig.saveIntervalSeconds,
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
    updates: UpdateAerationPayload
  ) {
    if (!token) return;

    try {
      const savedConfig = await updateAerationConfigService(blowerId, updates);
      applyDeviceConfig(blowerId, savedConfig);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  }

  async function handleSetThreshold(blowerId: string, currentThreshold: number) {
    await handleSaveConfig(blowerId, { currentThreshold });
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
              blowerConfigId={b.blowerConfigId}
              name={b.name}
              psi={b.psi}
              threshold={b.threshold}
              firmwareVersion={b.firmwareVersion}
              saveIntervalSeconds={b.saveIntervalSeconds}
              onSetThreshold={handleSetThreshold}
              onSaveConfig={handleSaveConfig}
              onDelete={handleDelete}
            />
          </View>
        ))
      )}
    </ScreenLayout>
  );
}