export type PerfilUsuario =
  | "admin"
  | "secretaria"
  | "tesouraria"
  | "patrimonio"
  | "consulta"
  | "personalizado";

export interface PermissoesUsuario {
  membros: boolean;
  financeiro: boolean;
  mensalidades: boolean;
  inventario: boolean;
}

export interface Usuario {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;

  /*
   * Usuários antigos ainda não possuem este campo.
   * Por isso ele é opcional durante a migração.
   */
  permissoes?: PermissoesUsuario;
}

export interface UsuarioCadastrado
  extends Usuario {
  id: string;
}