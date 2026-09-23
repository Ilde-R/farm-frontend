import { useTheme } from "@/core/theme/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import {
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
}

export default function ScreenLayout({
  children,
  title,
  headerRight,
  isScrollable = true,
  showBackButton = false,
  style,
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
    <ScrollView style={style} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-3" edges={["top"]}>
      {Header}
      {Content}
    </SafeAreaView>
  );
}