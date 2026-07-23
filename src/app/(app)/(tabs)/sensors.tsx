import { Colors } from "@/constants/theme";
import { useSession } from "@/contexts/AuthContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SensorsScreen() {
  const { signOut } = useSession();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const iconSize = Math.round(width * 0.06);
  const margin = Math.round(width * 0.04);

  function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => signOut() },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: margin, paddingTop: margin }}
      >
        <Text style={{ fontSize: iconSize * 1.2 }} className="font-bold text-text">
          Sensores
        </Text>
        <View className="flex-row items-center" style={{ gap: margin }}>
          <TouchableOpacity onPress={() => router.push("/add-device")} hitSlop={8}>
            <MaterialCommunityIcons name="plus" size={iconSize} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} hitSlop={8}>
            <MaterialCommunityIcons name="logout" size={iconSize} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
