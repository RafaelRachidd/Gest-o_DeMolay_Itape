export type TipoMovimentacao =
  | "entrada"
  | "saida";

export type CaixaFinanceiro =
  | "tesouraria"
  | "hospitalaria";

export interface MovimentacaoFinanceira {
  id: string;

  caixa: CaixaFinanceiro;

  tipo: TipoMovimentacao;

  descricao: string;

  categoria: string;

  valor: number;

  data: string;

  responsavel: string;
}

export type NovaMovimentacaoFinanceira =
  Omit<
    MovimentacaoFinanceira,
    "id"
  >;