import { MatchEvent } from "../../types/rest/output/match";

export class EventScheduler {
  private events: MatchEvent[];
  private start: number;
  private end: number;

  constructor(events: MatchEvent[], is2ndHalf: boolean) {
    if (events.length === 0) {
      throw new Error("Events array cannot be empty.");
    }

    if (is2ndHalf) {
      this.start = 146;
      this.end = 190;
    } else {
      this.start = 1;
      this.end = 45;
    }

   
    this.events = events;
  }

  /**
   * Schedules events evenly across the specified range.
   * @returns Array of events with assigned minutes
   */
  public schedule(): MatchEvent[] {
    const eventsWithMinutes: MatchEvent[] = [];
    const totalEvents = this.events.length;
    const totalRange = this.end - this.start;
    const baseGap = totalRange / totalEvents; // Base gap between events

    let currentMinute = this.start;

    // sort by minute
    this.events.sort((a, b) => parseInt(a.minute) - parseInt(b.minute));
    
    for (let i = 0; i < totalEvents; i++) {
      // Add some randomness to the gap, within ±25% of the base gap
      const randomOffset = (Math.random() - 0.5) * baseGap * 0.5; // ±12.5% of the base gap
      const gap = baseGap + randomOffset;

      // Increment the current minute by the calculated gap
      currentMinute = Math.min(Math.round(currentMinute + gap), this.end);

      // Prevent exceeding the maximum range
      if (currentMinute > this.end) {
        break;
      }

      // Assign the minute to the event
      const event = { ...this.events[i], minute: currentMinute.toString() };
      eventsWithMinutes.push(event);
    }

    // Log skipped events, if any
    if (eventsWithMinutes.length < totalEvents) {
      console.warn(
        `Not all events could be assigned minutes. ${totalEvents - eventsWithMinutes.length} events were skipped.`
      );
    }

    return eventsWithMinutes;
  }
}
