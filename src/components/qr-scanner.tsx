import { Colors } from "@/constants/theme";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface QrScannerProps {
  visible: boolean;
  onScanned: (ssid: string, password: string) => void;
  onClose: () => void;
}

function parseWifiQr(data: string): { ssid: string; password: string } | null {
  const ssidMatch = data.match(/S:([^;]*)/);
  const passMatch = data.match(/P:([^;]*)/);

  if (ssidMatch && passMatch) {
    return { ssid: ssidMatch[1], password: passMatch[1] };
  }

  return null;
}

export default function QrScanner({
  visible,
  onScanned,
  onClose,
}: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");

  function handleBarcodeScanned(result: { data: string }) {
    if (scanned) return;
    setScanned(true);

    const parsed = parseWifiQr(result.data);
    if (parsed) {
      onScanned(parsed.ssid, parsed.password);
      handleClose();
    } else {
      setError("El código QR no contiene datos de WiFi válidos.");
      setScanned(false);
    }
  }

  function handleClose() {
    setScanned(false);
    setError("");
    onClose();
  }

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color={Colors.dark.text} />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 items-center justify-center bg-background px-6">
          <Text className="text-text text-lg font-bold text-center mb-4">
            Permiso de cámara requerido
          </Text>
          <Text className="text-textSecondary text-base text-center mb-8">
            Necesitamos acceder a la cámara para escanear el código QR de tu red WiFi.
          </Text>
          <TouchableOpacity
            className="bg-text rounded-lg py-3 px-8"
            onPress={requestPermission}
          >
            <Text className="text-background font-semibold text-base">
              Conceder permiso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="mt-4 py-3" onPress={handleClose}>
            <Text className="text-textSecondary text-base">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1">
        <CameraView
          className="flex-1"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        <View className="absolute top-0 left-0 right-0 bg-black/60 pt-14 pb-4 px-6 items-center">
          <Text className="text-white text-base font-semibold">
            Apunta al código QR de tu red WiFi
          </Text>
        </View>
        {error ? (
          <View className="absolute bottom-24 left-6 right-6 bg-backgroundElement border border-textSecondary rounded-lg py-3 px-4 items-center">
            <Text className="text-text text-sm text-center">{error}</Text>
          </View>
        ) : null}
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <TouchableOpacity
            className="bg-background/90 rounded-lg py-3 px-8"
            onPress={handleClose}
          >
            <Text className="text-text font-semibold text-base">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
