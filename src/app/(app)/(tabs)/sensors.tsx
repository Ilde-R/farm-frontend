import ScreenLayout from "@/core/components/layout/ScreenLayout";
import { useTheme } from "@/core/theme/use-theme";
import { getErrorMessage } from "@/core/utils/errors";
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
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
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
  const { token } = useSession();

  const {
    latestReadings,
    thresholds,
    devices,
    devicesLoading,
    devicesError,
    refreshDevices,
    applyDeviceConfig,
  } = useSocket();

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

  async function handleDelete(blowerId: string) {
    if (!token) return;
    try {
      await deleteAerationDeviceService(blowerId);
      await refreshDevices();
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error, "No se pudo eliminar el dispositivo."));
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
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error, "No se pudo guardar la configuración."));
    }
  }

  async function handleSetThreshold(blowerId: string, currentThreshold: number) {
    await handleSaveConfig(blowerId, { currentThreshold });
  }

  return (
    <ScreenLayout title="Sensores" isScrollable={true}>
      {devicesLoading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color={theme.textSecondary} />
          <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mt-3">
            Cargando dispositivos...
          </Text>
        </View>
      ) : blowers.length === 0 && devicesError ? (
        <View className="flex-1 items-center justify-center py-12">
          <MaterialCommunityIcons
            name="wifi-off"
            size={64}
            color={theme.textSecondary}
          />
          <Text className="text-textSecondary dark:text-textSecondary-dark text-base mt-4 text-center">
            No se pudieron cargar los dispositivos.
          </Text>
          <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mt-2 text-center px-6">
            {devicesError}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => refreshDevices()}
            className="mt-4 rounded-lg border border-primary px-4 py-2"
          >
            <Text className="font-semibold text-primary">Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : blowers.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <MaterialCommunityIcons
            name="thermometer"
            size={64}
            color={theme.textSecondary}
          />
          <Text className="text-textSecondary dark:text-textSecondary-dark text-base mt-4 text-center">
            No hay blowers registrados.
          </Text>
          <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mt-2 text-center">
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