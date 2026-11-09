export type StatusMembro =
  | "ativo"
  | "inativo"
  | "senior";

export interface Membro {
  id: string;

  nomeCompleto: string;
  email: string;
  telefone: string;

  dataNascimento: string;
  dataIngresso: string;

  grau: string;
  oficio: string;

  status: StatusMembro;
}

export type NovoMembro =
  Omit<Membro, "id">;