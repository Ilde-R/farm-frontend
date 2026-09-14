import { useSession } from "@/features/auth/contexts/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { token, isLoading } = useSession();

  if (isLoading) return null;

  return <Redirect href={token ? "/(app)/(tabs)/sensors" : "/(auth)/login"} />;
}
