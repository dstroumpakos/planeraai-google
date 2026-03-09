import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/lib/ThemeContext";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────
// Home page popup – prompts user to create first trip
// ─────────────────────────────────────────────
interface FirstTripPopupProps {
  visible: boolean;
  onDismiss: () => void;
}

export function FirstTripPopup({ visible, onDismiss }: FirstTripPopupProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={popupStyles.backdrop}>
        <TouchableOpacity
          style={popupStyles.backdropTouch}
          activeOpacity={1}
          onPress={onDismiss}
        />
        <Animated.View
          style={[
            popupStyles.card,
            {
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={popupStyles.closeBtn} onPress={onDismiss}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>

          <View
            style={[popupStyles.iconCircle, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="airplane" size={36} color="#000" />
          </View>

          <Text style={[popupStyles.title, { color: colors.text }]}>
            {t("firstTripGuide.popupTitle")}
          </Text>
          <Text style={[popupStyles.subtitle, { color: colors.textMuted }]}>
            {t("firstTripGuide.popupSubtitle")}
          </Text>

          <View style={popupStyles.features}>
            {[
              { icon: "sparkles" as const, text: t("firstTripGuide.feature1") },
              { icon: "calendar" as const, text: t("firstTripGuide.feature2") },
              { icon: "wallet" as const, text: t("firstTripGuide.feature3") },
            ].map((f, i) => (
              <View key={i} style={popupStyles.featureRow}>
                <View style={[popupStyles.featureIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name={f.icon} size={16} color={colors.primary} />
                </View>
                <Text style={[popupStyles.featureText, { color: colors.text }]}>
                  {f.text}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[popupStyles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              onDismiss();
              router.push({
                pathname: "/create-trip",
                params: { fromGuide: "true" },
              });
            }}
          >
            <Ionicons name="sparkles" size={18} color="#000" />
            <Text style={popupStyles.ctaText}>
              {t("firstTripGuide.popupCta")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDismiss}>
            <Text style={[popupStyles.skipText, { color: colors.textMuted }]}>
              {t("firstTripGuide.maybeLater")}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const popupStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: SCREEN_WIDTH - 48,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  features: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    width: "100%",
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 8,
  },
});

// ─────────────────────────────────────────────
// Create-trip page guide – step-by-step tooltips
// that highlight each section card
// ─────────────────────────────────────────────

export interface GuideStep {
  key: string;
  title: string;
  description: string;
}

interface TripGuideTooltipProps {
  step: GuideStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

export function TripGuideTooltip({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onSkip,
}: TripGuideTooltipProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(-15);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step.key]);

  const isLast = currentIndex === totalSteps - 1;

  return (
    <Animated.View
      style={[
        tooltipStyles.container,
        {
          backgroundColor: colors.text,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          tooltipStyles.arrowUp,
          { borderBottomColor: colors.text },
        ]}
      />

      <View style={tooltipStyles.header}>
        <View style={[tooltipStyles.stepBadge, { backgroundColor: colors.primary }]}>
          <Text style={tooltipStyles.stepBadgeText}>
            {currentIndex + 1}/{totalSteps}
          </Text>
        </View>
        <TouchableOpacity onPress={onSkip}>
          <Text style={[tooltipStyles.skipText, { color: colors.background, opacity: 0.6 }]}>
            {t("common.skip")}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[tooltipStyles.title, { color: colors.background }]}>
        {step.title}
      </Text>
      <Text style={[tooltipStyles.desc, { color: colors.background, opacity: 0.7 }]}>
        {step.description}
      </Text>

      <TouchableOpacity
        style={[tooltipStyles.nextBtn, { backgroundColor: colors.primary }]}
        onPress={onNext}
      >
        <Text style={tooltipStyles.nextText}>
          {isLast ? t("firstTripGuide.gotIt") : t("common.continue")}
        </Text>
        <Ionicons
          name={isLast ? "checkmark" : "arrow-forward"}
          size={16}
          color="#000"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const tooltipStyles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  arrowUp: {
    position: "absolute",
    top: -10,
    left: 32,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },
  skipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  nextText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
});

export default FirstTripPopup;
