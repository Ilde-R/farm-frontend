import { Text, TextInput, View, type TextInputProps } from "react-native";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
}

export default function TextField({
  label,
  error,
  containerClassName = "",
  className = "",
  placeholderTextColor = "#9CA3AF",
  ...textInputProps
}: TextFieldProps) {
  return (
    <View className={containerClassName}>
      {label ? (
        <Text className="mb-1 text-sm font-medium text-text dark:text-text-dark">
          {label}
        </Text>
      ) : null}
      <TextInput
        {...textInputProps}
        placeholderTextColor={placeholderTextColor}
        className={`rounded-lg border px-4 py-3 text-base text-text placeholder:text-textSecondary dark:text-text-dark dark:placeholder:text-textSecondary-dark ${
          error ? "border-textError" : "border-backgroundSelected"
        } ${className}`}
      />
      {error ? (
        <Text className="mt-1 text-xs text-textError">{error}</Text>
      ) : null}
    </View>
  );
}
