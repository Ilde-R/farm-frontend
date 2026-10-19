import ScreenLayout from "@/core/components/layout/ScreenLayout";
import Card from "@/core/components/ui/card";
import EmptyState from "@/core/components/ui/empty-state";
import Skeleton from "@/core/components/ui/skeleton";
import TextField from "@/core/components/ui/text-field";
import { useTheme } from "@/core/theme/use-theme";
import { useBatch } from "@/features/batches/contexts/BatchContext";
import { getActiveBatchByTankId } from "@/features/batches/utils/batch.utils";
import TankCard, { getTankCardSize } from "@/features/tanks/components/tank-card";
import { useTank } from "@/features/tanks/contexts/TankContext";
import { TankStatus, type Tank } from "@/features/tanks/types/tank";
import {
  computeTankKpis,
  groupTanksByStatus,
  sortTanks,
  type TankSortOption,
} from "@/features/tanks/utils/tank-list";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type TankFilter = TankStatus | "todos";

const TANK_SUMMARY_ITEMS: {
  status: TankFilter;
  label: string;
  icon: "water" | "water-off" | "wrench-outline" | "format-list-bulleted";
}[] = [
  { status: "todos", label: "Todos", icon: "format-list-bulleted" },
  { status: TankStatus.ACTIVE, label: "Activos", icon: "water" },
  { status: TankStatus.EMPTY, label: "Vacíos", icon: "water-off" },
  { status: TankStatus.MAINTENANCE, label: "Mantenimiento", icon: "wrench-outline" },
];

const TANK_SORT_ITEMS: { value: TankSortOption; label: string }[] = [
  { value: "numero", label: "Número" },
  { value: "poblacion", label: "Peces" },
  { value: "siembra", label: "Siembra" },
];

function TankCardSkeleton({ size }: { size: number }) {
  return (
    <View style={{ width: size }}>
      <Skeleton className="h-44 rounded-2xl" />
    </View>
  );
}

