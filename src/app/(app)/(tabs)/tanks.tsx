import ScreenLayout from "@/core/components/layout/ScreenLayout";
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
import {
  Alert,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

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
  const theme = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className="w-[48%] items-center">
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.backgroundSelected,
          },
          animatedStyle,
        ]}
      />
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

  function renderGrid(list: Tank[]) {
    return (
      <View className="flex-row flex-wrap justify-between gap-y-5 px-4">
        {list.map((tank) => (
          <View key={tank.id} className="w-[48%] items-center">
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
          </View>
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
        <View className="pt-4">
          {tanks.length > 0 && (
            <View className="mx-4 mb-4 rounded-2xl border border-backgroundSelected dark:border-backgroundSelected-dark bg-backgroundElement dark:bg-backgroundElement-dark p-4">
              <Text className="text-xs uppercase tracking-widest text-textSecondary dark:text-textSecondary-dark">
                Total de peces
              </Text>
              <Text className="mt-1 text-4xl font-extrabold text-text dark:text-text-dark">
                {kpis.fish.toLocaleString("es-MX")}
              </Text>
              <Text className="mt-1 text-sm text-textSecondary dark:text-textSecondary-dark">
                {kpis.total} {kpis.total === 1 ? "tanque" : "tanques"} en total
              </Text>
            </View>
          )}

          {tanks.length > 0 && (
            <View className="mx-4 mb-3 flex-row items-center gap-2">
              <View className="flex-1">
                <TextField
                  placeholder="Buscar tanque por número"
                  placeholderTextColor={theme.textSecondary}
                  value={search}
                  onChangeText={setSearch}
                  keyboardType="number-pad"
                />
              </View>
              {search.length > 0 && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar búsqueda"
                  onPress={() => setSearch("")}
                  hitSlop={8}
                  className="h-12 w-12 items-center justify-center rounded-lg border border-backgroundSelected dark:border-backgroundSelected-dark"
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {tanks.length > 0 && (
            <View className="mx-4 mb-4 flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="sort"
                size={16}
                color={theme.textSecondary}
              />
              <Text className="mr-1 text-xs font-semibold uppercase tracking-widest text-textSecondary dark:text-textSecondary-dark">
                Orden
              </Text>
              {TANK_SORT_ITEMS.map((item) => {
                const isSelected = sortBy === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSortBy(item.value)}
                    className={`rounded-full border px-3 py-1.5 ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-backgroundSelected dark:border-backgroundSelected-dark"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected
                          ? "text-primary"
                          : "text-textSecondary dark:text-textSecondary-dark"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {tanks.length > 0 && (
            <View className="mx-4 mb-2 flex-row flex-wrap justify-between gap-y-3">
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
                    className={`w-[48%] flex-row items-center rounded-xl border px-3 py-3 ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-backgroundSelected dark:border-backgroundSelected-dark bg-backgroundElement dark:bg-backgroundElement-dark"
                    }`}
                    onPress={() => setTankFilter(status)}
                  >
                    <View
                      className={`mr-3 h-9 w-9 items-center justify-center rounded-lg ${
                        isSelected ? "bg-primary/15" : "bg-white/5"
                      }`}
                    >
                      <MaterialCommunityIcons
                        name={icon}
                        size={19}
                        color={isSelected ? theme.primary : theme.textSecondary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-xs text-textSecondary dark:text-textSecondary-dark"
                      >
                        {label}
                      </Text>
                      <Text
                        className={`text-lg font-bold ${
                          isSelected ? "text-primary" : "text-text dark:text-text-dark"
                        }`}
                      >
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {isLoading && (
            <View className="flex-row flex-wrap justify-between gap-y-5 px-4 pt-4">
              {[0, 1, 2, 3].map((key) => (
                <TankCardSkeleton key={key} size={tankCardSize} />
              ))}
            </View>
          )}

          {!isLoading && tanksError && tanks.length === 0 && (
            <View className="w-full items-center px-4 py-12">
              <MaterialCommunityIcons
                name="wifi-off"
                size={36}
                color={theme.textSecondary}
              />
              <Text className="mt-3 text-center font-medium text-text dark:text-text-dark">
                No se pudieron cargar los tanques
              </Text>
              <Text className="mt-1 text-center text-sm text-textSecondary dark:text-textSecondary-dark">
                {tanksError}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => fetchTanks()}
                className="mt-3 rounded-lg border border-primary px-4 py-2"
              >
                <Text className="font-semibold text-primary">Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !tanksError && tanks.length === 0 && (
            <View className="w-full items-center px-4 py-12">
              <MaterialCommunityIcons
                name="water-off"
                size={36}
                color={theme.textSecondary}
              />
              <Text className="mt-3 text-center font-medium text-text dark:text-text-dark">
                No hay tanques registrados
              </Text>
              <Text className="mt-1 text-center text-sm text-textSecondary dark:text-textSecondary-dark">
                Usa el botón + para registrar el primero.
              </Text>
            </View>
          )}

          {noSearchResults && (
            <View className="w-full items-center px-4 py-12">
              <MaterialCommunityIcons
                name="magnify-close"
                size={36}
                color={theme.textSecondary}
              />
              <Text className="mt-3 text-center font-medium text-text dark:text-text-dark">
                Sin resultados para «{normalizedSearch}»
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setSearch("")}
                className="mt-3 rounded-lg border border-primary px-4 py-2"
              >
                <Text className="font-semibold text-primary">Limpiar búsqueda</Text>
              </TouchableOpacity>
            </View>
          )}

          {noFilterResults && (
            <View className="w-full items-center px-4 py-10">
              <MaterialCommunityIcons
                name="water-off"
                size={32}
                color={theme.textSecondary}
              />
              <Text className="mt-3 text-center font-medium text-text dark:text-text-dark">
                No hay tanques en este estado
              </Text>
            </View>
          )}

          {!isLoading &&
            sortedTanks.length > 0 &&
            (tankFilter === "todos" ? (
              sections.map((section) => (
                <View key={section.status}>
                  <Text className="mb-3 mt-4 px-4 text-base font-semibold text-text dark:text-text-dark">
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
