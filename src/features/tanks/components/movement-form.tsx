import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import TextField from "@/core/components/ui/text-field";
import type { CreateBatchPayload } from "@/features/batches/types/batch";
import { MovementType } from "@/features/tank-movements/types/tank-movement";
import type { Tank } from "@/features/tanks/types/tank";

type DailyMovementData =
    | {
        type: MovementType.TRANSFER;
        destinationTankId: string;
        quantity: number;
        movementDate: string;
    }
    | {
        type: MovementType.SALE | MovementType.MORTALITY;
        quantity: number;
        movementDate: string;
    };

type MovementData =
    | (CreateBatchPayload & { type: "Siembra" })
    | DailyMovementData;

type MovementFormProps = {
    formType: "sowing" | "daily";
    tankId?: string;
    availableTanks: Tank[];
    onCancel: () => void;
    onSave: (movementData: MovementData) => void | Promise<void>;
};

export default function MovementForm({ formType, tankId, availableTanks, onCancel, onSave }: MovementFormProps) {
    const [dailyDate, setDailyDate] = useState(new Date());
    const [showDailyDatePicker, setShowDailyDatePicker] = useState(false);
    const [dailyQuantity, setDailyQuantity] = useState("");
    const [quantityError, setQuantityError] = useState("");
    const [movementType, setMovementType] = useState<MovementType>(MovementType.TRANSFER);
    const [targetTankId, setTargetTankId] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (formType === "sowing") {
            const initialQuantity = Number(dailyQuantity);
            if (!tankId) {
                Alert.alert("Error", "No se encontró el ID del tanque.");
                return;
            }
            if (!Number.isInteger(initialQuantity) || initialQuantity <= 0) {
                setQuantityError("Ingresa una cantidad entera mayor que 0.");
                return;
            }

            setQuantityError("");
            setIsSaving(true);
            try {
                await onSave({
                    type: "Siembra",
                    tankId,
                    initialQuantity,
                    stockingDate: dailyDate.toISOString(),
                });
            } finally {
                setIsSaving(false);
            }
        } else {
            const quantity = Number(dailyQuantity);
            if (!Number.isInteger(quantity) || quantity <= 0) {
                setQuantityError("Ingresa una cantidad entera mayor que 0.");
                return;
            }

            if (movementType === MovementType.TRANSFER) {
                const destinationTankId = targetTankId || availableTanks[0]?.id;
                if (!destinationTankId) {
                    setQuantityError("No hay tanques disponibles como destino.");
                    return;
                }
                setIsSaving(true);
                try {
                    await onSave({
                        type: MovementType.TRANSFER,
                        destinationTankId,
                        quantity,
                        movementDate: dailyDate.toISOString(),
                    });
                } finally {
                    setIsSaving(false);
                }
            } else {
                setIsSaving(true);
                try {
                    await onSave({
                        type: movementType,
                        quantity,
                        movementDate: dailyDate.toISOString(),
                    });
                } finally {
                    setIsSaving(false);
                }
            }
        }
    };

    return (
        <View className="mb-4 rounded-3xl border border-white/10 bg-[#313b59] p-4 shadow-lg">
            {formType === "daily" && (
                <>
                    <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Tipo de movimiento</Text>
                    <View className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                        <Picker selectedValue={movementType} onValueChange={(value) => setMovementType(value as MovementType)} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                            <Picker.Item label="Traslado" value={MovementType.TRANSFER} />
                            <Picker.Item label="Venta" value={MovementType.SALE} />
                            <Picker.Item label="Mortandad" value={MovementType.MORTALITY} />
                        </Picker>
                    </View>
                </>
            )}

            <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">
                {formType === "sowing" ? "Cantidad inicial de peces" : "Cantidad de peces"}
            </Text>
            <TextField
                className="border-white/10 bg-[#1b2338] text-white"
                style={{ color: "#ffffff" }}
                value={dailyQuantity}
                error={quantityError || undefined}
                onChangeText={(value) => {
                    setDailyQuantity(value);
                    if (quantityError) setQuantityError("");
                }}
                placeholder="Ej. 150"
                keyboardType="number-pad"
                containerClassName="mb-4"
            />

            <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">
                {formType === "sowing" ? "Fecha de siembra" : "Fecha y hora"}
            </Text>
            <TouchableOpacity
                className="mb-4 flex-row items-center rounded-xl border border-white/10 bg-[#1b2338] px-3 py-3"
                onPress={() => setShowDailyDatePicker(true)}
            >
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#94a3b8" />
                <Text className="ml-2 flex-1 text-slate-100">{dailyDate.toLocaleString("es-MX")}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#94a3b8" />
            </TouchableOpacity>

            {formType === "daily" && movementType === MovementType.TRANSFER && (
                <>
                    <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Tanque destino</Text>
                    <View className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                        <Picker selectedValue={targetTankId || availableTanks[0]?.id} onValueChange={setTargetTankId} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                            {availableTanks.map((tank) => (
                                <Picker.Item
                                    key={tank.id}
                                    label={`Tanque ${tank.tankNumber}`}
                                    value={tank.id}
                                />
                            ))}
                        </Picker>
                    </View>
                </>
            )}

            <View className="flex-row gap-2">
                <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-text py-3 dark:bg-text-dark" onPress={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <ActivityIndicator color="#181F3B" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />
                            <Text className="ml-2 text-center font-semibold text-background">
                                {formType === "sowing" ? "Iniciar siembra" : "Guardar"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl border border-white/15 py-3" onPress={onCancel} disabled={isSaving}>
                    <Text className="text-center font-semibold text-slate-300">Cancelar</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={showDailyDatePicker} transparent animationType="fade" onRequestClose={() => setShowDailyDatePicker(false)}>
                <View className="flex-1 justify-center bg-black/60 px-6">
                    <View className="rounded-2xl border border-white/10 bg-[#29334d] p-5">
                        <Text className="mb-3 text-lg font-bold text-white">Fecha y hora</Text>
                        
                        <View className="flex-row" style={{ gap: 8 }}>
                            <View className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                                <Picker selectedValue={dailyDate.getDate()} onValueChange={(day) => setDailyDate(curr => { const d = new Date(curr); d.setDate(day); return d; })} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <Picker.Item key={d} label={`${d}`} value={d} />)}
                                </Picker>
                            </View>
                            <View className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                                <Picker selectedValue={dailyDate.getMonth()} onValueChange={(month) => setDailyDate(curr => { const d = new Date(curr); d.setMonth(month); return d; })} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                                    {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m, i) => <Picker.Item key={m} label={m} value={i} />)}
                                </Picker>
                            </View>
                            <View className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                                <Picker selectedValue={dailyDate.getFullYear()} onValueChange={(year) => setDailyDate(curr => { const d = new Date(curr); d.setFullYear(year); return d; })} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                                    {[dailyDate.getFullYear() - 1, dailyDate.getFullYear(), dailyDate.getFullYear() + 1].map(y => <Picker.Item key={y} label={`${y}`} value={y} />)}
                                </Picker>
                            </View>
                        </View>

                        <Text className="mb-2 mt-4 text-xs uppercase tracking-widest text-slate-400">Hora</Text>
                        <View className="flex-row" style={{ gap: 8 }}>
                            <View className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                                <Picker selectedValue={dailyDate.getHours()} onValueChange={(hour) => setDailyDate(curr => { const d = new Date(curr); d.setHours(hour); return d; })} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                                    {Array.from({ length: 24 }, (_, i) => <Picker.Item key={i} label={`${i}`.padStart(2, "0")} value={i} />)}
                                </Picker>
                            </View>
                            <View className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                                <Picker selectedValue={dailyDate.getMinutes()} onValueChange={(minute) => setDailyDate(curr => { const d = new Date(curr); d.setMinutes(minute); return d; })} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                                    {Array.from({ length: 60 }, (_, i) => <Picker.Item key={i} label={`${i}`.padStart(2, "0")} value={i} />)}
                                </Picker>
                            </View>
                        </View>

                        <TouchableOpacity className="mt-4 rounded-xl bg-cyan-700 py-3" onPress={() => setShowDailyDatePicker(false)}>
                            <Text className="text-center font-semibold text-white">Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}