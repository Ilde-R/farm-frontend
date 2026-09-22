import { useTheme } from "@/core/theme/use-theme";
import DayPickerModal from "@/features/tanks/components/DayPickerModal";
import MovementForm from "@/features/tanks/components/MovementForm";
import TankCard from "@/features/tanks/components/tank-card";
import TankStatusPicker from "@/features/tanks/components/tank-status-picker";
import { TANK_STATUS_CONFIG } from "@/features/tanks/constants/tank.constants";
import { useTank } from "@/features/tanks/contexts/TankContext";
import { TankStatus } from "@/features/tanks/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditTankScreen() {
    const { tanks, updateTank } = useTank();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const theme = useTheme();
    const { width } = useWindowDimensions();

    const currentTank = tanks.find((t) => t.id === id);

    const tankNumber = currentTank?.tankNumber ?? (Number(id) || 1)

    const iconSize = Math.round(width * 0.06);
    const margin = Math.round(width * 0.04);
    
    const [status, setStatus] = useState<TankStatus>(
        currentTank ? currentTank.tankStatus : ("Activo" as TankStatus)
    );
    const [size, setSize] = useState("Mediano");
    
    const [showDailyForm, setShowDailyForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const statusConfig = TANK_STATUS_CONFIG[status] || { form: "daily", label: "Activo" };

    const movements = [
      { id: "1", type: "Traslado", quantity: "80", tank: "Tanque 2", day: new Date().getDate(), date: "12/12/2026" },
      { id: "2", type: "Venta", quantity: "25", tank: "Tanque 2", day: new Date().getDate(), date: "12/12/2026" },
      { id: "3", type: "Mortandad", quantity: "2", tank: "Tanque 2", day: new Date().getDate(), date: "12/12/2026" },
    ];

    const selectedDateMovements = movements.filter(
        (movement) => movement.day === selectedDay,
    );

    async function handleEdit() {
        if (!id) {
            Alert.alert("Error", "No se encontró el ID del tanque.");
            return;
        }

        if (!currentTank) {
            Alert.alert("Error", "Los datos del tanque aún no se han cargado. Espera un momento.");
            return;
        }

        try {
            const payload = {
                tankNumber: currentTank.tankNumber, // Usamos el número real del tanque
                tankStatus: status,
            };

            await updateTank(payload, id);

            Alert.alert("Guardado", "Los cambios del tanque fueron guardados.");
            router.back();
        } catch (error) {
            console.error("DETALLE DEL ERROR AL GUARDAR:", error);
            Alert.alert("Error", "No se pudieron guardar los cambios.");
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
            <View
                className="flex-row items-center justify-between"
                style={{ paddingHorizontal: margin, paddingTop: margin }}
            >
                <Text
                    style={{ fontSize: Math.round(width * 0.06) * 1.2 }}
                    className="font-bold text-text dark:text-text-dark"
                >
                    Editar tanque {currentTank?.tankNumber ?? ""}
                </Text>

                <TouchableOpacity hitSlop={8}>
                    <MaterialCommunityIcons
                        name="water"
                        size={iconSize}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: Math.round(width * 0.04), marginTop: 8 }}>
                <Text className="text-text dark:text-text-dark">
                    Fecha de siembra 12/12/2012 -- 3pm
                </Text>
            </View>
            <View className="items-center mt-6">
                <TankCard tankNumber={currentTank?.tankNumber ?? 1} tankStatus={status} />
            </View>

            <View
                className="flex-1 pt-6"
                style={{ paddingHorizontal: Math.round(width * 0.04) }}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="w-full">
                    
                        <TouchableOpacity onPress={() => setShowDailyForm(true)}>
                            <Text className="text-text dark:text-text-dark font-semibold text-base mb-4">
                                {statusConfig.form === "sowing" ? "+ Iniciar siembra" : "+ Agregar registro diario"}
                            </Text>
                        </TouchableOpacity>

                        {/* --- FORMULARIO AISLADO --- */}
                        {showDailyForm && (
                            <MovementForm
                                formType={statusConfig.form as "sowing" | "daily"}
                                tankNumber={currentTank?.tankNumber ?? 1}
                                onCancel={() => setShowDailyForm(false)}
                                onSave={() => {
                                    setStatus("Activo" as TankStatus);
                                    setShowDailyForm(false);
                                }}
                            />
                        )}

                        {statusConfig.form === "daily" && (
                            <>
                                <Text className="text-text dark:text-text-dark font-semibold mb-2">
                                    Tamaño del pez
                                </Text>
                                <View className="rounded-xl border border-backgroundSelected bg-white mb-4 overflow-hidden">
                                    <Picker
                                        selectedValue={size}
                                        onValueChange={(itemValue) => setSize(itemValue)}
                                        style={{ color: "#111827" }}
                                    >
                                        <Picker.Item label="Chico" value="Chico" />
                                        <Picker.Item label="Mediano" value="Mediano" />
                                        <Picker.Item label="Grande" value="Grande" />
                                    </Picker>
                                </View>
                            </>
                        )}

                        <Text className="text-text dark:text-text-dark font-semibold mb-2">
                            Estado del tanque
                        </Text>
                        <TankStatusPicker value={status} onChange={setStatus} />

                        {statusConfig.form === "daily" && (
                            <>
                                <TouchableOpacity
                                    className="mb-2"
                                    onPress={() =>
                                        router.push({
                                            pathname: "/tanks/[id]/map" as any,
                                            params: { id: String(currentTank?.id ?? id) },
                                        })
                                    }
                                >
                                    <Text className="text-text dark:text-text-dark font-semibold">
                                        Mapa de traslado
                                    </Text>
                                </TouchableOpacity>

                                <View className="flex-row items-center justify-between mb-4" style={{ gap: 10 }}>
                                    <TouchableOpacity
                                        className="flex-1 flex-row items-center justify-center bg-text rounded-xl px-3 py-3"
                                        onPress={() => setShowHistory((visible) => !visible)}
                                    >
                                        <MaterialCommunityIcons
                                            name={showHistory ? "chevron-up" : "history"}
                                            size={20}
                                            color="#181F3B"
                                        />
                                        <Text className="text-background font-semibold ml-2">
                                            {showHistory ? "Ocultar historial" : "Ver historial"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-1 flex-row items-center border border-backgroundSelected rounded-xl px-3 py-3"
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <MaterialCommunityIcons name="calendar" size={20} color={theme.textSecondary} />
                                        <Text className="text-text dark:text-text-dark font-semibold ml-2">
                                            Día {selectedDay}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {showHistory && (
                                    <View className="mb-5">
                                        {selectedDateMovements.length === 0 ? (
                                            <Text className="text-textSecondary text-center py-6">
                                                No hay movimientos registrados este día.
                                            </Text>
                                        ) : (
                                            selectedDateMovements.map((movement, index) => (
                                                <View key={movement.id} className="flex-row">
                                                    <View className="items-center mr-3" style={{ width: 24 }}>
                                                        <View className="w-8 h-8 rounded-full bg-backgroundElement items-center justify-center">
                                                            <MaterialCommunityIcons
                                                                name={
                                                                    movement.type === "Traslado"
                                                                        ? "swap-horizontal"
                                                                        : movement.type === "Venta"
                                                                        ? "cart-arrow-down"
                                                                        : "skull-crossbones"
                                                                }
                                                                size={18}
                                                                color={
                                                                    movement.type === "Traslado"
                                                                        ? "#34d399"
                                                                        : movement.type === "Venta"
                                                                        ? "#60a5fa"
                                                                        : "#f87171"
                                                                }
                                                            />
                                                        </View>
                                                        {index < selectedDateMovements.length - 1 && (
                                                            <View className="flex-1 w-px bg-backgroundSelected" />
                                                        )}
                                                    </View>
                                                    <View className="flex-1 pb-5">
                                                        <Text className="text-textSecondary text-xs mb-1">
                                                            {movement.date}
                                                        </Text>
                                                        <View className="bg-backgroundElement rounded-xl p-3">
                                                            <View className="flex-row items-center justify-between">
                                                                <Text className="text-text dark:text-text-dark font-semibold">
                                                                    {movement.type}
                                                                </Text>
                                                                <Text className="text-text dark:text-text-dark font-bold">
                                                                    {movement.quantity} peces
                                                                </Text>
                                                            </View>
                                                            <Text className="text-textSecondary mt-1">
                                                                Destino: {movement.tank}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                )}
                            </>
                        )}
                        <TouchableOpacity 
                            className="flex-1 bg-text rounded-lg py-3"
                        >
                            <Text className="text-background font-semibold text-base text-center">
                                Cosechar estanque
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <View className="flex-row mt-6 mb-4" style={{ gap: 12 }}>
                    <TouchableOpacity
                        className="flex-1 bg-text rounded-lg py-3"
                        onPress={handleEdit}
                    >
                        <Text className="text-background font-semibold text-base text-center">
                            Guardar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 border border-backgroundSelected rounded-lg py-3"
                        onPress={() => router.back()}
                    >
                        <Text className="text-text dark:text-text-dark font-semibold text-base text-center">
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <DayPickerModal 
                visible={showDatePicker} 
                selectedDay={selectedDay} 
                onDayChange={setSelectedDay} 
                onClose={() => setShowDatePicker(false)} 
            />

        </SafeAreaView>
    );
}