import { useSession } from "@/contexts/AuthContext";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function SensorsScreen() {
  const { signOut, user } = useSession();

  function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => signOut() },
    ]);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl font-bold mb-4">Sensores</Text>
      {user && (
        <Text className="text-sm text-gray-500 mb-8">
          Hola, {user.username}
        </Text>
      )}

      <TouchableOpacity
        className="bg-red-500 rounded-lg px-6 py-3"
        onPress={handleLogout}
      >
        <Text className="text-white font-bold">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
