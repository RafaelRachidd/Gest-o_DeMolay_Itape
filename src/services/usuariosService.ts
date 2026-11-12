import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "./firebase";

import type {
  PerfilUsuario,
  PermissoesUsuario,
  Usuario,
  UsuarioCadastrado,
} from "../types/Usuario";


export const permissoesVazias:
  PermissoesUsuario = {
    membros: false,
    financeiro: false,
    mensalidades: false,
    inventario: false,
  };


export function obterPermissoesPerfil(
  perfil: PerfilUsuario,
  personalizadas: PermissoesUsuario =
    permissoesVazias
): PermissoesUsuario {
  switch (perfil) {
    case "admin":
      return {
        membros: true,
        financeiro: true,
        mensalidades: true,
        inventario: true,
      };

    case "secretaria":
      return {
        membros: true,
        financeiro: false,
        mensalidades: false,
        inventario: false,
      };

    case "tesouraria":
      return {
        membros: false,
        financeiro: true,
        mensalidades: true,
        inventario: false,
      };

    case "patrimonio":
      return {
        membros: false,
        financeiro: false,
        mensalidades: false,
        inventario: true,
      };

    case "consulta":
      return {
        membros: false,
        financeiro: false,
        mensalidades: false,
        inventario: false,
      };

    case "personalizado":
      return {
        ...personalizadas,
      };

    default:
      return {
        ...permissoesVazias,
      };
  }
}


export async function listarUsuarios():
  Promise<UsuarioCadastrado[]> {
  const snapshot =
    await getDocs(
      collection(
        db,
        "usuarios"
      )
    );

  const usuarios =
    snapshot.docs.map(
      (documento) => ({
        id:
          documento.id,

        ...(documento.data() as Usuario),
      })
    );

  return usuarios.sort(
    (a, b) =>
      a.nome.localeCompare(
        b.nome,
        "pt-BR"
      )
  );
}


interface CadastrarUsuarioDados {
  uid: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  permissoes:
    PermissoesUsuario;
}


export async function cadastrarUsuario(
  dados:
    CadastrarUsuarioDados
) {
  const uid =
    dados.uid.trim();

  const nome =
    dados.nome.trim();

  const email =
    dados.email
      .trim()
      .toLowerCase();

  if (!uid) {
    throw new Error(
      "UID obrigatório."
    );
  }

  if (!nome) {
    throw new Error(
      "Nome obrigatório."
    );
  }

  if (!email) {
    throw new Error(
      "E-mail obrigatório."
    );
  }

  const permissoes =
    obterPermissoesPerfil(
      dados.perfil,
      dados.permissoes
    );

  await setDoc(
    doc(
      db,
      "usuarios",
      uid
    ),
    {
      nome,
      email,

      perfil:
        dados.perfil,

      ativo:
        dados.ativo,

      permissoes,

      criadoEm:
        serverTimestamp(),

      atualizadoEm:
        serverTimestamp(),
    }
  );
}


interface AtualizarUsuarioDados {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  permissoes:
    PermissoesUsuario;
}


export async function atualizarUsuario(
  uid: string,
  dados:
    AtualizarUsuarioDados
) {
  const permissoes =
    obterPermissoesPerfil(
      dados.perfil,
      dados.permissoes
    );

  await updateDoc(
    doc(
      db,
      "usuarios",
      uid
    ),
    {
      nome:
        dados.nome.trim(),

      email:
        dados.email
          .trim()
          .toLowerCase(),

      perfil:
        dados.perfil,

      ativo:
        dados.ativo,

      permissoes,

      atualizadoEm:
        serverTimestamp(),
    }
  );
}


export async function alterarStatusUsuario(
  uid: string,
  ativo: boolean
) {
  await updateDoc(
    doc(
      db,
      "usuarios",
      uid
    ),
    {
      ativo,

      atualizadoEm:
        serverTimestamp(),
    }
  );
}