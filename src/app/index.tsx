import { useSession } from "@/features/auth/contexts/AuthContext";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const { token, isLoading } = useSession();

  if (isLoading) {
    return <View className="flex-1 bg-background dark:bg-background-dark" />;
  }

  return <Redirect href={token ? "/(app)/(tabs)/sensors" : "/(auth)/login"} />;
}
