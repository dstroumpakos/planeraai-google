import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Platform,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AIConsentModalProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
    colors: {
        text: string;
        background: string;
        textSecondary?: string;
        border?: string;
    };
}

export default function AIConsentModal({
    visible,
    onAccept,
    onDecline,
    colors,
}: AIConsentModalProps) {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onDecline}
        >
            <View style={styles.overlay}>
                {/* Tap-to-dismiss backdrop */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onDecline}
                />

                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.handle} />

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                    >
                        {/* Header */}
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: "#FFF3CD" }]}>
                                <Ionicons name="shield-checkmark" size={32} color="#856404" />
                            </View>
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>
                            {t('aiConsent.title')}
                        </Text>

                        <Text style={[styles.description, { color: colors.textSecondary || "#6B6B6B" }]}>
                            {t('aiConsent.description')}
                        </Text>

                        {/* Who receives the data */}
                        <View style={[styles.infoCard, { backgroundColor: colors.text + "08" }]}>
                            <View style={styles.infoRow}>
                                <Ionicons name="business-outline" size={20} color={colors.text} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={[styles.infoLabel, { color: colors.text }]}>
                                        {t('aiConsent.thirdPartyProvider')}
                                    </Text>
                                    <Text style={[styles.infoValue, { color: colors.textSecondary || "#6B6B6B" }]}>
                                        {t('aiConsent.openaiLocation')}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* What data is shared */}
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('aiConsent.whatDataShared')}
                        </Text>

                        <View style={[styles.dataList, { borderColor: colors.border || "#E8E6E1" }]}>
                            <DataItem
                                icon="location-outline"
                                label={t('aiConsent.dataTrip')}
                                colors={colors}
                            />
                            <DataItem
                                icon="calendar-outline"
                                label={t('aiConsent.dataDates')}
                                colors={colors}
                            />
                            <DataItem
                                icon="wallet-outline"
                                label={t('aiConsent.dataBudget')}
                                colors={colors}
                            />
                            <DataItem
                                icon="heart-outline"
                                label={t('aiConsent.dataInterests')}
                                colors={colors}
                            />
                            <DataItem
                                icon="chatbubble-outline"
                                label={t('aiConsent.dataMessages')}
                                colors={colors}
                            />
                        </View>

                        {/* What is NOT shared */}
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('aiConsent.whatNotShared')}
                        </Text>

                        <View style={[styles.dataList, { borderColor: colors.border || "#E8E6E1" }]}>
                            <DataItem
                                icon="close-circle-outline"
                                label={t('aiConsent.notName')}
                                colors={colors}
                                isExcluded
                            />
                            <DataItem
                                icon="close-circle-outline"
                                label={t('aiConsent.notPayment')}
                                colors={colors}
                                isExcluded
                            />
                        </View>

                        {/* Purpose */}
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('aiConsent.whyWeShare')}
                        </Text>
                        <Text style={[styles.description, { color: colors.textSecondary || "#6B6B6B" }]}>
                            {t('aiConsent.whyDescription')}
                        </Text>

                        {/* Privacy Policy link */}
                        <TouchableOpacity
                            style={styles.privacyLink}
                            onPress={() => {
                                // Close modal first, then navigate after a short delay
                                onDecline();
                                setTimeout(() => router.push("/privacy"), 350);
                            }}
                        >
                            <Ionicons name="document-text-outline" size={16} color="#007AFF" />
                            <Text style={styles.privacyLinkText}>
                                {t('aiConsent.readPrivacyPolicy')}
                            </Text>
                        </TouchableOpacity>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.acceptButton, { backgroundColor: colors.text }]}
                                onPress={onAccept}
                            >
                                <Text style={[styles.acceptButtonText, { color: colors.background }]}>
                                    {t('aiConsent.acceptButton')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.declineButton, { borderColor: colors.border || "#E8E6E1" }]}
                                onPress={onDecline}
                            >
                                <Text style={[styles.declineButtonText, { color: colors.textSecondary || "#6B6B6B" }]}>
                                    {t('aiConsent.declineButton')}
                                </Text>
                            </TouchableOpacity>

                            <Text style={[styles.footnote, { color: colors.textSecondary || "#6B6B6B" }]}>
                                {t('aiConsent.footnote')}
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function DataItem({
    icon,
    label,
    colors,
    isExcluded = false,
}: {
    icon: string;
    label: string;
    colors: { text: string; textSecondary?: string };
    isExcluded?: boolean;
}) {
    return (
        <View style={styles.dataItem}>
            <Ionicons
                name={icon as any}
                size={18}
                color={isExcluded ? "#999" : colors.text}
            />
            <Text
                style={[
                    styles.dataItemText,
                    { color: isExcluded ? "#999" : colors.textSecondary || "#6B6B6B" },
                    isExcluded && styles.dataItemExcluded,
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: SCREEN_HEIGHT * 0.9,
        minHeight: SCREEN_HEIGHT * 0.5,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    handle: {
        width: 36,
        height: 5,
        borderRadius: 3,
        backgroundColor: "#D1D1D6",
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 6,
    },
    scrollView: {
        flexGrow: 1,
        flexShrink: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 48,
    },
    iconContainer: {
        alignItems: "center",
        marginTop: 16,
        marginBottom: 16,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 20,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },
    dataList: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    dataItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    dataItemText: {
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 10,
        flex: 1,
    },
    dataItemExcluded: {
        textDecorationLine: "line-through",
    },
    privacyLink: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    privacyLinkText: {
        fontSize: 14,
        color: "#007AFF",
        marginLeft: 6,
        fontWeight: "500",
    },
    buttonContainer: {
        gap: 12,
        alignItems: "center",
    },
    acceptButton: {
        width: "100%",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: "700",
    },
    declineButton: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: "center",
    },
    declineButtonText: {
        fontSize: 15,
        fontWeight: "600",
    },
    footnote: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 4,
        lineHeight: 18,
    },
});
