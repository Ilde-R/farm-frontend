import ScreenLayout from "@/core/components/layout/ScreenLayout";
import QrScanner from "@/core/components/qr-scanner";
import Button from "@/core/components/ui/button";
import TextField from "@/core/components/ui/text-field";
import { useTheme } from "@/core/theme/use-theme";
import { getErrorMessage } from "@/core/utils/errors";
import { configureEsp32Service, createAerationDeviceService } from "@/features/aeration/services/aeration.service";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type FlowStep =
  | "form"
  | "provisioning"
  | "instructions"
  | "sending"
  | "done"
  | "error";

export default function AddAerationScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<FlowStep>("form");
  const [blowerId, setBlowerId] = useState("");
  const [blowerName, setBlowerName] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [deviceKey, setDeviceKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [retryFrom, setRetryFrom] = useState<"provisioning" | "sending">("provisioning");

  function clearFieldError(field: string) {
    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  async function handleProvision() {
    const nextErrors: Record<string, string> = {};
    if (!blowerId.trim()) nextErrors.blowerId = "Este campo es obligatorio";
    if (!blowerName.trim()) nextErrors.blowerName = "Este campo es obligatorio";
    if (!ssid.trim()) nextErrors.ssid = "Este campo es obligatorio";
    if (!password.trim()) nextErrors.password = "Este campo es obligatorio";

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStep("provisioning");
    try {
      const response = await createAerationDeviceService({
        blowerId: blowerId.trim(),
        blowerName: blowerName.trim(),
      });
      setDeviceKey(response.deviceKey);
      setStep("instructions");
    } catch (e) {
      setRetryFrom("provisioning");
      setErrorMsg(getErrorMessage(e, "No se pudo crear el dispositivo. Intenta de nuevo."));
      setStep("error");
    }
  }

  async function handleSendConfig() {
    setStep("sending");
    try {
      await configureEsp32Service({
        ssid: ssid.trim(),
        pass: password.trim(),
        deviceKey,
      });
      setStep("done");
    } catch (e) {
      setRetryFrom("sending");
      setErrorMsg(getErrorMessage(e, "No se pudo enviar la configuración. Intenta de nuevo."));
      setStep("error");
    }
  }

  function handleQrScanned(scannedSsid: string, scannedPassword: string) {
    setSsid(scannedSsid);
    setPassword(scannedPassword);
    if (scannedSsid.trim()) clearFieldError("ssid");
    if (scannedPassword.trim()) clearFieldError("password");
  }

  function handleReset() {
    setStep("form");
    setBlowerId("");
    setBlowerName("");
    setSsid("");
    setPassword("");
    setDeviceKey("");
    setErrorMsg("");
    setFieldErrors({});
    router.replace("/(app)/(tabs)/sensors");
  }

  function handleRetry() {
    if (retryFrom === "provisioning") {
      void handleProvision();
    } else {
      void handleSendConfig();
    }
  }

  function renderContent() {
    switch (step) {
      case "form":
        return (
          <View className="flex-1 px-2 pt-4">

            <TextField
              label="ID del blower"
              containerClassName="mb-4"
              placeholder="Ej: blwr_abc123"
              value={blowerId}
              error={fieldErrors.blowerId}
              onChangeText={(value) => {
                setBlowerId(value);
                clearFieldError("blowerId");
              }}
              autoCapitalize="none"
            />

            <TextField
              label="Nombre del blower"
              containerClassName="mb-4"
              placeholder="Ej: Ventilador 1"
              value={blowerName}
              error={fieldErrors.blowerName}
              onChangeText={(value) => {
                setBlowerName(value);
                clearFieldError("blowerName");
              }}
              autoCapitalize="words"
            />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-text font-semibold dark:text-text-dark">
                Red WiFi
              </Text>
              <TouchableOpacity onPress={() => setShowScanner(true)}>
                <Text className="text-textSecondary font-semibold dark:text-textSecondary-dark">
                  Escanear QR
                </Text>
              </TouchableOpacity>
            </View>
            <TextField
              containerClassName="mb-4"
              placeholder="Nombre de tu red WiFi"
              value={ssid}
              error={fieldErrors.ssid}
              onChangeText={(value) => {
                setSsid(value);
                clearFieldError("ssid");
              }}
              autoCapitalize="none"
            />

            <TextField
              label="Contraseña WiFi"
              containerClassName="mb-6"
              placeholder="Contraseña de tu red"
              value={password}
              error={fieldErrors.password}
              onChangeText={(value) => {
                setPassword(value);
                clearFieldError("password");
              }}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button title="Configurar" onPress={handleProvision} size="lg" />
          </View>
        );

      case "provisioning":
        return (
          <View className="flex-1 items-center justify-center px-2">
            <ActivityIndicator size="large" color={theme.text} />
            <Text className="mt-4 text-center text-base text-textSecondary dark:text-textSecondary-dark">
              Conectando con el servidor...
            </Text>
          </View>
        );

      case "instructions":
        return (
          <View className="flex-1 px-2 items-center pt-4">
            <MaterialCommunityIcons name="wifi" size={64} color={theme.text} />
            <Text className="text-text dark:text-text-dark text-lg font-bold mt-6 text-center">
              Conéctate a la red del dispositivo
            </Text>
            <Text className="text-textSecondary dark:text-textSecondary-dark text-base mt-3 text-center leading-6">
              Ve a la configuración de WiFi de tu celular y conéctate a:
            </Text>
            <View className="bg-backgroundElement dark:bg-backgroundElement-dark border border-backgroundSelected rounded-lg px-6 py-4 mt-4 items-center">
              <Text className="text-text dark:text-text-dark font-bold text-lg">Blower_Setup</Text>
              <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mt-1">
                Contraseña: 12345678
              </Text>
            </View>
            <Text className="text-textSecondary dark:text-textSecondary-dark text-sm mt-4 text-center">
              Una vez conectado, regresa a esta pantalla y toca «Enviar
              configuración».
            </Text>
            <Button
              title="Enviar configuración"
              onPress={handleSendConfig}
              size="lg"
            />
          </View>
        );

      case "sending":
        return (
          <View className="flex-1 items-center justify-center px-2">
            <ActivityIndicator size="large" color={theme.text} />
            <Text className="text-textSecondary dark:text-textSecondary-dark mt-4 text-base text-center">
              Configurando el dispositivo...
            </Text>
          </View>
        );

      case "done":
        return (
          <View className="flex-1 px-2 items-center pt-4">
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color={theme.success}
            />
            <Text className="text-text dark:text-text-dark text-lg font-bold mt-6 text-center">
              ¡Dispositivo configurado!
            </Text>
            <Text className="text-textSecondary dark:text-textSecondary-dark text-base mt-3 text-center leading-6">
              Reconéctate a tu red WiFi normal. El blower se conectará automáticamente al backend.
            </Text>
            <Button
              title="Finalizar"
              variant="secondary"
              onPress={handleReset}
              className="mt-8"
            />
          </View>
        );

      case "error":
        return (
          <View className="flex-1 px-2 items-center pt-4">
            <MaterialCommunityIcons
              name="alert-circle"
              size={64}
              color={theme.textSecondary}
            />
            <Text className="text-textSecondary dark:text-textSecondary-dark text-base mt-4 text-center">
              {errorMsg}
            </Text>
            <Button
              title="Reintentar"
              onPress={handleRetry}
              className="mt-8"
            />
            <Button
              title="Cancelar"
              variant="ghost"
              onPress={() => router.back()}
              className="mt-2"
            />
          </View>
        );
    }
  }

  return (
    <>
      <ScreenLayout
        title="Nuevo dispositivo"
        isScrollable={false}
        showBackButton={true}
      >
        {renderContent()}
      </ScreenLayout>

      <QrScanner
        visible={showScanner}
        onScanned={handleQrScanned}
        onClose={() => setShowScanner(false)}
      />
    </>
  );
}