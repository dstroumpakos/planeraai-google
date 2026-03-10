import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/lib/ThemeContext";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 8);
    
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.inactive,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopWidth: 0,
                    paddingTop: 8,
                    paddingBottom: bottomPadding,
                    height: 56 + bottomPadding,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    position: "absolute",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                    marginTop: 4,
                    color: colors.textMuted,
                },
                tabBarItemStyle: {
                    paddingTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("tabs.home"),
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary }]}>
                            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? colors.tabBar : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="trips"
                options={{
                    title: t("tabs.trips"),
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary }]}>
                            <Ionicons name={focused ? "map" : "map-outline"} size={24} color={focused ? colors.tabBar : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: "",
                    tabBarIcon: () => (
                        <View style={[styles.createButton, { backgroundColor: colors.primary }]}>
                            <Ionicons name="add" size={28} color={colors.text} />
                        </View>
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        router.push("/create-trip");
                    },
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    title: t("tabs.atlas"),
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary }]}>
                            <Ionicons name={focused ? "globe" : "globe-outline"} size={24} color={focused ? colors.tabBar : color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t("tabs.profile"),
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: colors.primary }]}>
                            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? colors.tabBar : color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    createButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginTop: -20,
        boxShadow: "0px 4px 8px rgba(255, 229, 0, 0.4)",
        elevation: 6,
    },
});
