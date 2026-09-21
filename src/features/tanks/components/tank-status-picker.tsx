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
        { label: 'Vacio',  value: TankStatus.EMPTY },
        { label: 'Mantenimiento',  value: TankStatus.MAINTENANCE },
    ];

    return (
        <View className="rounded-xl border border-backgroundSelected bg-white mb-4 overflow-hidden">
            <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
                style={{ color: "#111827" }}
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