import type { DomainEvent } from "@/kernel/ddd/domain-event";
import type { EventBus } from "@/kernel/events/event-bus";

/**
 * Event bus in-process (equivalent ao {@code EventsPublisher} do viagem-service,
 * porém sem broker). Despacha os eventos para os handlers registrados após a
 * persistência do agregado.
 */
export class InMemoryEventBus implements EventBus {
  private readonly handlers: Array<(event: DomainEvent) => Promise<void> | void> = [];

  subscribe(handler: (event: DomainEvent) => Promise<void> | void): void {
    this.handlers.push(handler);
  }

  async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      for (const handler of this.handlers) {
        await handler(event);
      }
    }
  }
}
