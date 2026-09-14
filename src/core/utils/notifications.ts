import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");

let Notifications: NotificationsModule | null = null;

try {
  Notifications = require("expo-notifications");
} catch {
  // No disponible en Expo Go
}

export function isNotificationsAvailable(): boolean {
  return Notifications !== null;
}

export async function setupNotifications(): Promise<void> {
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === "granted" && Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("pressure-alerts", {
      name: "Alertas de presión",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function sendNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  if (!Notifications) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
    },
    trigger: null,
  });
}
