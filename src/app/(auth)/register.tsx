import Button from "@/core/components/ui/button";
import ScreenLayout from "@/core/components/layout/ScreenLayout";
import TextField from "@/core/components/ui/text-field";
import { getErrorMessage } from "@/core/utils/errors";
import { validateEmail, validatePassword, validateUsername } from "@/core/utils/validations";
import { useSession } from "@/features/auth/contexts/AuthContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const { signIn } = useSession();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error, "No se pudo crear la cuenta."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenLayout isScrollable={false}>
      <View className="flex-1 justify-center px-1">
        <View className="items-center">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <MaterialCommunityIcons name="leaf" size={32} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold tracking-tight text-text dark:text-text-dark">
            Crea tu cuenta
          </Text>
          <Text className="mt-1.5 text-center text-base text-textSecondary dark:text-textSecondary-dark">
            Empieza a gestionar tus tanques
          </Text>
        </View>

        <View className="mt-10">
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

        <TextField
          containerClassName="mb-1"
          placeholder="Contraseña"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearError("password");
          }}
          secureTextEntry
          error={errors.password}
        />
        <Text className="mb-6 text-xs text-textSecondary dark:text-textSecondary-dark">
          Mín. 8 caracteres, mayúscula, minúscula, número y carácter especial
        </Text>

        <Button
          title="Registrarse"
          onPress={handleRegister}
          loading={loading}
          size="lg"
          className="mt-2"
        />

        <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="mt-4">
          <Text className="py-3 text-center text-base font-medium text-primary dark:text-primary-dark">
            Iniciar sesión
          </Text>
        </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}