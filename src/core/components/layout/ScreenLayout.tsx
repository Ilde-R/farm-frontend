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
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const router = useRouter();

  const iconSize = Math.round(width * 0.07); 

  const Header = title ? (
    <View className="flex-row items-center mb-4 justify-between">
      <View className="flex-row items-center">
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            className="mr-2"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={iconSize}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
        <Text className="font-bold text-3xl text-text dark:text-text-dark">
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
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark p-3" edges={["top"]}>
      {Header}
      {Content}
    </SafeAreaView>
  );
}