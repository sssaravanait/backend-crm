import { z } from "zod";

const API_TIME_ZONE = "Asia/Kolkata";

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: API_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h11",
});

/**
 * Single source of truth for how dates leave the API.
 * To change the format, edit this file only. The response schemas
 * import `apiDateSchema` from here, so validation follows automatically.
 */
export const formatApiDate = (date: Date): string => {
    // toISOString() throws a RangeError on an invalid Date, so guard against it.
    // Otherwise one bad value turns the whole response into a 500.
    if (Number.isNaN(date.getTime())) {
        throw new RangeError("Cannot format an invalid Date");
    }
    // ISO 8601 in UTC, for example "2026-01-15T09:30:00.000Z"
    return dateTimeFormatter.format(date).replace(",", "");
};

// The validator changes with the format. A plain datetime() check would now reject the output.
export const apiDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);