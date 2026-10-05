import { TankStatus } from "@/features/tanks/types/tank";
import { Picker } from "@react-native-picker/picker";
import { View } from "react-native";

type Props = {
    value: TankStatus;
    onChange: (value: TankStatus) => void;
};

export default function TankStatusPicker({ value, onChange }: Props) {
    const options = [
        { label: "Activo", value: TankStatus.ACTIVE },
        { label: 'Vacío',  value: TankStatus.EMPTY },
        { label: 'Mantenimiento',  value: TankStatus.MAINTENANCE },
    ];

    return (
        <View className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-[#1b2338]">
            <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
                style={{ color: "#f8fafc", backgroundColor: "#1b2338" }}
            >
                {options.map((option) => (
                    <Picker.Item 
                        key={option.value} 
                        label={option.label} 
                        value={option.value} 
                    />
                ))}
            </Picker>
        </View>
    );
}