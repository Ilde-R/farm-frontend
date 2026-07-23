import { useSession } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const { signIn } = useSession();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username || !email || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await signIn({ username, email, password });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-background px-8">
      <Text className="text-2xl font-bold text-center text-text mb-8">Crear Cuenta</Text>

      <TextInput
        className="border border-backgroundSelected rounded-lg px-4 py-3 mb-4 text-base text-text"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        className="border border-backgroundSelected rounded-lg px-4 py-3 mb-4 text-base text-text"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        className="border border-backgroundSelected rounded-lg px-4 py-3 mb-2 text-base text-text"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text className="text-xs text-textSecondary mb-6">
        Mín. 8 caracteres, mayúscula, minúscula, número y carácter especial
      </Text>

      <TouchableOpacity
        className="bg-text rounded-lg py-4"
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-background text-center font-bold text-lg">
            Registrarse
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text className="text-textSecondary text-center pt-3">Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
