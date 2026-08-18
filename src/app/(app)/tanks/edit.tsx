import TankCard from "@/components/tank-card";
import { useTheme } from "@/hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditTankScreen() {
    const theme = useTheme();
    const { width } = useWindowDimensions();

    const router = useRouter();

    const iconSize = Math.round(width * 0.06);
    const margin = Math.round(width * 0.04);

    const [name, setName] = useState("Tanque 1");
    const [size, setSize] = useState("Mediano");
    const [status, setStatus] = useState("Activo");
    const [level, setLevel] = useState("72");

  function handleSave() {
    Alert.alert("Guardado", "Los cambios del tanque fueron guardados.");
  }

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
            Editar tanque
            </Text>

            <TouchableOpacity hitSlop={8}>
            <MaterialCommunityIcons
                name="water"
                size={iconSize}
                color={theme.textSecondary}
            />
            </TouchableOpacity>
        </View>

        <View className=" items-center mt-8">
        <TankCard numero={1} piezas={10} />
        </ View>


        <View
            className="flex-1 pt-8"
            style={{ paddingHorizontal: margin }}
        >
        <View className="w-full">
          
          <Text className="text-text dark:text-text-dark">
            Agregar registro diario
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nombre del tanque"
          />

          <Text className="text-text dark:text-text-dark font-semibold mb-2">
            Tamaño del pez
          </Text>
          <View className="rounded-xl border border-backgroundSelected bg-white mb-4 overflow-hidden">
            <Picker
              selectedValue={size}
              onValueChange={(itemValue) => setSize(itemValue)}
              style={{ color: "#111827" }}
            >
              <Picker.Item label="Chico" value="Chico" />
              <Picker.Item label="Mediano" value="Mediano" />
              <Picker.Item label="Grande" value="Grande" />
            </Picker>
          </View>

          <Text className="text-text dark:text-text-dark font-semibold mb-2">
            Estado del tanque
          </Text>
          <View className="rounded-xl border border-backgroundSelected bg-white mb-4 overflow-hidden">
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={{ color: "#111827" }}
            >
              <Picker.Item label="Activo" value="Activo" />
              <Picker.Item label="Vacío" value="Vacío" />
              <Picker.Item label="Mantenimiento" value="Mantenimiento" />
            </Picker>
          </View>

          <Text className="text-text dark:text-text-dark">
            Mapa de traslado
          </Text>

          <Text className="text-text dark:text-text-dark">
            Ver historial
          </Text>
        </View>

        <View className="flex-row mt-6" style={{ gap: 12 }}>
          <TouchableOpacity
            className="flex-1 bg-text rounded-lg py-3"
            onPress={handleSave}
          >
            <Text className="text-background font-semibold text-base text-center">
              Guardar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 border border-backgroundSelected rounded-lg py-3"
            onPress={() => router.push("/tanks")}
          >
            <Text className="text-text dark:text-text-dark font-semibold text-base text-center">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}