import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

import type {
  Membro,
  NovoMembro,
} from "../types/Membro";

const membrosRef =
  collection(db, "membros");

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