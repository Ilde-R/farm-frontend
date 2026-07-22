import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { VectorIcon } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="sensors">
        <NativeTabs.Trigger.Label>Sensores</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<VectorIcon family={MaterialCommunityIcons} name="thermometer" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
