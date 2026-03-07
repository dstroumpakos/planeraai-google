import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToken } from "@/lib/useAuthenticatedMutation";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { useTheme } from "@/lib/ThemeContext";

export default function Language() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { token } = useToken();
    const { colors, isDarkMode } = useTheme();
    const settings = useQuery(api.users.getSettings as any, { token: token || "skip" });
    const updateAppSettings = useMutation(api.users.updateAppSettings);

    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");
    const [selectedCurrency, setSelectedCurrency] = useState("USD");

    useEffect(() => {
        if (settings) {
            setSelectedLanguage(settings.language || i18n.language || "en");
            setSelectedCurrency(settings.currency || "USD");
        }
    }, [settings]);

    const handleSave = async () => {
        try {
            // Change the app language immediately
            await i18n.changeLanguage(selectedLanguage);
            
            await updateAppSettings({
                token: token || "",
                language: selectedLanguage,
                currency: selectedCurrency,
            });
            Alert.alert(t("common.success"), t("settings.updatedSuccess"));
            router.back();
        } catch (error) {
            console.error("Update failed:", error);
            Alert.alert(t("common.error"), t("settings.failedUpdate"));
        }
    };

    if (settings === undefined) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>{t("common.loading")}</Text>
            </SafeAreaView>
        );
    }

    const languages = SUPPORTED_LANGUAGES.map(lang => ({
        code: lang.code,
        name: lang.nativeName,
        flag: lang.flag,
    }));

    const currencies = [
        { code: "USD", name: "US Dollar", symbol: "$" },
        { code: "EUR", name: "Euro", symbol: "€" },
        { code: "GBP", name: "British Pound", symbol: "£" },
        { code: "JPY", name: "Japanese Yen", symbol: "¥" },
        { code: "AUD", name: "Australian Dollar", symbol: "A$" },
        { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
        { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
        { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
        { code: "INR", name: "Indian Rupee", symbol: "₹" },
        { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t("settings.languageCurrency")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Language Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t("settings.language")}</Text>
                    <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
                        {languages.map((language, index) => (
                            <TouchableOpacity
                                key={language.code}
                                style={[
                                    styles.listItem,
                                    { borderBottomColor: colors.border },
                                    index === languages.length - 1 && { borderBottomWidth: 0 },
                                    selectedLanguage === language.code && { backgroundColor: isDarkMode ? colors.secondary : colors.secondary },
                                ]}
                                onPress={() => setSelectedLanguage(language.code)}
                            >
                                <Text style={styles.flag}>{language.flag}</Text>
                                <Text style={[styles.listItemText, { color: colors.text }]}>{language.name}</Text>
                                {selectedLanguage === language.code && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Currency Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t("settings.currency")}</Text>
                    <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
                        {currencies.map((currency, index) => (
                            <TouchableOpacity
                                key={currency.code}
                                style={[
                                    styles.listItem,
                                    { borderBottomColor: colors.border },
                                    index === currencies.length - 1 && { borderBottomWidth: 0 },
                                    selectedCurrency === currency.code && { backgroundColor: isDarkMode ? colors.secondary : colors.secondary },
                                ]}
                                onPress={() => setSelectedCurrency(currency.code)}
                            >
                                <Text style={[styles.currencySymbol, { color: colors.primary }]}>{currency.symbol}</Text>
                                <View style={styles.currencyInfo}>
                                    <Text style={[styles.listItemText, { color: colors.text }]}>{currency.name}</Text>
                                    <Text style={[styles.currencyCode, { color: colors.textMuted }]}>{currency.code}</Text>
                                </View>
                                {selectedCurrency === currency.code && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{t("settings.saveChanges")}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    listContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    flag: {
        fontSize: 24,
        marginRight: 12,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '600',
        width: 40,
        textAlign: 'center',
        marginRight: 12,
    },
    currencyInfo: {
        flex: 1,
    },
    listItemText: {
        fontSize: 16,
        flex: 1,
    },
    currencyCode: {
        fontSize: 13,
        marginTop: 2,
    },
    saveButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    saveButtonText: {
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: '700',
    },
});
