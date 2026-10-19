import StatusPill, { type StatusPillTone } from "@/core/components/ui/status-pill";
import { useTheme } from "@/core/theme/use-theme";
import { logger } from "@/core/utils/logger";
import SaveIntervalPicker from "@/features/aeration/components/save-interval-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { getAerationReadingsChartService } from "../services/aeration.service";
import type { AerationChartReading, UpdateAerationPayload } from "../types/aeration";

interface BlowerCardProps {
  blowerId: string;
  blowerConfigId: string;
  name: string;
  psi: number | null;
  threshold: number;
  firmwareVersion?: string;
  saveIntervalSeconds?: number;
  onSetThreshold: (blowerId: string, threshold: number) => void;
  onDelete?: (blowerId: string) => void;
  onSaveConfig?: (blowerId: string, updates: UpdateAerationPayload) => void;
}

export default function BlowerCard({
  blowerId,
  blowerConfigId,
  name,
  psi,
  threshold,
  firmwareVersion,
  saveIntervalSeconds,
  onSetThreshold,
  onSaveConfig,
  onDelete,
}: BlowerCardProps) {
  const theme = useTheme();
  const [selectingSave, setSelectingSave] = useState(false);
  const [chartReadings, setChartReadings] = useState<AerationChartReading[]>([]);
  const [chartError, setChartError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadChartReadings() {
      setChartError(false);
      try {
        const readings = await getAerationReadingsChartService(
          "today",
          blowerConfigId,
        );
        if (active) setChartReadings(readings);
      } catch (error) {
        logger.error(
          `[Aeration] No se pudo cargar el historial de ${blowerId}:`,
          error,
        );
        if (active) {
          setChartReadings([]);
          setChartError(true);
        }
      }
    }

    void loadChartReadings();
    return () => {
      active = false;
    };
  }, [blowerConfigId, blowerId]);

  const isAlert = psi !== null && psi <= threshold;
  const statusLabel =
    psi == null ? "Sin lectura" : isAlert ? "Bajo umbral" : "Normal";
  const statusTone: StatusPillTone =
    psi == null ? "neutral" : isAlert ? "danger" : "success";
  const chartColor = isAlert ? theme.danger : theme.success;

  const trendValues = chartReadings
    .map((reading) => reading.psi)
    .filter(Number.isFinite);

  const chartMax = Math.max(...trendValues, threshold + 1, 2.5);
  const chartMin = Math.min(...trendValues, 0, threshold - 0.5);
  const thresholdY = 70 - ((threshold - chartMin) / (chartMax - chartMin || 1)) * 56;
  const chartPath = trendValues
    .map((value, index) => {
      const x =
        trendValues.length === 1
          ? 55
          : (index / (trendValues.length - 1)) * 150;
      const y = 70 - ((value - chartMin) / (chartMax - chartMin || 1)) * 56;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <View className="w-full overflow-hidden rounded-2xl border border-border bg-backgroundElement shadow-sm shadow-black/5 dark:border-border-dark dark:bg-backgroundElement-dark">
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3 dark:border-border-dark">
        <Text className="min-w-0 flex-1 truncate text-sm font-semibold text-text dark:text-text-dark">
          {name}
        </Text>

        <View className="ml-3 flex-row items-center gap-3">
          <StatusPill label={statusLabel} tone={statusTone} />

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Configurar ${name}`}
            activeOpacity={0.7}
            hitSlop={6}
            onPress={() => setSelectingSave(true)}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${name}`}
            activeOpacity={0.7}
            hitSlop={6}
            onPress={() => {
              Alert.alert(
                "Eliminar blower",
                `¿Eliminar "${name}" (${blowerId})?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => onDelete?.(blowerId),
                  },
                ],
              );
            }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 py-4">
        <View className="flex-row items-end justify-between">
          <View className="w-[132px] shrink-0">
            <Text className="mb-1 text-[10px] uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark">
              Presión actual
            </Text>
            <Text className="text-4xl font-black tracking-tight text-text dark:text-text-dark">
              {psi != null ? Number(psi).toFixed(2) : "--.--"}
            </Text>
            <Text className="mt-1 text-[10px] uppercase tracking-[1.3px] text-textSecondary dark:text-textSecondary-dark">
              PSI
            </Text>
          </View>

          <View className="ml-3 min-w-0 flex-1 rounded-2xl border border-backgroundSelected bg-backgroundSelected p-2 dark:border-backgroundSelected-dark dark:bg-backgroundSelected-dark">
            <Text className="mb-2 text-[10px] uppercase tracking-[1.3px] text-textSecondary dark:text-textSecondary-dark">
              Tendencia
            </Text>

            {trendValues.length > 0 ? (
              <Svg width="100%" height={78} viewBox="0 0 160 78">
                {trendValues.length > 1 && (
                  <Path
                    d={`${chartPath} L 150 78 L 0 78 Z`}
                    fill={chartColor}
                    opacity={0.12}
                  />
                )}
                <Path
                  d={`M 0 ${thresholdY} L 150 ${thresholdY}`}
                  stroke={theme.textTertiary}
                  strokeDasharray="4 4"
                  opacity={0.9}
                />
                <Path
                  d={chartPath}
                  stroke={chartColor}
                  strokeWidth={2.2}
                  fill="none"
                />
                {trendValues.length === 1 && (
                  <Circle
                    cx={75}
                    cy={
                      70 -
                      ((trendValues[0] - chartMin) /
                        (chartMax - chartMin || 1)) *
                        56
                    }
                    r={3}
                    fill={chartColor}
                  />
                )}
              </Svg>
            ) : (
              <View className="h-[78px] items-center justify-center">
                <Text className="text-center text-[10px] text-textSecondary dark:text-textSecondary-dark">
                  {chartError ? "Sin datos" : "Sin lecturas"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-2">
          <View className="flex-1 rounded-2xl border border-backgroundSelected bg-backgroundSelected px-3 py-2 dark:border-backgroundSelected-dark dark:bg-backgroundSelected-dark">
            <Text className="text-[10px] uppercase tracking-[1.3px] text-textSecondary dark:text-textSecondary-dark">
              Umbral
            </Text>
            <Text className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
              {threshold.toFixed(1)} PSI
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-backgroundSelected bg-backgroundSelected px-3 py-2 dark:border-backgroundSelected-dark dark:bg-backgroundSelected-dark">
            <Text className="text-[10px] uppercase tracking-[1.3px] text-textSecondary dark:text-textSecondary-dark">
              Guardado
            </Text>
            <Text className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
              {saveIntervalSeconds ? `${saveIntervalSeconds / 60} min` : "--"}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl border border-backgroundSelected bg-backgroundSelected px-3 py-2 dark:border-backgroundSelected-dark dark:bg-backgroundSelected-dark">
            <Text className="text-[10px] uppercase tracking-[1.3px] text-textSecondary dark:text-textSecondary-dark">
              FW
            </Text>
            <Text className="mt-1 text-sm font-semibold text-text dark:text-text-dark">
              {firmwareVersion ?? "N/A"}
            </Text>
          </View>
        </View>
      </View>

      <SaveIntervalPicker
        name={name}
        visible={selectingSave}
        currentValue={saveIntervalSeconds ?? 1800}
        threshold={threshold}
        onSelect={(value) => {
          onSaveConfig?.(blowerId, { saveIntervalSeconds: value });
        }}
        onSetThreshold={(value) => onSetThreshold(blowerId, value)}
        onClose={() => setSelectingSave(false)}
      />
    </View>
  );
}