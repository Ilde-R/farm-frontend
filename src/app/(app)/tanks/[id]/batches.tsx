import ScreenLayout from "@/core/components/layout/ScreenLayout";
import { useTheme } from "@/core/theme/use-theme";
import { useBatch } from "@/features/batches/contexts/BatchContext";
import { Batch, BatchStatus } from "@/features/batches/types/batch";
import { useTank } from "@/features/tanks/contexts/TankContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

function getBatchStatusLabel(batch: Batch) {
  return batch.batchesStatus === BatchStatus.ACTIVE
    ? "Activo"
    : batch.batchesStatus;
}

export default function TankBatchesScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tanks } = useTank();
  const { batches, isLoading, fetchBatches } = useBatch();
  const theme = useTheme();
  const tank = tanks.find((item) => item.id === id);

  useFocusEffect(
    useCallback(() => {
      void fetchBatches().catch((error) => {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "No se pudieron cargar los lotes.",
        );
      });
    }, [fetchBatches]),
  );

  const tankBatches = batches
    .filter((batch) => batch.tankId === id)
    .sort(
      (first, second) =>
        new Date(second.stockingDate).getTime() -
        new Date(first.stockingDate).getTime(),
    );

  return (
    <ScreenLayout
      title={`Lotes${tank ? ` · Tanque ${tank.tankNumber}` : ""}`}
      showBackButton
      isScrollable
    >
      <View className="px-1 pb-8">
        {isLoading && (
          <ActivityIndicator className="mt-8" size="large" color={theme.primary} />
        )}

        {!isLoading && tankBatches.length === 0 && (
          <Text className="mt-8 text-center text-textSecondary dark:text-textSecondary-dark">
            Este tanque todavía no tiene lotes registrados.
          </Text>
        )}

        {tankBatches.map((batch) => (
          <View
            key={batch.id}
            className="mb-3 rounded-xl border border-border dark:border-border-dark p-4"
          >
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="fish"
                  size={20}
                  color={theme.primary}
                />
                <Text className="ml-2 font-semibold text-text dark:text-text-dark">
                  Lote
                </Text>
              </View>
              <Text className="text-sm text-textSecondary dark:text-textSecondary-dark">
                {getBatchStatusLabel(batch)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-textSecondary dark:text-textSecondary-dark">
                Fecha de siembra
              </Text>
              <Text className="font-medium text-text dark:text-text-dark">
                {new Date(batch.stockingDate).toLocaleDateString("es-MX")}
              </Text>
            </View>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-textSecondary dark:text-textSecondary-dark">
                Cantidad inicial
              </Text>
              <Text className="font-medium text-text dark:text-text-dark">
                {batch.initialQuantity}
              </Text>
            </View>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-textSecondary dark:text-textSecondary-dark">
                Cantidad actual
              </Text>
              <Text className="font-medium text-text dark:text-text-dark">
                {batch.currentQuantity}
              </Text>
            </View>
            {batch.harvestedDate && (
              <View className="mt-2 flex-row justify-between">
                <Text className="text-textSecondary dark:text-textSecondary-dark">
                  Fecha de cosecha
                </Text>
                <Text className="font-medium text-text dark:text-text-dark">
                  {new Date(batch.harvestedDate).toLocaleDateString("es-MX")}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScreenLayout>
  );
}
