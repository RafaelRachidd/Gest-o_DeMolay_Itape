import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

import type {
  Mensalidade,
  NovaMensalidade,
  StatusMensalidade,
} from "../types/Mensalidade";

const mensalidadesRef =
  collection(db, "mensalidades");

function dataLocalHoje() {
  const hoje = new Date();

  const ano =
    hoje.getFullYear();

  const mes =
    String(
      hoje.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      hoje.getDate()
    ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export async function listarMensalidades():
  Promise<Mensalidade[]> {

  const consulta = query(
    mensalidadesRef,
    orderBy(
      "vencimento",
      "desc"
    )
  );

  const resultado =
    await getDocs(consulta);

  return resultado.docs.map(
    (documento) => ({
      id: documento.id,
      ...documento.data(),
    } as Mensalidade)
  );
}

export async function cadastrarMensalidade(
  mensalidade: NovaMensalidade
) {
  await addDoc(
    mensalidadesRef,
    {
      ...mensalidade,
      criadoEm:
        serverTimestamp(),
    }
  );
}

export async function alterarStatusMensalidade(
  id: string,
  status: StatusMensalidade
) {
  const referencia = doc(
    db,
    "mensalidades",
    id
  );

  await updateDoc(
    referencia,
    {
      status,

      dataPagamento:
        status === "pago"
          ? dataLocalHoje()
          : null,

      atualizadoEm:
        serverTimestamp(),
    }
  );
}

export async function excluirMensalidade(
  id: string
) {
  const referencia = doc(
    db,
    "mensalidades",
    id
  );

  await deleteDoc(
    referencia
  );
}

export async function contarMembrosInadimplentes():
  Promise<number> {

  const resultado =
    await getDocs(
      mensalidadesRef
    );

  const hoje =
    dataLocalHoje();

  const membros =
    new Set<string>();

  resultado.docs.forEach(
    (documento) => {
      const dados =
        documento.data();

      if (
        dados.status ===
          "pendente" &&
        dados.vencimento <
          hoje
      ) {
        membros.add(
          dados.membroId
        );
      }
    }
  );

  return membros.size;
}