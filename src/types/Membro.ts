export type StatusMembro =
  | "ativo"
  | "inativo"
  | "senior";

export type SituacaoFinanceira =
  | "em_dia"
  | "pendente";

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

  situacaoFinanceira: SituacaoFinanceira;
}

export type NovoMembro =
  Omit<Membro, "id">;