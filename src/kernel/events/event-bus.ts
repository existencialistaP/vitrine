import type { DomainEvent } from "@/kernel/ddd/domain-event";

/**
 * Porta de publicação de eventos de domínio (equivalent ao
 * {@code EventsPublisher} com RabbitMQ do viagem-service). A implementação
 * concreta fica na infraestrutura.
 */
export interface EventBus {
  publish(events: readonly DomainEvent[]): Promise<void> | void;
}
