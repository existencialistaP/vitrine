import type { DomainEvent } from "@/kernel/ddd/domain-event";
import type { EventBus } from "@/kernel/events/event-bus";

/** Fake do {@link EventBus} que acumula eventos publicados para asserção. */
export class FakeEventBus implements EventBus {
  readonly publicados: DomainEvent[] = [];

  async publish(events: readonly DomainEvent[]): Promise<void> {
    this.publicados.push(...events);
  }
}
