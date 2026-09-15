import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { TripWidgetProps } from "@/lib/tripWidgetModel";

/**
 * Android home-screen widget (react-native-android-widget). Same data model
 * as the iOS widget in the iOS repo (lib/tripWidgetModel.ts): "Lisbon · in 12
 * days" before a trip, "Day 3 of 5 · next stop" during it.
 *
 * Rendered by widgets/widgetTaskHandler.tsx from the timeline the app writes
 * to disk (lib/tripWidgetStore.ts), so it keeps counting with the app closed.
 */
const INK = "#1A1A1A";
const MUTED = "#6B6B6B";
const ACCENT = "#FFE500";
const BG = "#FAF9F6";

export function TripWidget({ props, width }: { props: TripWidgetProps; width: number }) {
    const small = width < 200;
    const url = props.tripId ? `planera://trip/${props.tripId}` : "planera://";

    // One tappable column; the OS opens `uri` (expo-router handles the scheme).
    const shell = (children: React.ReactNode, uri: string) => (
        <FlexWidget
            clickAction="OPEN_URI"
            clickActionData={{ uri }}
            style={{
                height: "match_parent",
                width: "match_parent",
                backgroundColor: BG,
                borderRadius: 20,
                padding: 14,
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            {children}
        </FlexWidget>
    );

    if (props.mode === "idle" || !props.destination) {
        return shell(
            <FlexWidget style={{ flexDirection: "column", justifyContent: "space-between", height: "match_parent", width: "match_parent" }}>
                <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextWidget text="✈️" style={{ fontSize: 13 }} />
                    <TextWidget text="  Planera" style={{ fontSize: 13, fontWeight: "600", color: INK }} />
                </FlexWidget>
                <FlexWidget style={{ flexDirection: "column" }}>
                    <TextWidget text="Where to next?" maxLines={2} style={{ fontSize: small ? 16 : 18, fontWeight: "bold", color: INK }} />
                    <TextWidget text="Plan a trip in 60 seconds" maxLines={1} style={{ fontSize: 12, color: MUTED }} />
                </FlexWidget>
            </FlexWidget>,
            "planera://create-trip",
        );
    }

    if (props.mode === "done") {
        return shell(
            <FlexWidget style={{ flexDirection: "column", justifyContent: "space-between", height: "match_parent", width: "match_parent" }}>
                <TextWidget text="Recap ready" style={{ fontSize: 12, fontWeight: "600", color: MUTED }} />
                <FlexWidget style={{ flexDirection: "column" }}>
                    <TextWidget text={props.destination} maxLines={1} truncate="END" style={{ fontSize: small ? 18 : 22, fontWeight: "bold", color: INK }} />
                    <TextWidget text="See your trip recap" maxLines={1} style={{ fontSize: 12, color: MUTED }} />
                </FlexWidget>
            </FlexWidget>,
            `planera://trip-recap?tripId=${props.tripId}`,
        );
    }

    const live = props.mode === "live";
    const headline = live ? `Day ${props.day} of ${props.total}` : props.daysUntil === 1 ? "Tomorrow" : `In ${props.daysUntil} days`;
    const detail = props.nextTitle
        ? `${props.nextTime ? props.nextTime + " · " : ""}${props.nextTitle}`
        : live ? "A free day" : props.dateRange;

    return shell(
        <FlexWidget style={{ flexDirection: "column", justifyContent: "space-between", height: "match_parent", width: "match_parent" }}>
            <FlexWidget style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "match_parent" }}>
                <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
                    <FlexWidget style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT, marginRight: 6 }} />
                    <TextWidget text={headline} maxLines={1} style={{ fontSize: 12, fontWeight: "600", color: MUTED }} />
                </FlexWidget>
                {props.weather ? <TextWidget text={props.weather} style={{ fontSize: 12, fontWeight: "600", color: MUTED }} /> : null}
            </FlexWidget>
            <FlexWidget style={{ flexDirection: "column" }}>
                <TextWidget text={props.destination} maxLines={1} truncate="END" style={{ fontSize: small ? 20 : 26, fontWeight: "bold", color: INK }} />
                <TextWidget text={detail} maxLines={small ? 1 : 2} truncate="END" style={{ fontSize: small ? 12 : 13, color: MUTED }} />
                {!small && !live ? <TextWidget text={props.dateRange} maxLines={1} style={{ fontSize: 11, color: MUTED }} /> : null}
                {!small && live && props.stops > 0 ? <TextWidget text={`${props.stops} stops today`} maxLines={1} style={{ fontSize: 11, color: MUTED }} /> : null}
            </FlexWidget>
        </FlexWidget>,
        url,
    );
}
