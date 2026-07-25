import { Colors } from "@/constants/theme";
import { useSession } from "@/contexts/AuthContext";
import { validateEmail, validateUsername } from "@/utils/validations";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ViewMode = "view" | "edit";

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useSession();
  const { width } = useWindowDimensions();
  const iconSize = Math.round(width * 0.06);
  const margin = Math.round(width * 0.04);

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
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

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
        <Text
          style={{ fontSize: iconSize * 1.2 }}
          className="font-bold text-text"
        >
          Perfil
        </Text>
      </View>

      <View
        className="flex-1 items-center pt-8"
        style={{ paddingHorizontal: margin }}
      >
        <View className="w-20 h-20 rounded-full bg-backgroundElement items-center justify-center mb-4">
          <MaterialCommunityIcons
            name="account"
            size={48}
            color={Colors.light.textSecondary}
          />
        </View>

        {mode === "view" ? (
          <>
            <Text className="text-text font-bold text-xl mb-1">
              {user?.username}
            </Text>
            <Text className="text-textSecondary text-base mb-1">
              {user?.email}
            </Text>
            {user?.tenantId && (
              <Text className="text-textSecondary text-xs mb-6">
                Tenant: {user.tenantId}
              </Text>
            )}
            {!user?.tenantId && <View className="h-6" />}

            <TouchableOpacity
              className="border border-backgroundSelected rounded-lg py-3 px-8 mb-3 w-full"
              onPress={handleEdit}
            >
              <Text className="text-text font-semibold text-base text-center">
                Editar perfil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3" onPress={handleLogout}>
              <Text className="text-textError font-semibold text-base text-center">
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-textSecondary text-base mb-6">
              Editar tu información
            </Text>

            <View className="w-full">
              <Text className="text-text font-semibold mb-1">Username</Text>
              <TextInput
                className="placeholder:text-textSecondary border border-backgroundSelected rounded-lg px-4 py-3 mb-1 text-base"
                placeholder="Username"
                placeholderTextColor="#60646C"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  clearError("username");
                }}
                autoCapitalize="none"
              />
              {errors.username && (
                <Text className="text-textError text-xs mb-2">
                  {errors.username}
                </Text>
              )}

              <Text className="text-text font-semibold mb-1 mt-3">Email</Text>
              <TextInput
                className="placeholder:text-textSecondary border border-backgroundSelected rounded-lg px-4 py-3 mb-1 text-base"
                placeholder="Email"
                placeholderTextColor="#60646C"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError("email");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text className="text-textError text-xs mb-2">
                  {errors.email}
                </Text>
              )}
            </View>

            <View className="flex-row mt-6" style={{ gap: 12 }}>
              <TouchableOpacity
                className="flex-1 bg-text rounded-lg py-3"
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-background font-semibold text-base text-center">
                    Guardar
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 border border-backgroundSelected rounded-lg py-3"
                onPress={handleCancel}
                disabled={loading}
              >
                <Text className="text-text font-semibold text-base text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
