import React, { useEffect, useMemo, useRef } from "react";
import { AppState, Platform } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToken } from "@/lib/useAuthenticatedMutation";
import { buildTripWidgetTimeline, pickWidgetTrip, type WeatherLookup } from "@/lib/tripWidgetModel";
import { useTripWeather, forecastForDay, weatherGlyph } from "@/lib/weather";
import { saveTripWidgetTimeline, readTripWidgetProps } from "@/lib/tripWidgetStore";

/**
 * Android counterpart of the iOS hook: writes the trip widget timeline to
 * disk and asks every placed TripWidget to re-render. Between app opens the
 * widget refreshes itself from that file on the OS's update period
 * (`updatePeriodMillis` in app.json) via widgets/widgetTaskHandler.tsx.
 *
 * The native module only exists in a build made after
 * react-native-android-widget was added; the lazy require keeps older
 * binaries and Expo Go from crashing.
 */
let widgetApi: { requestWidgetUpdate: (o: any) => Promise<void> } | null | undefined;
let TripWidgetComponent: any;
function loadWidgetApi() {
    if (Platform.OS !== "android") return null;
    if (widgetApi === undefined) {
        try {
            widgetApi = require("react-native-android-widget");
            TripWidgetComponent = require("@/widgets/TripWidget").TripWidget;
        } catch (e) {
            console.log("[widgets] android widget module unavailable — skipping", String(e).slice(0, 120));
            widgetApi = null;
        }
    }
    return widgetApi;
}

export function useTripWidgets() {
    const { token } = useToken();
    const trips = useQuery(api.trips.list as any, token ? { token } : "skip") as any[] | undefined;
    const trip = useMemo(() => pickWidgetTrip(trips), [trips]);
    const forecast = useTripWeather(trip);
    const lastSync = useRef("");

    useEffect(() => {
        if (Platform.OS !== "android" || trips === undefined) return;
        const w = loadWidgetApi();
        if (!w) return;

        const weatherAt: WeatherLookup = (ts) => {
            const d = forecastForDay(forecast, ts);
            return d ? { text: `${weatherGlyph(d.code).emoji} ${Math.round(d.tMax)}°`, icon: weatherGlyph(d.code).icon } : { text: "", icon: "" };
        };

        const sync = () => {
            try {
                const entries = buildTripWidgetTimeline(trips, weatherAt);
                const sig = `${trip?._id || "-"}:${entries.length}:${entries[0]?.props.mode}:${entries[0]?.props.day}:${entries[0]?.props.nextTitle}:${entries[0]?.props.weather}`;
                if (sig === lastSync.current) return;
                lastSync.current = sig;
                saveTripWidgetTimeline(entries);
                w.requestWidgetUpdate({
                    widgetName: "TripWidget",
                    renderWidget: (info: any) => React.createElement(TripWidgetComponent, { props: readTripWidgetProps(), width: info.width }),
                    widgetNotFound: () => {},
                }).catch(() => {});
            } catch (e) {
                console.warn("[widgets] sync failed", e);
            }
        };

        sync();
        const sub = AppState.addEventListener("change", (s) => { if (s === "active") sync(); });
        return () => sub.remove();
    }, [trips, trip?._id, forecast]);
}
