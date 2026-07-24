import { Redirect } from "expo-router";
import { useSession } from "@/contexts/AuthContext";

export default function Index() {
  const { token, isLoading } = useSession();

  if (isLoading) return null;

  return <Redirect href={token ? "/(app)/(tabs)/sensors" : "/(auth)/login"} />;
}
