export type TipoMovimentacao =
  | "entrada"
  | "saida";

export interface MovimentacaoFinanceira {
  id: string;
  tipo: TipoMovimentacao;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  responsavel: string;
}

export type NovaMovimentacaoFinanceira =
  Omit<MovimentacaoFinanceira, "id">;