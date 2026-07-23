import QrScanner from "@/components/qr-scanner";
import { useSession } from "@/contexts/AuthContext";
import { configureEsp32, provisionBlower } from "@/services/iot.service";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
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

type FlowStep =
  "form" | "provisioning" | "instructions" | "sending" | "done" | "error";

export default function AddDeviceScreen() {
  const { token } = useSession();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const iconSize = Math.round(width * 0.06);
  const margin = Math.round(width * 0.04);

  const [step, setStep] = useState<FlowStep>("form");
  const [blowerId, setBlowerId] = useState("");
  const [blowerName, setBlowerName] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [deviceKey, setDeviceKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  async function handleProvision() {
    if (
      !blowerId.trim() ||
      !blowerName.trim() ||
      !ssid.trim() ||
      !password.trim()
    ) {
      Alert.alert("Campos requeridos", "Llena todos los campos.");
      return;
    }

    setStep("provisioning");
    try {
      const response = await provisionBlower(token!, {
        blowerId: blowerId.trim(),
        blowerName: blowerName.trim(),
      });
      setDeviceKey(response.deviceKey);
      setStep("instructions");
    } catch (e: any) {
      setErrorMsg(e.message);
      setStep("error");
    }
  }

  async function handleSendConfig() {
    setStep("sending");
    try {
      await configureEsp32({
        ssid: ssid.trim(),
        pass: password.trim(),
        deviceKey,
      });
      setStep("done");
    } catch (e: any) {
      setErrorMsg(e.message);
      setStep("error");
    }
  }

  function handleQrScanned(scannedSsid: string, scannedPassword: string) {
    setSsid(scannedSsid);
    setPassword(scannedPassword);
  }

  function handleReset() {
    setStep("form");
    setBlowerId("");
    setBlowerName("");
    setSsid("");
    setPassword("");
    setDeviceKey("");
    setErrorMsg("");
  }

  function renderContent() {
    switch (step) {
      case "form":
        return (
          <View className="flex-1 px-6" style={{ paddingTop: margin }}>
            <Text className="text-gray-500 text-base mb-6">
              Configura un nuevo blower para tu granja.
            </Text>

            <Text className="text-gray-700 font-semibold mb-1">
              ID del blower
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
              placeholder="Ej: blwr_abc123"
              value={blowerId}
              onChangeText={setBlowerId}
              autoCapitalize="none"
            />

            <Text className="text-gray-700 font-semibold mb-1">
              Nombre del blower
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
              placeholder="Ej: Ventilador 1"
              value={blowerName}
              onChangeText={setBlowerName}
              autoCapitalize="words"
            />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-700 font-semibold">Red WiFi</Text>
              <TouchableOpacity onPress={() => setShowScanner(true)}>
                <Text className="font-semibold">Escanear QR</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
              placeholder="Nombre de tu red WiFi"
              value={ssid}
              onChangeText={setSsid}
              autoCapitalize="none"
            />

            <Text className="text-gray-700 font-semibold mb-1">
              Contraseña WiFi
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-gray-800"
              placeholder="Contraseña de tu red"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              className="bg-black rounded-lg py-3 items-center"
              onPress={handleProvision}
            >
              <Text className="text-white font-semibold text-base">
                Configurar
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "provisioning":
        return (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-600 mt-4 text-base">
              Conectando con el servidor...
            </Text>
          </View>
        );

      case "instructions":
        return (
          <View className="flex-1 px-6 items-center justify-center">
            <MaterialCommunityIcons name="wifi" size={64} color="#fffff" />
            <Text className="text-gray-800 text-lg font-bold mt-6 text-center">
              Conéctate a la red del dispositivo
            </Text>
            <Text className="text-gray-500 text-base mt-3 text-center leading-6">
              Ve a la configuración de WiFi de tu celular y conéctate a:
            </Text>
            <View className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mt-4 items-center">
              <Text className="font-bold text-lg">Blower_Setup</Text>
              <Text className="text-sm mt-1">Contraseña: 12345678</Text>
            </View>
            <Text className="text-gray-400 text-sm mt-4 text-center">
              Una vez conectado, regresa a esta pantalla y toca "Enviar
              configuración".
            </Text>
            <TouchableOpacity
              className="bg-black rounded-lg py-3 px-8 mt-8"
              onPress={handleSendConfig}
            >
              <Text className="text-white font-semibold text-base">
                Enviar configuración
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "sending":
        return (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-600 mt-4 text-base text-center">
              Configurando el dispositivo...
            </Text>
          </View>
        );

      case "done":
        return (
          <View className="flex-1 px-6 items-center justify-center">
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color="#16a34a"
            />
            <Text className="text-gray-800 text-lg font-bold mt-6 text-center">
              ¡Dispositivo configurado!
            </Text>
            <Text className="text-gray-500 text-base mt-3 text-center leading-6">
              Reconéctate a tu red WiFi normal. El blower se conectará
              automáticamente al backend.
            </Text>
            <TouchableOpacity
              className="bg-green-600 rounded-lg py-3 px-8 mt-8"
              onPress={handleReset}
            >
              <Text className="text-white font-semibold text-base">
                Finalizar
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "error":
        return (
          <View className="flex-1 px-6 items-center justify-center">
            <MaterialCommunityIcons
              name="alert-circle"
              size={64}
              color="#dc2626"
            />
            <Text className="text-red-600 text-base mt-4 text-center">
              {errorMsg}
            </Text>
            <TouchableOpacity
              className="bg-gray-600 rounded-lg py-3 px-8 mt-8"
              onPress={handleReset}
            >
              <Text className="text-white font-semibold text-base">
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: margin, paddingTop: margin }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={iconSize}
            color="#333"
          />
          <Text
            style={{ fontSize: iconSize * 1.1 }}
            className="font-bold text-gray-800 ml-2"
          >
            Nuevo dispositivo
          </Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
      <QrScanner
        visible={showScanner}
        onScanned={handleQrScanned}
        onClose={() => setShowScanner(false)}
      />
    </SafeAreaView>
  );
}
