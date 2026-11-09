import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

import type {
  MovimentacaoFinanceira,
  NovaMovimentacaoFinanceira,
} from "../types/MovimentacaoFinanceira";

const movimentacoesRef = collection(
  db,
  "movimentacoesFinanceiras"
);

export async function listarMovimentacoes():
  Promise<MovimentacaoFinanceira[]> {

  const consulta = query(
    movimentacoesRef,
    orderBy("data", "desc")
  );

  const resultado =
    await getDocs(consulta);

  return resultado.docs.map(
    (documento) => ({
      id: documento.id,
      ...documento.data(),
    } as MovimentacaoFinanceira)
  );
}

export async function cadastrarMovimentacao(
  movimentacao: NovaMovimentacaoFinanceira
) {
  await addDoc(
    movimentacoesRef,
    {
      ...movimentacao,
      criadoEm: serverTimestamp(),
    }
  );
}

export async function excluirMovimentacao(
  id: string
) {
  const referencia = doc(
    db,
    "movimentacoesFinanceiras",
    id
  );

  await deleteDoc(referencia);
}

export async function calcularResumoFinanceiro() {
  const resultado =
    await getDocs(
      movimentacoesRef
    );

  let entradas = 0;
  let saidas = 0;

  resultado.docs.forEach(
    (documento) => {
      const dados =
        documento.data();

      const valor =
        Number(
          dados.valor
        ) || 0;

      if (
        dados.tipo ===
        "entrada"
      ) {
        entradas += valor;
      }

      if (
        dados.tipo ===
        "saida"
      ) {
        saidas += valor;
      }
    }
  );

  return {
    entradas,
    saidas,
    saldo:
      entradas - saidas,
  };
}