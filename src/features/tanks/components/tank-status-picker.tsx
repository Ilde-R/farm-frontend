import { TankStatus } from "@/features/tanks/types/tank";
import { Picker } from "@react-native-picker/picker";
import { View } from "react-native";

type Props = {
    value: TankStatus;
    onChange: (value: TankStatus) => void;
    disabled?: boolean;
};

export default function TankStatusPicker({ value, onChange, disabled = false }: Props) {
    const options = [
        { label: "Activo", value: TankStatus.ACTIVE },
        { label: 'Vacío',  value: TankStatus.EMPTY },
        { label: 'Mantenimiento',  value: TankStatus.MAINTENANCE },
    ];

    return (
        <View className="mb-4 overflow-hidden rounded-xl border border-backgroundSelected dark:border-backgroundSelected-dark bg-backgroundElement dark:bg-backgroundElement-dark">
            <Picker
                enabled={!disabled}
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
                style={{ color: "#f8fafc" }}
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