import ScreenLayout from "@/core/components/layout/ScreenLayout";
import Button from "@/core/components/ui/button";
import TextField from "@/core/components/ui/text-field";
import { useToast } from "@/core/components/ui/toast";
import { useTheme } from "@/core/theme/use-theme";
import { getErrorMessage } from "@/core/utils/errors";
import { validateEmail, validateUsername } from "@/core/utils/validations";
import { useSession } from "@/features/auth/contexts/AuthContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

type ViewMode = "view" | "edit";

export default function ProfileScreen() {
  const theme = useTheme();
  const toast = useToast();
  const { user, signOut, updateUser } = useSession();

  const [mode, setMode] = useState<ViewMode>("view");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function clearError(field: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleEdit() {
    setUsername(user?.username ?? "");
    setEmail(user?.email ?? "");
    setErrors({});
    setMode("edit");
  }

  function handleCancel() {
    setErrors({});
    setMode("view");
  }

  function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => signOut() },
    ]);
  }

  async function handleSave() {
    const newErrors: Record<string, string> = {};
    const usernameErr = validateUsername(username);
    const emailErr = validateEmail(email);

    if (usernameErr) newErrors.username = usernameErr;
    if (emailErr) newErrors.email = emailErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await updateUser({ username, email });
      setMode("view");
      toast.show({ message: "Perfil actualizado.", type: "success" });
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error, "No se pudo actualizar el perfil."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenLayout title="Perfil" isScrollable={true}>
      <View className="items-center pt-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <MaterialCommunityIcons name="account" size={40} color={theme.primary} />
        </View>

        {mode === "view" ? (
          <>
            <Text className="mb-1 text-xl font-bold text-text dark:text-text-dark">
              {user?.username}
            </Text>
            <Text className="mb-1 text-base text-textSecondary dark:text-textSecondary-dark">
              {user?.email}
            </Text>

            <Button
              title="Editar perfil"
              variant="secondary"
              onPress={handleEdit}
              className="mb-3 mt-5 w-full"
            />

            <Button
              title="Cerrar sesión"
              variant="dangerOutline"
              onPress={handleLogout}
              className="w-full"
            />
          </>
        ) : (
          <>
            <Text className="mb-6 text-base text-textSecondary dark:text-textSecondary-dark">
              Editar tu información
            </Text>

            <View className="w-full">
              <TextField
                label="Usuario"
                containerClassName="mb-3"
                placeholder="Tu nombre de usuario"
                value={username}
                error={errors.username}
                onChangeText={(text) => {
                  setUsername(text);
                  clearError("username");
                }}
                autoCapitalize="none"
              />

              <TextField
                label="Email"
                containerClassName="mt-1"
                placeholder="Tu correo electrónico"
                value={email}
                error={errors.email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError("email");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mt-6 flex-row gap-3">
              <Button
                title="Guardar"
                onPress={handleSave}
                loading={loading}
                className="flex-1"
              />
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={handleCancel}
                disabled={loading}
                className="flex-1"
              />
            </View>
          </>
        )}
      </View>
    </ScreenLayout>
  );
}
