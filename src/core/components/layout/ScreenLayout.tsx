import { useTheme } from "@/core/theme/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenLayoutProps {
  children: ReactNode;
  title?: string;
  headerRight?: ReactNode;
  isScrollable?: boolean;
  showBackButton?: boolean;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ScreenLayout({
  children,
  title,
  headerRight,
  isScrollable = true,
  showBackButton = false,
  style,
  refreshing = false,
  onRefresh,
}: ScreenLayoutProps) {
  const theme = useTheme();
  const router = useRouter();

  const Header = title ? (
    <View className="mb-4 flex-row items-center justify-between">
      <View className="flex-row items-center gap-1">
        {showBackButton && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver"
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            className="-ml-2 h-10 w-10 items-center justify-center rounded-full active:bg-backgroundSelected dark:active:bg-backgroundSelected-dark"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        <Text className="text-3xl font-bold tracking-tight text-text dark:text-text-dark">
          {title}
        </Text>
      </View>

      {headerRight && (
        <View className="flex-row items-center gap-2">{headerRight}</View>
      )}
    </View>
  ) : null;

  const Content = isScrollable ? (
    <ScrollView
      style={style}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textSecondary}
            colors={[theme.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      edges={["top"]}
    >
      <View className="mx-auto w-full max-w-3xl flex-1 px-4 pt-3">
        {Header}
        {Content}
      </View>
    </SafeAreaView>
  );
}
