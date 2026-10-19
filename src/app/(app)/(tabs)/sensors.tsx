import ScreenLayout from "@/core/components/layout/ScreenLayout";
import EmptyState from "@/core/components/ui/empty-state";
import Skeleton from "@/core/components/ui/skeleton";
import { useToast } from "@/core/components/ui/toast";
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
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, View } from "react-native";

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
  const toast = useToast();
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
      toast.show({ message: "Dispositivo eliminado.", type: "success" });
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
        <View className="gap-4 pt-2">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </View>
      ) : blowers.length === 0 && devicesError ? (
        <EmptyState
          icon="wifi-off"
          title="No se pudieron cargar los dispositivos"
          description={devicesError}
          actionLabel="Reintentar"
          onAction={() => refreshDevices()}
        />
      ) : blowers.length === 0 ? (
        <EmptyState
          icon="thermometer"
          title="No hay blowers registrados"
          description="Agrega un dispositivo para comenzar."
        />
      ) : (
        blowers.map((b, i) => (
          <View key={b.blowerId || i} className="mb-4">
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