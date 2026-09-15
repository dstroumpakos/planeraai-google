import { File, Paths } from "expo-file-system";
import { IDLE_PROPS, type TripWidgetProps, type TripWidgetTimelineEntry } from "@/lib/tripWidgetModel";

/**
 * The widget timeline persisted for the headless widget task handler.
 *
 * Android widgets re-render from a headless JS task (no auth, no Convex
 * client), so the app writes the next weeks of props to disk whenever it has
 * fresh trips, and the handler just picks the entry for "now". Same shape as
 * the iOS timeline, so the two platforms always agree.
 */
const FILE_NAME = "trip-widget-timeline.json";

interface Stored { savedAt: number; entries: { at: number; props: TripWidgetProps }[] }

function file(): File {
    return new File(Paths.document, FILE_NAME);
}

export function saveTripWidgetTimeline(entries: TripWidgetTimelineEntry[]): void {
    try {
        const stored: Stored = {
            savedAt: Date.now(),
            entries: entries.map((e) => ({ at: e.date.getTime(), props: e.props })),
        };
        file().write(JSON.stringify(stored));
    } catch (e) {
        console.warn("[widget] failed to persist timeline", e);
    }
}

/** Props the widget should show at `now`: the latest entry at or before now. */
export function readTripWidgetProps(now = Date.now()): TripWidgetProps {
    try {
        const f = file();
        if (!f.exists) return IDLE_PROPS;
        const stored: Stored = JSON.parse(f.textSync());
        let current: TripWidgetProps = IDLE_PROPS;
        for (const e of stored.entries) {
            if (e.at <= now) current = e.props;
            else break;
        }
        return current;
    } catch (e) {
        console.warn("[widget] failed to read timeline", e);
        return IDLE_PROPS;
    }
}
