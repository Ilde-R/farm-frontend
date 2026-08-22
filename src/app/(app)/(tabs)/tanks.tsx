import TankCard from "@/components/tank-card";
import { useTheme } from "@/hooks/use-theme";
import { TANK_STATUS_OPTIONS, type TankStatus } from "@/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


type Tank = {
    numero: number;
    piezas: number;
    estado: TankStatus;
};

const initialTanks: Tank[] = [
    { numero: 1, piezas: 10, estado: "Activo" },
    { numero: 2, piezas: 0, estado: "Vacío" },
];

export default function TanksScreen() {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [tanks, setTanks] = useState(initialTanks);
    const [showAddModal, setShowAddModal] = useState(false);
    const [tankNumber, setTankNumber] = useState("");
    const [tankStatus, setTankStatus] = useState<TankStatus>("Vacío");

    const iconSize = Math.round(width * 0.06);
    const margin = Math.round(width * 0.04);

    function closeAddModal() {
        setShowAddModal(false);
        setTankNumber("");
        setTankStatus("Vacío");
    }

    function handleAddTank() {
        const number = Number(tankNumber.trim());

        if (!Number.isInteger(number) || number < 1) {
            Alert.alert("Número inválido", "Ingresa un número de tanque válido.");
            return;
        }

        if (tanks.some((tank) => tank.numero === number)) {
            Alert.alert("Tanque existente", "Ya existe un tanque con ese número.");
            return;
        }

        setTanks((currentTanks) => [
            ...currentTanks,
            { numero: number, piezas: 0, estado: tankStatus },
        ]);
        closeAddModal();
    }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: margin, paddingTop: margin }}
        >
            <Text
                style={{ fontSize: iconSize * 1.2 }}
                className="font-bold text-text dark:text-text-dark"
            >
                Tanques
            </Text>
            <View className="flex-row items-center" style={{ gap: margin }}>
                <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                hitSlop={8}
                >
                    <MaterialCommunityIcons
                    name="plus"
                    size={iconSize}
                    color={theme.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
        <ScrollView className="flex-1 bg-background">
            <View className="flex-row flex-wrap justify-center gap-4 p-4">
                {tanks.map((tank) => (
                    <TankCard
                        key={tank.numero}
                        numero={tank.numero}
                        piezas={tank.piezas}
                        estado={tank.estado}
                        onPress={() => router.push({ pathname: "/tanks/edit", params: { tankId: String(tank.numero), tankStatus: tank.estado } })}
                    />
                ))}
            </View>
        </ScrollView>
        <Modal
            visible={showAddModal}
            transparent
            animationType="fade"
            onRequestClose={closeAddModal}
        >
            <View className="flex-1 items-center justify-center bg-black/40 px-6">
                <View className="w-full rounded-xl bg-background p-6">
                    <View className="mb-6 flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-text dark:text-text-dark">
                            Registrar tanque
                        </Text>
                        <TouchableOpacity onPress={closeAddModal} hitSlop={8}>
                            <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text className="mb-1 font-semibold text-text dark:text-text-dark">
                        Número de tanque
                    </Text>
                    <TextInput
                        className="mb-4 rounded-lg border border-backgroundSelected px-4 py-3 text-text dark:text-text-dark"
                        placeholder="Ej: 3"
                        placeholderTextColor={theme.textSecondary}
                        value={tankNumber}
                        onChangeText={setTankNumber}
                        keyboardType="number-pad"
                    />

                    <Text className="mb-1 font-semibold text-text dark:text-text-dark">
                        Estado
                    </Text>
                    <View className="mb-6 overflow-hidden rounded-lg border border-backgroundSelected">
                        <Picker
                            selectedValue={tankStatus}
                            onValueChange={(value) => setTankStatus(value as TankStatus)}
                            style={{ color: theme.text }}
                        >
                            {TANK_STATUS_OPTIONS.map((status) => (
                                <Picker.Item key={status} label={status} value={status} />
                            ))}
                        </Picker>
                    </View>

                    <View className="flex-row justify-end gap-3">
                        <TouchableOpacity className="rounded-lg px-4 py-3" onPress={closeAddModal}>
                            <Text className="font-semibold text-textSecondary dark:text-textSecondary-dark">
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="rounded-lg bg-text px-4 py-3 dark:bg-text-dark" onPress={handleAddTank}>
                            <Text className="font-semibold text-background">Agregar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    </SafeAreaView>
  );
}