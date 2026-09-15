// Custom entry so the Android widget task handler is registered before the
// router mounts (react-native-android-widget runs it headless for widget
// lifecycle events). Everything else is expo-router's stock entry, inlined
// because package.json `main` can only point at one file.
import "@expo/metro-runtime";
import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";

// Lazy + guarded: the widget module is a TurboModule that throws at import
// when the native side is missing (an OTA landing on a binary built before
// react-native-android-widget was added, or Expo Go). In that case the app
// must still boot — the widget simply stays inert until the next native build.
try {
    const { registerWidgetTaskHandler } = require("react-native-android-widget");
    const { widgetTaskHandler } = require("./widgets/widgetTaskHandler");
    registerWidgetTaskHandler(widgetTaskHandler);
} catch (e) {
    console.log("[widgets] android widget module unavailable in this binary — skipping", String(e).slice(0, 120));
}

renderRootComponent(App);
