// Custom entry so the Android widget task handler is registered before the
// router mounts (react-native-android-widget runs it headless for widget
// lifecycle events). Everything else is expo-router's stock entry, inlined
// because package.json `main` can only point at one file.
import "@expo/metro-runtime";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";
import { widgetTaskHandler } from "./widgets/widgetTaskHandler";

registerWidgetTaskHandler(widgetTaskHandler);
renderRootComponent(App);
