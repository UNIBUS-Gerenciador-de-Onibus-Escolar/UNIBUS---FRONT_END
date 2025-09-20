import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  User,
  MapPin,
  Clock,
  Users,
  Send,
  AlertCircle,
  CheckCircle,
  Home,
  ArrowUp,
} from "lucide-react-native";

type FormField =
  | "studentName"
  | "registrationNumber"
  | "institutionalEmail"
  | "class"
  | "shift"
  | "address"
  | "neighborhood"
  | "cep"
  | "referencePoint"
  | "preferredTime"
  | "additionalInfo";

type FormData = Record<FormField, string>;

type ShiftOption = {
  value: string;
  label: string;
  time: string;
  icon: React.ReactNode;
};

const shifts: ShiftOption[] = [
  {
    value: "morning",
    label: "Manhã",
    time: "07:00 - 12:00",
    icon: <SunIcon />,
  },
  {
    value: "afternoon",
    label: "Tarde",
    time: "13:00 - 18:00",
    icon: <MoonIcon />,
  },
  {
    value: "night",
    label: "Noite",
    time: "19:00 - 23:00",
    icon: <Clock size={16} color="black" />,
  },
];

// Dummy icons for Sun and Moon if not imported
function SunIcon() {
  return <Clock size={16} color="orange" />;
}
function MoonIcon() {
  return <Clock size={16} color="blue" />;
}

const RouteRequestScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    registrationNumber: "",
    institutionalEmail: "",
    class: "",
    shift: "",
    address: "",
    neighborhood: "",
    cep: "",
    referencePoint: "",
    preferredTime: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: FormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };
  const validateForm = () => {
    const newErrors: Partial<Record<FormField, string>> = {};
    const requiredFields: FormField[] = [
      "studentName",
      "registrationNumber",
      "institutionalEmail",
      "class",
      "shift",
      "address",
      "neighborhood",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) newErrors[field] = "Campo obrigatório";
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.institutionalEmail && !emailRegex.test(formData.institutionalEmail))
      newErrors.institutionalEmail = "Email inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Solicitação enviada",
        "Você receberá uma resposta em até 48 horas."
      );
    }, 2000);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Cabeçalho com gradiente */}
      <LinearGradient
        colors={["#FFD600", "#FFB300"]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft size={20} color="black" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Solicitar Nova Rota</Text>
          <Text style={styles.headerSubtitle}>
            Não encontrou sua rota? Solicite uma nova!
          </Text>
          <View style={styles.infoCard}>
        <LinearGradient
          colors={["#FFD600", "#FFB300"]}
          style={styles.infoIcon}
        >
          <AlertCircle size={18} color="white" />
        </LinearGradient>
        <View >
          <Text style={styles.infoTitle}>Como funciona?</Text>
          <Text style={styles.infoText}>
            Sua solicitação será analisada junto com outras da mesma região. Com
            demanda suficiente, uma nova rota pode ser criada!
          </Text>
        </View>
      </View>
        </View>
      </LinearGradient>

      {/* Info Card */}
      

      <View  style={styles.container}> 

      {/* Dados do Estudante */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={["#FFD600", "#FFB300"]}
            style={styles.sectionIcon}
          >
            <User size={18} color="black" />
          </LinearGradient>
          <Text style={styles.sectionTitle}>Dados do Estudante</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nome do estudante"
          value={formData.studentName}
          onChangeText={(val) => handleInputChange("studentName", val)}
        />
        {errors.studentName && (
          <Text style={styles.errorText}>{errors.studentName}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Matrícula"
          value={formData.registrationNumber}
          onChangeText={(val) => handleInputChange("registrationNumber", val)}
        />
        {errors.registrationNumber && (
          <Text style={styles.errorText}>{errors.registrationNumber}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email institucional"
          value={formData.institutionalEmail}
          onChangeText={(val) => handleInputChange("institutionalEmail", val)}
          keyboardType="email-address"
        />
        {errors.institutionalEmail && (
          <Text style={styles.errorText}>{errors.institutionalEmail}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Turma"
          value={formData.class}
          onChangeText={(val) => handleInputChange("class", val)}
        />
        {errors.class && (
          <Text style={styles.errorText}>{errors.class}</Text>
        )}
      </View>

      {/* Turno */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={["#FFD600", "#FFB300"]}
            style={styles.sectionIcon}
          >
            <Clock size={18} color="black" />
          </LinearGradient>
          <Text style={styles.sectionTitle}>Turno de Estudo</Text>
        </View>

        {shifts.map((shift) => (
          <TouchableOpacity
            key={shift.value}
            style={[
              styles.shiftButton,
              formData.shift === shift.value && styles.shiftButtonActive,
            ]}
            onPress={() => handleInputChange("shift", shift.value)}
          >
            <Text style={styles.shiftText}>
              {shift.icon} {shift.label} - {shift.time}
            </Text>
            {formData.shift === shift.value && <CheckCircle size={20} color="black" />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Localização */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={["#FFD600", "#FFB300"]}
            style={styles.sectionIcon}
          >
            <MapPin size={18} color="black" />
          </LinearGradient>
          <Text style={styles.sectionTitle}>Localização</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Endereço completo"
          value={formData.address}
          onChangeText={(val) => handleInputChange("address", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="Bairro"
          value={formData.neighborhood}
          onChangeText={(val) => handleInputChange("neighborhood", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="CEP"
          value={formData.cep}
          onChangeText={(val) => handleInputChange("cep", val)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Ponto de referência"
          value={formData.referencePoint}
          onChangeText={(val) => handleInputChange("referencePoint", val)}
        />
      </View>

      {/* Informações adicionais */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={["#FFD600", "#FFB300"]}
            style={styles.sectionIcon}
          >
            <Users size={18} color="black" />
          </LinearGradient>
          <Text style={styles.sectionTitle}>Informações Adicionais</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Horário preferido de saída"
          value={formData.preferredTime}
          onChangeText={(val) => handleInputChange("preferredTime", val)}
        />

        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Observações..."
          value={formData.additionalInfo}
          onChangeText={(val) => handleInputChange("additionalInfo", val)}
          multiline
        />
      </View>

      {/* Botão Enviar com gradiente e margem inferior */}
      <LinearGradient
        colors={["#FFD600", "#FFB300"]}
        style={styles.submitButtonWrapper}
      >
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="black" />
          ) : (
            <>
              <Send size={20} color="black" />
              <Text style={styles.submitText}> Solicitar Nova Rota</Text>
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ height: 30 }} /> {/* Espaço extra no final para o botão */}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 16 ,

  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#000", paddingTop:35, },
  headerSubtitle: { fontSize: 12, color: "#333" },
  infoCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#00000020",
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 20,
    width: 360,
  },
  infoIcon: {
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: { fontWeight: "bold", fontSize: 13, marginBottom: 4 },
  infoText: { fontSize: 12, color: "#333", marginRight: 50,  },
  section: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionIcon: {
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 12,
  },
  inputError: { borderColor: "red" },
  errorText: { color: "red", fontSize: 12, marginBottom: 8 },
  shiftButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  shiftButtonActive: {
    borderColor: "black",
    backgroundColor: "#FFD600",
  },
  shiftText: { fontWeight: "500" },
  submitButtonWrapper: {
    borderRadius: 16,
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderRadius: 16,
  },
  submitDisabled: { backgroundColor: "#ccc" },
  submitText: { color: "black", fontWeight: "bold" },
});

export default RouteRequestScreen;
