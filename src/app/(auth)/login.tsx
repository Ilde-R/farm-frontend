import ScreenLayout from "@/core/components/layout/ScreenLayout";
import TextField from "@/core/components/ui/text-field";
import { useTheme } from "@/core/theme/use-theme";
import { validateEmail, validatePassword, validateUsername } from "@/core/utils/validations";
import { useSession } from "@/features/auth/contexts/AuthContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useSession();
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

  async function handleLogin() {
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
      await login({ username, email, password });
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenLayout isScrollable={false}>
      <View className="flex-1 justify-center px-5">
        <Text className="text-text dark:text-text-dark text-3xl font-bold text-center mb-10">
          Iniciar Sesión
        </Text>

        <TextField
          containerClassName="mb-4"
          placeholder="Nombre de usuario"
          value={username}
          error={errors.username}
          onChangeText={(text) => {
            setUsername(text);
            clearError("username");
          }}
          autoCapitalize="none"
        />

        <TextField
          containerClassName="mb-4"
          placeholder="Email"
          value={email}
          error={errors.email}
          onChangeText={(text) => {
            setEmail(text);
            clearError("email");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <View className="relative mb-4">
          <TextField
            error={errors.password}
            className="pr-12"
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
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="bg-backgroundElement dark:bg-backgroundElement-dark rounded-lg py-4 mt-2"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-background dark:text-text-dark text-center font-bold text-lg">
              Iniciar sesión
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-4">
          <Text className="text-textSecondary dark:text-textSecondary-dark text-center py-3 text-base">
            Crear cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}