import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToken } from "@/lib/useAuthenticatedMutation";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function PersonalInfo() {
    const router = useRouter();
    const { token } = useToken();
    const { t } = useTranslation();
    const settings = useQuery(api.users.getSettings as any, { token: token || "skip" });
    const updatePersonalInfo = useMutation(api.users.updatePersonalInfo);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    useEffect(() => {
        if (settings) {
            setName(settings.name || "");
            setEmail(settings.email || "");
            setPhone(settings.phone || "");
            setDateOfBirth(settings.dateOfBirth || "");
        }
    }, [settings]);

    const handleSave = async () => {
        try {
            await updatePersonalInfo({ token: token || "", name, email, phone, dateOfBirth });
            Alert.alert(t('common.success'), t('settings.personalInfo.updatedSuccess'));
            router.back();
        } catch (error) {
            console.error("Update failed:", error);
            Alert.alert(t('common.error'), t('settings.personalInfo.failedUpdate'));
        }
    };

    if (settings === undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>{t('common.loading')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1B3F92" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.personalInfo.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('settings.personalInfo.fullName')}</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder={t('settings.personalInfo.enterFullName')}
                        placeholderTextColor="#B0BEC5"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('settings.personalInfo.email')}</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('settings.personalInfo.enterEmail')}
                        placeholderTextColor="#B0BEC5"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('settings.personalInfo.phoneNumber')}</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder={t('settings.personalInfo.enterPhone')}
                        placeholderTextColor="#B0BEC5"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('settings.personalInfo.dateOfBirth')}</Text>
                    <TextInput
                        style={styles.input}
                        value={dateOfBirth}
                        onChangeText={setDateOfBirth}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor="#B0BEC5"
                    />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{t('settings.saveChanges')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1B3F92',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#37474F',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        color: '#263238',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    saveButton: {
        backgroundColor: '#1B3F92',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
