import { TANK_STATUS_OPTIONS, type TankStatus } from "@/types/tank";
import { Picker } from "@react-native-picker/picker";
import { View } from "react-native";

type TankStatusPickerProps = {
  value: TankStatus;
  onChange: (status: TankStatus) => void;
};

export default function TankStatusPicker({ value, onChange }: TankStatusPickerProps) {
  return (
    <View className="rounded-xl border border-backgroundSelected bg-white mb-4 overflow-hidden">
      <Picker
        selectedValue={value}
        onValueChange={(nextValue) => onChange(nextValue as TankStatus)}
        style={{ color: "#111827" }}
      >
        {TANK_STATUS_OPTIONS.map((status) => (
          <Picker.Item key={status} label={status} value={status} />
        ))}
      </Picker>
    </View>
  );
}