export default function TanksScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const tankCardSize = getTankCardSize(width);
  const router = useRouter();

  const { tanks, isLoading, error: tanksError, fetchTanks } = useTank();
  const { batches, fetchBatches } = useBatch();

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  useEffect(() => {
    void fetchBatches().catch((error) => {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudieron cargar los lotes.",
      );
    });
  }, [fetchBatches]);

  const activeBatchByTankId = getActiveBatchByTankId(batches);

  const [tankFilter, setTankFilter] = useState<TankFilter>("todos");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<TankSortOption>("numero");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const kpis = computeTankKpis(tanks, activeBatchByTankId);

  const normalizedSearch = search.trim();
  const searchFiltered = normalizedSearch
    ? tanks.filter((tank) => String(tank.tankNumber).includes(normalizedSearch))
    : tanks;
  const statusFiltered =
    tankFilter === "todos"
      ? searchFiltered
      : searchFiltered.filter((tank) => tank.tankStatus === tankFilter);
  const sortedTanks = sortTanks(statusFiltered, sortBy, activeBatchByTankId);
  const sections =
    tankFilter === "todos" ? groupTanksByStatus(sortedTanks) : [];

  const noSearchResults =
    !isLoading && tanks.length > 0 && normalizedSearch.length > 0 && searchFiltered.length === 0;
  const noFilterResults =
    !isLoading && tanks.length > 0 && !noSearchResults && statusFiltered.length === 0;

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchTanks(), fetchBatches()]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudieron actualizar los datos.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  function cycleSort() {
    const currentIndex = TANK_SORT_ITEMS.findIndex((item) => item.value === sortBy);
    const nextIndex = (currentIndex + 1) % TANK_SORT_ITEMS.length;
    setSortBy(TANK_SORT_ITEMS[nextIndex].value);
  }

  function renderGrid(list: Tank[]) {
    return (
      <View className="flex-row flex-wrap justify-between gap-y-5">
        {list.map((tank, index) => (
          <Animated.View
            key={tank.id}
            entering={FadeInDown.delay(Math.min(index, 8) * 50).duration(320)}
          >
            <TankCard
              size={tankCardSize}
              tankNumber={tank.tankNumber}
              tankStatus={tank.tankStatus}
              currentQuantity={activeBatchByTankId.get(tank.id)?.currentQuantity}
              stockingDate={activeBatchByTankId.get(tank.id)?.stockingDate}
              onPress={() =>
                router.push({
                  pathname: "/tanks/[id]/edit",
                  params: { id: tank.id },
                })
              }
            />
          </Animated.View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScreenLayout
        title="Tanques"
        isScrollable={true}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      >
        <View className="pt-2">
          {tanks.length > 0 && (
            <Card className="mb-4 items-center py-6">
              <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-textSecondary dark:text-textSecondary-dark">
                Total de peces
              </Text>
              <Text className="mt-2 text-5xl font-extrabold tracking-tight text-text dark:text-text-dark">
                {kpis.fish.toLocaleString("es-MX")}
              </Text>
              <Text className="mt-1 text-sm text-textSecondary dark:text-textSecondary-dark">
                en {kpis.total} {kpis.total === 1 ? "tanque" : "tanques"}
              </Text>

              <View className="mt-5 w-full flex-row border-t border-border pt-4 dark:border-border-dark">
                {[
                  { label: "Activos", value: kpis.active, color: theme.success },
                  { label: "Vacíos", value: kpis.empty, color: theme.textSecondary },
                  { label: "Mantenim.", value: kpis.maintenance, color: theme.warning },
                ].map((stat, index) => (
                  <View
                    key={stat.label}
                    className={`flex-1 items-center ${index > 0 ? "border-l border-border dark:border-border-dark" : ""}`}
                  >
                    <Text
                      className="text-xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </Text>
                    <Text className="mt-0.5 text-[11px] text-textSecondary dark:text-textSecondary-dark">
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {tanks.length > 0 && (
            <View className="mb-4 flex-row items-center gap-2">
              <View className="flex-1">
                <TextField
                  placeholder="Buscar por número"
                  value={search}
                  onChangeText={setSearch}
                  keyboardType="number-pad"
                />
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Cambiar orden"
                onPress={cycleSort}
                className="h-12 flex-row items-center gap-1.5 rounded-lg border border-backgroundSelected px-3 dark:border-backgroundSelected-dark"
              >
                <MaterialCommunityIcons
                  name="sort"
                  size={18}
                  color={theme.textSecondary}
                />
                <Text className="text-xs font-semibold text-text dark:text-text-dark">
                  {TANK_SORT_ITEMS.find((item) => item.value === sortBy)?.label}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {tanks.length > 0 && (
            <View className="mb-5 flex-row flex-wrap gap-2">
              {TANK_SUMMARY_ITEMS.map(({ status, label, icon }) => {
                const count =
                  status === "todos"
                    ? tanks.length
                    : tanks.filter((tank) => tank.tankStatus === status).length;
                const isSelected = tankFilter === status;

                return (
                  <TouchableOpacity
                    key={status}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-backgroundSelected dark:border-backgroundSelected-dark"
                    }`}
                    onPress={() => setTankFilter(status)}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={15}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected
                          ? "text-primary"
                          : "text-textSecondary dark:text-textSecondary-dark"
                      }`}
                    >
                      {label}
                    </Text>
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-primary" : "text-text dark:text-text-dark"
                      }`}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {(isLoading || (tanks.length === 0 && !tanksError)) && (
            <View className="flex-row flex-wrap justify-between gap-y-5">
              {[0, 1, 2, 3].map((key) => (
                <TankCardSkeleton key={key} size={tankCardSize} />
              ))}
            </View>
          )}

          {!isLoading && tanksError && tanks.length === 0 && (
            <EmptyState
              icon="wifi-off"
              title="No se pudieron cargar los tanques"
              description={tanksError}
              actionLabel="Reintentar"
              onAction={() => fetchTanks()}
            />
          )}

          {!isLoading && !tanksError && tanks.length === 0 && (
            <EmptyState
              icon="water-off"
              title="No hay tanques registrados"
              description="Usa el botón + para registrar el primero."
            />
          )}

          {noSearchResults && (
            <EmptyState
              icon="magnify-close"
              title={`Sin resultados para «${normalizedSearch}»`}
              actionLabel="Limpiar búsqueda"
              onAction={() => setSearch("")}
            />
          )}

          {noFilterResults && (
            <EmptyState
              icon="water-off"
              title="No hay tanques en este estado"
            />
          )}

          {!isLoading &&
            sortedTanks.length > 0 &&
            (tankFilter === "todos" ? (
              sections.map((section) => (
                <View key={section.status}>
                  <Text className="mb-3 mt-4 text-base font-semibold text-text dark:text-text-dark">
                    {section.label} ({section.tanks.length})
                  </Text>
                  {renderGrid(section.tanks)}
                </View>
              ))
            ) : (
              <View className="pt-4">{renderGrid(sortedTanks)}</View>
            ))}

          <View className="h-24" />
        </View>
      </ScreenLayout>
    </View>
  );
}
