import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { TripWidget } from "./TripWidget";
import { readTripWidgetProps } from "@/lib/tripWidgetStore";

/**
 * Headless entry point the OS calls for widget lifecycle events (add,
 * periodic update, resize). It has no session and no Convex client — it
 * renders from the timeline the app persisted (lib/tripWidgetStore.ts).
 * Registered from index.ts before the router mounts.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const { widgetInfo, widgetAction, renderWidget } = props;
    if (widgetInfo.widgetName !== "TripWidget") return;

    switch (widgetAction) {
        case "WIDGET_ADDED":
        case "WIDGET_UPDATE":
        case "WIDGET_RESIZED":
            renderWidget(<TripWidget props={readTripWidgetProps()} width={widgetInfo.width} />);
            break;
        case "WIDGET_CLICK":
            // Clicks are OPEN_URI deep links handled by the OS; nothing to do here.
            break;
        default:
            break;
    }
}
