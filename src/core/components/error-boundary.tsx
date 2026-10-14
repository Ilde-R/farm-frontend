import { Colors } from "@/core/constants/theme";
import { logger } from "@/core/utils/logger";
import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  Appearance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Captura errores de render de sus hijos y muestra una UI de respaldo
 * en lugar de dejar la pantalla en blanco. "Reintentar" vuelve a montar
 * el árbol de componentes.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    logger.error("Error no controlado en la UI:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const palette =
      Colors[Appearance.getColorScheme() === "dark" ? "dark" : "light"];

    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Text style={[styles.title, { color: palette.text }]}>
          Algo salió mal
        </Text>
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          Ocurrió un error inesperado. Puedes intentar continuar.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={this.handleReset}
          style={[styles.button, { backgroundColor: palette.primary }]}
        >
          <Text style={[styles.buttonText, { color: palette.primaryForeground }]}>
            Reintentar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
