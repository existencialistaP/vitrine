import { ConflictError } from "@/kernel/errors/domain-error";

export class EmailJaCadastrado extends ConflictError {
  readonly code = "EMAIL_JA_CADASTRADO";

  constructor(email: string) {
    super(`O e-mail ${email} já está cadastrado.`);
  }
}
