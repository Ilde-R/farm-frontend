import ScreenLayout from "@/core/components/layout/ScreenLayout";
import EmptyState from "@/core/components/ui/empty-state";
import StatusPill, { type StatusPillTone } from "@/core/components/ui/status-pill";
import { useTheme } from "@/core/theme/use-theme";
import { getErrorMessage } from "@/core/utils/errors";
import { useBatch } from "@/features/batches/contexts/BatchContext";
import { Batch, BatchStatus } from "@/features/batches/types/batch";
import { useTank } from "@/features/tanks/contexts/TankContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

type StatusPresentation = {
  label: string;
  tone: StatusPillTone;
};

const BATCH_STATUS_PRESENTATION: Record<string, StatusPresentation> = {
  [BatchStatus.ACTIVE]: { label: "Activo", tone: "success" },
  [BatchStatus.HARVESTED]: { label: "Cosechado", tone: "neutral" },
};

const FALLBACK_STATUS: StatusPresentation = { label: "—", tone: "neutral" };

function getBatchStatusPresentation(
  status: Batch["batchesStatus"],
): StatusPresentation {
  return BATCH_STATUS_PRESENTATION[status] ?? FALLBACK_STATUS;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-MX");
}

export default function TankBatchesScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tanks } = useTank();
  const { batches, isLoading, fetchBatches, harvestBatch } = useBatch();
  const theme = useTheme();
  const tank = tanks.find((item) => item.id === id);
  const [harvestingId, setHarvestingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void fetchBatches().catch((error) => {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los lotes.",
        );
      });
    }, [fetchBatches]),
  );

  function handleHarvest(batch: Batch) {
    Alert.alert(
      "Cosechar lote",
      "¿Confirmas que este lote se cosechó? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cosechar",
          style: "destructive",
          onPress: async () => {
            setHarvestingId(batch.id);
            try {
              await harvestBatch(batch.id);
            } catch (error) {
              Alert.alert(
                "Error",
                getErrorMessage(error, "No se pudo cosechar el lote."),
              );
            } finally {
              setHarvestingId(null);
            }
          },
        },
      ],
    );
  }

  const tankBatches = batches
    .filter((batch) => batch.tankId === id)
    .sort(
      (first, second) =>
        new Date(second.stockingDate).getTime() -
        new Date(first.stockingDate).getTime(),
    );

  const activeCount = tankBatches.filter(
    (batch) => batch.batchesStatus === BatchStatus.ACTIVE,
  ).length;

  return (
    <ScreenLayout
      title={`Lotes${tank ? ` · Tanque ${tank.tankNumber}` : ""}`}
      showBackButton
      isScrollable
    >
      <View className="pb-8">
        {isLoading && (
          <ActivityIndicator
            className="mt-8"
            size="large"
            color={theme.primary}
          />
        )}

        {!isLoading && tankBatches.length === 0 && (
          <EmptyState
            icon="clipboard-text-outline"
            title="Sin lotes registrados"
            description="Este tanque todavía no tiene lotes."
            className="mt-8"
          />
        )}

        {!isLoading && tankBatches.length > 0 && (
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wider text-textSecondary dark:text-textSecondary-dark">
              {tankBatches.length} {tankBatches.length === 1 ? "lote" : "lotes"}
            </Text>
            {activeCount > 0 && (
              <Text className="text-xs font-medium text-success dark:text-success-dark">
                {activeCount} activo{activeCount === 1 ? "" : "s"}
              </Text>
            )}
          </View>
        )}

        {tankBatches.map((batch) => {
          const status = getBatchStatusPresentation(batch.batchesStatus);
          const isActive = batch.batchesStatus === BatchStatus.ACTIVE;

          return (
            <View
              key={batch.id}
              className="mb-3 rounded-2xl border border-border dark:border-border-dark bg-backgroundElement dark:bg-backgroundElement-dark p-4"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark">
                    Lote
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <MaterialCommunityIcons
                      name="calendar-blank-outline"
                      size={13}
                      color={theme.textTertiary}
                    />
                    <Text className="ml-1 text-xs text-textSecondary dark:text-textSecondary-dark">
                      Sembrado el {formatDate(batch.stockingDate)}
                    </Text>
                  </View>
                </View>

                <StatusPill label={status.label} tone={status.tone} />
              </View>

              <View className="mt-4 flex-row rounded-xl bg-background dark:bg-background-dark p-3">
                <View className="flex-1">
                  <Text className="text-[10px] font-semibold uppercase tracking-wide text-textTertiary dark:text-textTertiary-dark">
                    Inicial
                  </Text>
                  <Text className="mt-1 text-lg font-bold text-text dark:text-text-dark">
                    {batch.initialQuantity}
                  </Text>
                </View>
                <View className="mx-3 w-px bg-border dark:bg-border-dark" />
                <View className="flex-1">
                  <Text className="text-[10px] font-semibold uppercase tracking-wide text-textTertiary dark:text-textTertiary-dark">
                    Actual
                  </Text>
                  <Text className="mt-1 text-lg font-bold text-text dark:text-text-dark">
                    {batch.currentQuantity}
                  </Text>
                </View>
              </View>

              {batch.harvestedDate && (
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-xs text-textSecondary dark:text-textSecondary-dark">
                    Fecha de cosecha
                  </Text>
                  <Text className="text-xs font-medium text-text dark:text-text-dark">
                    {formatDate(batch.harvestedDate)}
                  </Text>
                </View>
              )}

              {isActive && (
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={harvestingId !== null}
                  onPress={() => handleHarvest(batch)}
                  activeOpacity={0.75}
                  className={`mt-4 flex-row items-center justify-center rounded-lg bg-primary/10 py-2.5 dark:bg-primary-dark/10 ${
                    harvestingId !== null && harvestingId !== batch.id ? "opacity-60" : ""
                  }`}
                >
                  {harvestingId === batch.id ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="basket-check-outline"
                        size={18}
                        color={theme.primary}
                      />
                      <Text className="ml-2 text-sm font-semibold text-primary dark:text-primary-dark">
                        Cosechar
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </ScreenLayout>
  );
}
