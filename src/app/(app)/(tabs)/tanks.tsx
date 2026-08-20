import TankCard from "@/components/tank-card";
import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const tanques = [];

export default function TanksScreen() {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const router = useRouter();

    const iconSize = Math.round(width * 0.06);
    const margin = Math.round(width * 0.04);
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: margin, paddingTop: margin }}
        >
            <Text
                style={{ fontSize: iconSize * 1.2 }}
                className="font-bold text-text dark:text-text-dark"
            >
                Tanques
            </Text>
            <View className="flex-row items-center" style={{ gap: margin }}>
                <TouchableOpacity
                onPress={() => console.log("Agregar tanque")}
                hitSlop={8}
                >
                    <MaterialCommunityIcons
                    name="plus"
                    size={iconSize}
                    color={theme.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
        <ScrollView className="flex-1 bg-background">
            <View className="flex-row flex-wrap justify-center gap-4 p-4">
                <TankCard
                    numero={1}
                    piezas={10}
                    estado="Activo"
                    onPress={() => router.push({ pathname: "/tanks/edit", params: { tankId: "1", tankStatus: "Activo" } })}
                />
                <TankCard
                    numero={2}
                    piezas={0}
                    estado="Vacío"
                    onPress={() => router.push({ pathname: "/tanks/edit", params: { tankId: "2", tankStatus: "Vacío" } })}
                />
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}