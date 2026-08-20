import TankCard from "@/components/tank-card";
import TankStatusPicker from "@/components/tank-status-picker";
import { useTheme } from "@/hooks/use-theme";
import { isTankStatus, TANK_STATUS_CONFIG, type TankStatus } from "@/types/tank";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditTankScreen() {
    const theme = useTheme();
    const { width } = useWindowDimensions();

    const router = useRouter();
    const { tankId, tankStatus } = useLocalSearchParams<{
      tankId?: string;
      tankStatus?: string;
    }>();
    const tankNumber = Number(tankId) || 1;
    const initialStatus: TankStatus = isTankStatus(tankStatus) ? tankStatus : "Activo";

    const iconSize = Math.round(width * 0.06);
    const margin = Math.round(width * 0.04);

    const [name, setName] = useState(`Tanque ${tankNumber}`);
    const [size, setSize] = useState("Mediano");
    const [status, setStatus] = useState<TankStatus>(initialStatus);
    const [level, setLevel] = useState("72");
    const [showDailyForm, setShowDailyForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [dailyQuantity, setDailyQuantity] = useState("");
    const [dailyNotes, setDailyNotes] = useState("");
    const [movementType, setMovementType] = useState("Traslado");
    const [dailyDate, setDailyDate] = useState(new Date());
    const [showDailyDatePicker, setShowDailyDatePicker] = useState(false);
    const statusConfig = TANK_STATUS_CONFIG[status];
    const [movements, setMovements] = useState([
      {
        id: "1",
        type: "Traslado",
        quantity: "80",
        tank: "Tanque 2",
        day: new Date().getDate(),
        date: new Date().toLocaleDateString("es-MX"),
      },
      {
        id: "2",
        type: "Venta",
        quantity: "25",
        day: new Date().getDate(),
        date: new Date().toLocaleDateString("es-MX"),
      },
      {
        id: "3",
        type: "Mortandad",
        tank: "Tanque 2",
        quantity: "2",
        day: new Date().getDate(),
        date: new Date().toLocaleDateString("es-MX"),
      },
    ]);

  const selectedDateMovements = movements.filter(
    (movement) => movement.day === selectedDay,
  );

  function handleSave() {
    Alert.alert("Guardado", "Los cambios del tanque fueron guardados.");
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View
            className="flex-row items-center justify-between"
            style={{ paddingHorizontal: margin, paddingTop: margin }}
        >
            <Text
            style={{ fontSize: iconSize * 1.2 }}
            className="font-bold text-text dark:text-text-dark"
            >
            Editar tanque {tankNumber}
            </Text>

            <TouchableOpacity hitSlop={8}>
            <MaterialCommunityIcons
                name="water"
                size={iconSize}
                color={theme.textSecondary}
            />
            </TouchableOpacity>
        </View>

        <View>
          <Text className="text-text dark:text-text-dark">
            Fecha de siembra 12/12/2012 -- 3pm
          </Text>
        </View>
        <View className=" items-center mt-8">
        <TankCard numero={tankNumber} piezas={statusConfig.form === "sowing" ? 0 : 10} estado={statusConfig.label} />
        </ View>


        <View
            className="flex-1 pt-8"
            style={{ paddingHorizontal: margin }}
        >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="w-full">
          
            <TouchableOpacity onPress={() => setShowDailyForm(true)}>
              <Text className="text-text dark:text-text-dark font-semibold text-base mb-4">
                {statusConfig.form === "sowing" ? "+ Iniciar siembra" : "+ Agregar registro diario"}
              </Text>
            </TouchableOpacity>

            {showDailyForm && statusConfig.form === "sowing" && (
              <View className="bg-[#313b59] rounded-3xl p-4 mb-4 border border-white/10 shadow-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white font-bold text-base">
                    Iniciar siembra
                  </Text>
                  <TouchableOpacity onPress={() => setShowDailyForm(false)}>
                    <MaterialCommunityIcons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">
                  Fecha de siembra
                </Text>
                <TouchableOpacity
                  className="bg-[#1b2338] border border-white/10 rounded-xl px-3 py-3 mb-4 flex-row items-center"
                  onPress={() => setShowDailyDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-clock" size={20} color="#d1d5db" />
                  <Text className="text-white ml-2">
                    {dailyDate.toLocaleString("es-MX")}
                  </Text>
                </TouchableOpacity>

                <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">
                  Tamaño del pez
                </Text>
                <View className="rounded-xl border border-white/10 bg-white mb-4 overflow-hidden">
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

                <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">
                  Cantidad a ingresar
                </Text>
                <TextInput
                  value={dailyQuantity}
                  onChangeText={setDailyQuantity}
                  placeholder="ej: 150"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  className="bg-[#1b2338] text-white border border-white/10 rounded-xl px-3 py-3 mb-4"
                />

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-emerald-500 rounded-lg py-3"
                    onPress={() => {
                      setMovements((currentMovements) => [
                        ...currentMovements,
                        {
                          id: Date.now().toString(),
                          type: "Siembra",
                          quantity: dailyQuantity || "0",
                          tank: `Tanque ${tankNumber}`,
                          day: dailyDate.getDate(),
                          date: dailyDate.toLocaleString("es-MX"),
                        },
                      ]);
                      setStatus("Activo");
                      setShowDailyForm(false);
                      setDailyQuantity("");
                      setDailyDate(new Date());
                      Alert.alert("Siembra iniciada", "El tanque ahora está activo.");
                    }}
                  >
                    <Text className="text-white font-semibold text-center">Guardar siembra</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-500/20 border border-red-500 rounded-lg py-3"
                    onPress={() => setShowDailyForm(false)}
                  >
                    <Text className="text-red-400 font-semibold text-center">Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {showDailyForm && statusConfig.form === "daily" && (
              <View className="bg-[#313b59] rounded-3xl p-4 mb-4 border border-white/10 shadow-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white font-bold text-base">
                    Registro diario
                  </Text>
                  <TouchableOpacity onPress={() => setShowDailyForm(false)}>
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-text dark:text-text-dark">
                  MOVIMIENTO
                </Text>
                  <View>
                    <Picker 
                      selectedValue={movementType}
                      onValueChange={(itemValue) => setMovementType(itemValue)}
                      style={{color: "#111827"}}
                      >
                        <Picker.Item label="Traslado" value="Traslado" />
                        <Picker.Item label="Venta" value="Venta" />
                        <Picker.Item label="Mortandad" value="Mortandad" />
                      </Picker>
                  </View>
                  
                <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">
                  Cantidad de peces
                </Text>
                <TextInput
                  value={dailyQuantity}
                  onChangeText={setDailyQuantity}
                  placeholder="ej: 150"
                  placeholderTextColor="#6b7280"
                  keyboardType="number-pad"
                  className="bg-[#1b2338] text-white border border-white/10 rounded-xl px-3 py-3 mb-4"
                />

                <Text className="text-gray-300 text-xs uppercase tracking-widest mb-2">
                  Fecha y hora
                </Text>
                <TouchableOpacity
                  className="bg-[#1b2338] border border-white/10 rounded-xl px-3 py-3 mb-4 flex-row items-center"
                  onPress={() => setShowDailyDatePicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-clock" size={20} color="#d1d5db" />
                  <Text className="text-white ml-2">
                    {dailyDate.toLocaleString("es-MX")}
                  </Text>
                </TouchableOpacity>

                <Text className="text-text dark:text-text-dark">
                  TANQUE
                </Text>
                <View>
                  <Picker
                  selectedValue={size}
                  onValueChange={(itemValue) => setSize (itemValue)}
                  style = {{color:"#111827"}}
                  >
                    <Picker.Item label="1"/>
                    <Picker.Item label="2"/>
                    <Picker.Item label="3"/>
                    <Picker.Item label="4"/>
                  </Picker>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-emerald-500 rounded-lg py-3"
                    onPress={() => {
                      Alert.alert("Guardado", "Registro diario guardado");
                      setMovements((currentMovements) => [
                        ...currentMovements,
                        {
                          id: Date.now().toString(),
                          type: movementType,
                          quantity: dailyQuantity || "0",
                          tank: `Tanque ${tankNumber}`,
                          day: dailyDate.getDate(),
                          date: dailyDate.toLocaleString("es-MX"),
                        },
                      ]);
                      setShowDailyForm(false);
                      setDailyQuantity("");
                      setDailyNotes("");
                      setDailyDate(new Date());
                    }}
                  >
                    <Text className="text-white font-semibold text-center">
                      Guardar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-500/20 border border-red-500 rounded-lg py-3"
                    onPress={() => setShowDailyForm(false)}
                  >
                    <Text className="text-red-400 font-semibold text-center">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                <Text className="text-text dark:text-text-dark font-semibold mb-2">
                  Mapa de traslado
                </Text>

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
          </View>
        </ScrollView>

        <View className="flex-row mt-6" style={{ gap: 12 }}>
          <TouchableOpacity
            className="flex-1 bg-text rounded-lg py-3"
            onPress={handleSave}
          >
            <Text className="text-background font-semibold text-base text-center">
              Guardar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 border border-backgroundSelected rounded-lg py-3"
            onPress={() => router.push("/tanks")}
          >
            <Text className="text-text dark:text-text-dark font-semibold text-base text-center">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showDailyDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDailyDatePicker(false)}
      >
        <View className="flex-1 justify-center bg-black/60 px-6">
          <View className="bg-backgroundElement rounded-2xl p-5">
            <Text className="text-text dark:text-text-dark font-bold text-lg mb-3">
              Fecha y hora del movimiento
            </Text>

            <View className="flex-row" style={{ gap: 8 }}>
              <View className="flex-1 bg-white rounded-xl overflow-hidden">
                <Picker
                  selectedValue={dailyDate.getDate()}
                  onValueChange={(day) =>
                    setDailyDate((currentDate) => {
                      const nextDate = new Date(currentDate);
                      nextDate.setDate(day);
                      return nextDate;
                    })
                  }
                  style={{ color: "#111827" }}
                >
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                    <Picker.Item key={day} label={`${day}`} value={day} />
                  ))}
                </Picker>
              </View>
              <View className="flex-1 bg-white rounded-xl overflow-hidden">
                <Picker
                  selectedValue={dailyDate.getMonth()}
                  onValueChange={(month) =>
                    setDailyDate((currentDate) => {
                      const nextDate = new Date(currentDate);
                      nextDate.setMonth(month);
                      return nextDate;
                    })
                  }
                  style={{ color: "#111827" }}
                >
                  {[
                    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
                  ].map((month, index) => (
                    <Picker.Item key={month} label={month} value={index} />
                  ))}
                </Picker>
              </View>
              <View className="flex-1 bg-white rounded-xl overflow-hidden">
                <Picker
                  selectedValue={dailyDate.getFullYear()}
                  onValueChange={(year) =>
                    setDailyDate((currentDate) => {
                      const nextDate = new Date(currentDate);
                      nextDate.setFullYear(year);
                      return nextDate;
                    })
                  }
                  style={{ color: "#111827" }}
                >
                  {[dailyDate.getFullYear() - 1, dailyDate.getFullYear(), dailyDate.getFullYear() + 1].map((year) => (
                    <Picker.Item key={year} label={`${year}`} value={year} />
                  ))}
                </Picker>
              </View>
            </View>

            <Text className="text-textSecondary text-xs uppercase tracking-widest mt-4 mb-2">
              Hora
            </Text>
            <View className="flex-row" style={{ gap: 8 }}>
              <View className="flex-1 bg-white rounded-xl overflow-hidden">
                <Picker
                  selectedValue={dailyDate.getHours()}
                  onValueChange={(hour) =>
                    setDailyDate((currentDate) => {
                      const nextDate = new Date(currentDate);
                      nextDate.setHours(hour);
                      return nextDate;
                    })
                  }
                  style={{ color: "#111827" }}
                >
                  {Array.from({ length: 24 }, (_, hour) => (
                    <Picker.Item key={hour} label={`${hour}`.padStart(2, "0")} value={hour} />
                  ))}
                </Picker>
              </View>
              <View className="flex-1 bg-white rounded-xl overflow-hidden">
                <Picker
                  selectedValue={dailyDate.getMinutes()}
                  onValueChange={(minute) =>
                    setDailyDate((currentDate) => {
                      const nextDate = new Date(currentDate);
                      nextDate.setMinutes(minute);
                      return nextDate;
                    })
                  }
                  style={{ color: "#111827" }}
                >
                  {Array.from({ length: 60 }, (_, minute) => (
                    <Picker.Item key={minute} label={`${minute}`.padStart(2, "0")} value={minute} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              className="bg-text rounded-lg py-3 mt-4"
              onPress={() => setShowDailyDatePicker(false)}
            >
              <Text className="text-background font-semibold text-center">Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 justify-center bg-black/60 px-6">
          <View className="bg-backgroundElement rounded-2xl p-5">
            <Text className="text-text dark:text-text-dark font-bold text-lg mb-3">
              Seleccionar día
            </Text>
            <View className="bg-white rounded-xl overflow-hidden">
              <Picker
                selectedValue={selectedDay}
                onValueChange={(day) => setSelectedDay(day)}
                style={{ color: "#111827" }}
              >
                {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                  <Picker.Item key={day} label={`Día ${day}`} value={day} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              className="bg-text rounded-lg py-3 mt-4"
              onPress={() => setShowDatePicker(false)}
            >
              <Text className="text-background font-semibold text-center">Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}