import { useSession } from "@/contexts/AuthContext";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/utils/validations";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleRegister() {
    const newErrors: Record<string, string> = {};

    const usernameErr = validateUsername(username);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (usernameErr) newErrors.username = usernameErr;
    if (emailErr) newErrors.email = emailErr;
    if (passwordErr) newErrors.password = passwordErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await signIn({ username, email, password });
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-background px-8">
      <Text className="text-2xl font-bold text-center text-text mb-8">
        Crear Cuenta
      </Text>

      <TextInput
        className="placeholder:text-textSecondary border border-backgroundSelected rounded-lg px-4 py-3 mb-4 text-base "
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          clearError("username");
        }}
        autoCapitalize="none"
      />
      {errors.username && (
        <Text className="text-textError text-xs mb-2">{errors.username}</Text>
      )}

      <TextInput
        className="placeholder:text-textSecondary border border-backgroundSelected rounded-lg px-4 py-3 mb-4 text-base "
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          clearError("email");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && (
        <Text className="text-textError text-xs mb-2">{errors.email}</Text>
      )}

      <View className="relative mb-1">
        <TextInput
          className="border border-backgroundSelected rounded-lg px-4 py-3 pr-12 text-base text-text"
          placeholder="Contraseña"
          placeholderTextColor="#60646C"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearError("password");
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          className="absolute right-3 top-3"
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#60646C"
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text className="text-textError text-xs mb-2">{errors.password}</Text>
      )}
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
        <Text className="text-textSecondary text-center pt-3">
          Iniciar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
