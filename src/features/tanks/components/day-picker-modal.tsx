import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type DayPickerModalProps = {
    visible: boolean;
    selectedDate: Date;
    movementDates: Date[];
    onDateChange: (date: Date) => void;
    onClose: () => void;
};

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

export default function DayPickerModal({
    visible,
    selectedDate,
    movementDates,
    onDateChange,
    onClose,
}: DayPickerModalProps) {
    const [displayedMonth, setDisplayedMonth] = useState(
        () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );

    useEffect(() => {
        if (visible) {
            setDisplayedMonth(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
            );
        }
    }, [selectedDate, visible]);

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;
    const calendarCells = [
        ...Array.from({ length: leadingDays }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
    const today = new Date();

    const isSameDate = (first: Date, second: Date) =>
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();

    const changeMonth = (offset: number) => {
        setDisplayedMonth(new Date(year, month + offset, 1));
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-center bg-black/65 px-5">
                <View className="rounded-3xl border border-white/10 bg-[#202a40] p-5">
                    <Text className="mb-1 text-xl font-bold text-white">
                        Historial por fecha
                    </Text>
                    <Text className="mb-5 text-sm text-slate-400">
                        Selecciona el día que quieres consultar
                    </Text>

                    <View className="mb-4 flex-row items-center justify-between">
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Mes anterior"
                            className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
                            onPress={() => changeMonth(-1)}
                        >
                            <MaterialCommunityIcons name="chevron-left" size={24} color="#cbd5e1" />
                        </TouchableOpacity>
                        <Text className="text-base font-semibold capitalize text-white">
                            {displayedMonth.toLocaleDateString("es-MX", {
                                month: "long",
                                year: "numeric",
                            })}
                        </Text>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Mes siguiente"
                            className="h-10 w-10 items-center justify-center rounded-xl bg-white/5"
                            onPress={() => changeMonth(1)}
                        >
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-2 flex-row">
                        {weekDays.map((day, index) => (
                            <View key={`${day}-${index}`} className="flex-1 items-center py-2">
                                <Text className="text-xs font-semibold text-slate-400">{day}</Text>
                            </View>
                        ))}
                    </View>

                    <View className="flex-row flex-wrap">
                        {calendarCells.map((day, index) => {
                            if (day === null) {
                                return <View key={`empty-${index}`} className="w-[14.2857%] p-1" />;
                            }

                            const date = new Date(year, month, day);
                            const isSelected = isSameDate(date, selectedDate);
                            const isToday = isSameDate(date, today);
                            const hasMovements = movementDates.some((movementDate) =>
                                isSameDate(date, movementDate),
                            );

                            return (
                                <View key={day} className="w-[14.2857%] p-1">
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        accessibilityLabel={`${date.toLocaleDateString("es-MX", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}${hasMovements ? ", con movimientos registrados" : ""}`}
                                        accessibilityState={{ selected: isSelected }}
                                        className={`relative h-10 items-center justify-center rounded-xl ${
                                            isSelected
                                                ? "bg-cyan-700"
                                                : hasMovements
                                                  ? "border border-cyan-400/40 bg-cyan-400/15"
                                                : isToday
                                                  ? "border border-cyan-400/50 bg-cyan-400/10"
                                                  : "bg-white/5"
                                        }`}
                                        onPress={() => onDateChange(date)}
                                    >
                                        <Text
                                            className={`-mt-1 text-sm font-medium ${
                                                isSelected ? "text-white" : "text-slate-200"
                                            }`}
                                        >
                                            {day}
                                        </Text>
                                        {hasMovements && (
                                            <View
                                                className={`absolute bottom-1 h-1 w-1 rounded-full ${
                                                    isSelected ? "bg-white" : "bg-cyan-300"
                                                }`}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>

                    <View className="mt-5 flex-row items-center justify-between">
                        <TouchableOpacity
                            accessibilityRole="button"
                            className="rounded-xl px-3 py-3"
                            onPress={() => onDateChange(today)}
                        >
                            <Text className="font-semibold text-cyan-300">Hoy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            className="rounded-xl bg-cyan-700 px-6 py-3"
                            onPress={onClose}
                        >
                            <Text className="font-semibold text-white">Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
