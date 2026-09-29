import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";

type DayPickerModalProps = {
    visible: boolean;
    selectedDay: number;
    onDayChange: (day: number) => void;
    onClose: () => void;
};

export default function DayPickerModal({ visible, selectedDay, onDayChange, onClose }: DayPickerModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-center bg-black/60 px-6">
                <View className="bg-backgroundElement rounded-2xl p-5">
                    <Text className="text-text dark:text-text-dark font-bold text-lg mb-3">
                        Seleccionar día
                    </Text>
                    <View className="bg-white rounded-xl overflow-hidden">
                        <Picker
                            selectedValue={selectedDay}
                            onValueChange={onDayChange}
                            style={{ color: "#111827" }}
                        >
                            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                                <Picker.Item key={day} label={`Día ${day}`} value={day} />
                            ))}
                        </Picker>
                    </View>
                    <TouchableOpacity className="bg-text rounded-lg py-3 mt-4" onPress={onClose}>
                        <Text className="text-background font-semibold text-center">Aceptar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}