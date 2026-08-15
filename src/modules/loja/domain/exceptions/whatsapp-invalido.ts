import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class WhatsappInvalido extends InvalidDomainError {
  readonly code = "WHATSAPP_INVALIDO";

  constructor(motivo: string) {
    super(`O número de WhatsApp é inválido: ${motivo}.`);
  }
}
