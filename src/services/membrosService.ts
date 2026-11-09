import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

import type {
  Membro,
  NovoMembro,
} from "../types/Membro";

const membrosRef = collection(
  db,
  "membros"
);

export async function listarMembros():
  Promise<Membro[]> {
  const consulta = query(
    membrosRef,
    orderBy("nomeCompleto")
  );

  const resultado =
    await getDocs(consulta);

  return resultado.docs.map(
    (documento) => ({
      id: documento.id,
      ...documento.data(),
    } as Membro)
  );
}

export async function cadastrarMembro(
  membro: NovoMembro
) {
  return await addDoc(
    membrosRef,
    {
      ...membro,
      criadoEm: serverTimestamp(),
    }
  );
}

export async function editarMembro(
  id: string,
  membro: NovoMembro
) {
  const membroRef = doc(
    db,
    "membros",
    id
  );

  await updateDoc(
    membroRef,
    {
      ...membro,
      atualizadoEm: serverTimestamp(),
    }
  );
}

export async function excluirMembro(
  id: string
) {
  const membroRef = doc(
    db,
    "membros",
    id
  );

  await deleteDoc(
    membroRef
  );
}

export async function contarMembrosAtivos():
  Promise<number> {
  const consulta = query(
    membrosRef,
    where(
      "status",
      "==",
      "ativo"
    )
  );

  const resultado =
    await getCountFromServer(
      consulta
    );

  return resultado.data().count;
}

export async function contarInadimplentes():
  Promise<number> {
  const consulta = query(
    membrosRef,
    where(
      "situacaoFinanceira",
      "==",
      "pendente"
    )
  );

  const resultado =
    await getCountFromServer(
      consulta
    );

  return resultado.data().count;
}