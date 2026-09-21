import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type MovementFormProps = {
    formType: "sowing" | "daily";
    tankNumber: number;
    onCancel: () => void;
    onSave: (movementData: any) => void;
};

export default function MovementForm({ formType, tankNumber, onCancel, onSave }: MovementFormProps) {
    const [dailyDate, setDailyDate] = useState(new Date());
    const [showDailyDatePicker, setShowDailyDatePicker] = useState(false);
    const [dailyQuantity, setDailyQuantity] = useState("");
    const [fishSize, setFishSize] = useState("Mediano");
    const [movementType, setMovementType] = useState("Traslado");
    const [targetTank, setTargetTank] = useState("1");

    const handleSave = () => {
        if (formType === "sowing") {
            Alert.alert("Siembra iniciada", "El tanque ahora está activo.");
            onSave({
                type: "Siembra",
                quantity: dailyQuantity || "0",
                tank: `Tanque ${tankNumber}`,
                date: dailyDate,
            });
        } else {
            Alert.alert("Guardado", "Registro diario guardado");
            onSave({
                type: movementType,
                quantity: dailyQuantity || "0",
                tank: `Tanque ${targetTank}`,
                date: dailyDate,
            });
        }
    };

    return (
        <View className="bg-[#313b59] rounded-3xl p-4 mb-4 border border-white/10 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white font-bold text-base">
                    {formType === "sowing" ? "Iniciar siembra" : "Registro diario"}
                </Text>
                <TouchableOpacity onPress={onCancel}>
                    <MaterialCommunityIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {formType === "daily" && (
                <>
                    <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">Movimiento</Text>
                    <View className="rounded-xl border border-white/10 bg-white mb-4 overflow-hidden">
                        <Picker selectedValue={movementType} onValueChange={setMovementType} style={{ color: "#111827" }}>
                            <Picker.Item label="Traslado" value="Traslado" />
                            <Picker.Item label="Venta" value="Venta" />
                            <Picker.Item label="Mortandad" value="Mortandad" />
                        </Picker>
                    </View>
                </>
            )}

            {formType === "sowing" && (
                <>
                    <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">Tamaño del pez</Text>
                    <View className="rounded-xl border border-white/10 bg-white mb-4 overflow-hidden">
                        <Picker selectedValue={fishSize} onValueChange={setFishSize} style={{ color: "#111827" }}>
                            <Picker.Item label="Chico" value="Chico" />
                            <Picker.Item label="Mediano" value="Mediano" />
                            <Picker.Item label="Grande" value="Grande" />
                        </Picker>
                    </View>
                </>
            )}

            <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">
                {formType === "sowing" ? "Cantidad a ingresar" : "Cantidad de peces"}
            </Text>
            <TextInput
                value={dailyQuantity}
                onChangeText={setDailyQuantity}
                placeholder="ej: 150"
                placeholderTextColor="#6b7280"
                keyboardType="number-pad"
                className="bg-[#1b2338] text-white border border-white/10 rounded-xl px-3 py-3 mb-4"
            />

            <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">Fecha y hora</Text>
            <TouchableOpacity
                className="bg-[#1b2338] border border-white/10 rounded-xl px-3 py-3 mb-4 flex-row items-center"
                onPress={() => setShowDailyDatePicker(true)}
            >
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#d1d5db" />
                <Text className="text-white ml-2">{dailyDate.toLocaleString("es-MX")}</Text>
            </TouchableOpacity>

            {formType === "daily" && (
                <>
                    <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">Tanque destino</Text>
                    <View className="rounded-xl border border-white/10 bg-white mb-4 overflow-hidden">
                        <Picker selectedValue={targetTank} onValueChange={setTargetTank} style={{ color: "#111827" }}>
                            <Picker.Item label="1" value="1" />
                            <Picker.Item label="2" value="2" />
                            <Picker.Item label="3" value="3" />
                            <Picker.Item label="4" value="4" />
                        </Picker>
                    </View>
                </>
            )}

            <View className="flex-row gap-2">
                <TouchableOpacity className="flex-1 bg-emerald-500 rounded-lg py-3" onPress={handleSave}>
                    <Text className="text-white font-semibold text-center">Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-red-500/20 border border-red-500 rounded-lg py-3" onPress={onCancel}>
                    <Text className="text-red-400 font-semibold text-center">Cancelar</Text>
                </TouchableOpacity>
            </View>

            {/* Modal de Fecha encapsulado dentro de su propio componente */}
            <Modal visible={showDailyDatePicker} transparent animationType="fade" onRequestClose={() => setShowDailyDatePicker(false)}>
                <View className="flex-1 justify-center bg-black/60 px-6">
                    <View className="bg-backgroundElement rounded-2xl p-5">
                        <Text className="text-text dark:text-text-dark font-bold text-lg mb-3">Fecha y hora</Text>
                        
                        <View className="flex-row" style={{ gap: 8 }}>
                            <View className="flex-1 bg-white rounded-xl overflow-hidden">
                                <Picker selectedValue={dailyDate.getDate()} onValueChange={(day) => setDailyDate(curr => { const d = new Date(curr); d.setDate(day); return d; })} style={{ color: "#111827" }}>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <Picker.Item key={d} label={`${d}`} value={d} />)}
                                </Picker>
                            </View>
                            <View className="flex-1 bg-white rounded-xl overflow-hidden">
                                <Picker selectedValue={dailyDate.getMonth()} onValueChange={(month) => setDailyDate(curr => { const d = new Date(curr); d.setMonth(month); return d; })} style={{ color: "#111827" }}>
                                    {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m, i) => <Picker.Item key={m} label={m} value={i} />)}
                                </Picker>
                            </View>
                            <View className="flex-1 bg-white rounded-xl overflow-hidden">
                                <Picker selectedValue={dailyDate.getFullYear()} onValueChange={(year) => setDailyDate(curr => { const d = new Date(curr); d.setFullYear(year); return d; })} style={{ color: "#111827" }}>
                                    {[dailyDate.getFullYear() - 1, dailyDate.getFullYear(), dailyDate.getFullYear() + 1].map(y => <Picker.Item key={y} label={`${y}`} value={y} />)}
                                </Picker>
                            </View>
                        </View>

                        <Text className="text-textSecondary text-xs uppercase tracking-widest mt-4 mb-2">Hora</Text>
                        <View className="flex-row" style={{ gap: 8 }}>
                            <View className="flex-1 bg-white rounded-xl overflow-hidden">
                                <Picker selectedValue={dailyDate.getHours()} onValueChange={(hour) => setDailyDate(curr => { const d = new Date(curr); d.setHours(hour); return d; })} style={{ color: "#111827" }}>
                                    {Array.from({ length: 24 }, (_, i) => <Picker.Item key={i} label={`${i}`.padStart(2, "0")} value={i} />)}
                                </Picker>
                            </View>
                            <View className="flex-1 bg-white rounded-xl overflow-hidden">
                                <Picker selectedValue={dailyDate.getMinutes()} onValueChange={(minute) => setDailyDate(curr => { const d = new Date(curr); d.setMinutes(minute); return d; })} style={{ color: "#111827" }}>
                                    {Array.from({ length: 60 }, (_, i) => <Picker.Item key={i} label={`${i}`.padStart(2, "0")} value={i} />)}
                                </Picker>
                            </View>
                        </View>

                        <TouchableOpacity className="bg-text rounded-lg py-3 mt-4" onPress={() => setShowDailyDatePicker(false)}>
                            <Text className="text-background font-semibold text-center">Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}