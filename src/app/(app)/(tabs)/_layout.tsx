import { Colors } from "@/core/constants/theme";
import { useTheme } from "@/core/theme/use-theme";
import CreateTankModal from "@/features/tanks/components/create-tank-modal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { usePathname, useRouter } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { useState } from "react";
import { TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [showCreateTank, setShowCreateTank] = useState(false);

  const isTanksTab = pathname.includes("/tanks");
  const isSensorsTab = pathname.includes("/sensors");
  const showFab = isTanksTab || isSensorsTab;

  function handleFabPress() {
    if (isTanksTab) {
      setShowCreateTank(true);
      return;
    }
    if (isSensorsTab) {
      router.push("/aerations/add-aeration");
    }
  }

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: { 
            backgroundColor: colors.backgroundElement,
            borderTopWidth: 1,
            borderTopColor: colors.backgroundSelected, 
            elevation: 0,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="sensors"
          options={{
            title: "Sensores",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="thermometer" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tanks"
          options={{
            title: "Tanques",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="fish" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {showFab && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isTanksTab ? "Registrar tanque" : "Agregar sensor"}
          onPress={handleFabPress}
          className="absolute right-5 z-50 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/30"
          style={{ bottom: insets.bottom + 72 }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={28}
            color={theme.primaryForeground}
          />
        </TouchableOpacity>
      )}

      <CreateTankModal
        visible={showCreateTank}
        onClose={() => setShowCreateTank(false)}
      />
    </View>
  );
}
