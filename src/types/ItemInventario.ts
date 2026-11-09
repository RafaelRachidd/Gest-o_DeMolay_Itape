export type EstadoItem =
  | "bom"
  | "regular"
  | "manutencao"
  | "baixado";

export interface ItemInventario {
  id: string;

  nome: string;

  categoria: string;

  quantidade: number;

  estado: EstadoItem;

  localizacao: string;

  numeroPatrimonio: string;

  observacoes: string;
}

export type NovoItemInventario =
  Omit<ItemInventario, "id">;