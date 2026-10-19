import { useTheme } from "@/core/theme/use-theme";
import CreateTankModal from "@/features/tanks/components/create-tank-modal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [showCreateTank, setShowCreateTank] = useState(false);

  const isTanksTab = pathname.includes("/tanks");
  const isSensorsTab = pathname.includes("/sensors");
  const showFab = isTanksTab || isSensorsTab;

  // Clears the tab bar (49pt + safe area) with breathing room.
  const fabBottom = insets.bottom + 72;

  function handleFabPress() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
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
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: {
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
          },
          tabBarStyle: {
            backgroundColor: theme.backgroundElement,
            borderTopWidth: 1,
            borderTopColor: theme.border,
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
          activeOpacity={0.85}
          onPress={handleFabPress}
          className="absolute right-5 z-50 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/30"
          style={{ bottom: fabBottom }}
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
