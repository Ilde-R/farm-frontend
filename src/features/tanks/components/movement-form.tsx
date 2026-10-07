import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import TextField from "@/core/components/ui/text-field";
import type { CreateBatchPayload } from "@/features/batches/types/batch";

type MovementType = "Traslado" | "Venta" | "Mortandad";

type DailyMovementData = {
    type: MovementType;
    quantity: string;
    tank?: string;
    date: Date;
};

type MovementData =
    | (CreateBatchPayload & { type: "Siembra" })
    | DailyMovementData;

type MovementFormProps = {
    formType: "sowing" | "daily";
    tankId?: string;
    onCancel: () => void;
    onSave: (movementData: MovementData) => void | Promise<void>;
};

export default function MovementForm({ formType, tankId, onCancel, onSave }: MovementFormProps) {
    const [dailyDate, setDailyDate] = useState(new Date());
    const [showDailyDatePicker, setShowDailyDatePicker] = useState(false);
    const [dailyQuantity, setDailyQuantity] = useState("");
    const [quantityError, setQuantityError] = useState("");
    const [movementType, setMovementType] = useState<MovementType>("Traslado");
    const [targetTank, setTargetTank] = useState("1");

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
            await onSave({
                type: "Siembra",
                tankId,
                initialQuantity,
                stockingDate: dailyDate.toISOString(),
            });
        } else {
            Alert.alert("Guardado", "Registro diario guardado");
            await onSave({
                type: movementType,
                quantity: dailyQuantity || "0",
                ...(movementType === "Traslado" && {
                    tank: `Tanque ${targetTank}`,
                }),
                date: dailyDate,
            });
        }
    };

    return (
        <View className="mb-4 rounded-3xl border border-white/10 bg-[#313b59] p-4 shadow-lg">
            {formType === "daily" && (
                <>
                    <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Tipo de movimiento</Text>
                    <View className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                        <Picker selectedValue={movementType} onValueChange={(value) => setMovementType(value as MovementType)} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                            <Picker.Item label="Traslado" value="Traslado" />
                            <Picker.Item label="Venta" value="Venta" />
                            <Picker.Item label="Mortandad" value="Mortandad" />
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
                error={formType === "sowing" ? quantityError : undefined}
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

            {formType === "daily" && movementType === "Traslado" && (
                <>
                    <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Tanque destino</Text>
                    <View className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
                        <Picker selectedValue={targetTank} onValueChange={setTargetTank} style={{ color: "#ffffff", backgroundColor: "#1b2338" }}>
                            <Picker.Item label="1" value="1" />
                            <Picker.Item label="2" value="2" />
                            <Picker.Item label="3" value="3" />
                            <Picker.Item label="4" value="4" />
                        </Picker>
                    </View>
                </>
            )}

            <View className="flex-row gap-2">
                <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl bg-text py-3 dark:bg-text-dark" onPress={handleSave}>
                    <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />
                    <Text className="ml-2 text-center font-semibold text-background">
                        {formType === "sowing" ? "Iniciar siembra" : "Guardar"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-xl border border-white/15 py-3" onPress={onCancel}>
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