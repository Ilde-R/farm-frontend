import { useTheme } from "@/core/theme/use-theme";
import { cn } from "@/core/utils/cn";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState, type ReactNode } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  /** Extra content rendered inside the field, after the input (badges, icons…). */
  rightAdornment?: ReactNode;
}

export default function TextField({
  label,
  error,
  containerClassName,
  rightAdornment,
  secureTextEntry,
  className,
  onFocus,
  onBlur,
  ...textInputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const showPasswordToggle = !!secureTextEntry;

  return (
    <View className={containerClassName}>
      {label ? (
        <Text className="mb-1.5 text-sm font-medium text-text dark:text-text-dark">
          {label}
        </Text>
      ) : null}

      <View
        className={cn(
          "flex-row items-center rounded-lg border bg-backgroundElement dark:bg-backgroundElement-dark",
          focused
            ? "border-primary"
            : error
              ? "border-textError"
              : "border-backgroundSelected dark:border-backgroundSelected-dark",
        )}
      >
        <TextInput
          {...textInputProps}
          secureTextEntry={hidden}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={theme.textTertiary}
          className={cn(
            "min-w-0 flex-1 px-4 py-3 text-base text-text dark:text-text-dark",
            className,
          )}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar contraseña" : "Ocultar contraseña"}
            activeOpacity={0.7}
            hitSlop={8}
            className="px-3"
            onPress={() => setHidden((current) => !current)}
          >
            <MaterialCommunityIcons
              name={hidden ? "eye" : "eye-off"}
              size={22}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        )}

        {rightAdornment}
      </View>

      {error ? (
        <Text className="mt-1 text-xs text-textError dark:text-textError-dark">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
