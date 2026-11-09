export type StatusMensalidade =
  | "pendente"
  | "pago";

export interface Mensalidade {
  id: string;

  membroId: string;
  membroNome: string;

  referencia: string;

  valor: number;

  vencimento: string;

  status: StatusMensalidade;

  dataPagamento: string | null;
}

export type NovaMensalidade =
  Omit<Mensalidade, "id">;