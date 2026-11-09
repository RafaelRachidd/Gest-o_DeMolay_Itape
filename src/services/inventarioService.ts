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

import {
  db,
} from "./firebase";

import type {
  ItemInventario,
  NovoItemInventario,
} from "../types/ItemInventario";

const inventarioRef =
  collection(
    db,
    "inventario"
  );

export async function listarItensInventario():
  Promise<ItemInventario[]> {

  const consulta =
    query(
      inventarioRef,
      orderBy(
        "nome"
      )
    );

  const resultado =
    await getDocs(
      consulta
    );

  return resultado.docs.map(
    (documento) => ({
      id: documento.id,
      ...documento.data(),
    } as ItemInventario)
  );
}

export async function cadastrarItemInventario(
  item: NovoItemInventario
) {
  await addDoc(
    inventarioRef,
    {
      ...item,

      criadoEm:
        serverTimestamp(),
    }
  );
}

export async function editarItemInventario(
  id: string,
  item: NovoItemInventario
) {
  const referencia =
    doc(
      db,
      "inventario",
      id
    );

  await updateDoc(
    referencia,
    {
      ...item,

      atualizadoEm:
        serverTimestamp(),
    }
  );
}

export async function excluirItemInventario(
  id: string
) {
  const referencia =
    doc(
      db,
      "inventario",
      id
    );

  await deleteDoc(
    referencia
  );
}

export async function contarUnidadesInventario():
  Promise<number> {

  const resultado =
    await getDocs(
      inventarioRef
    );

  let total = 0;

  resultado.docs.forEach(
    (documento) => {
      const dados =
        documento.data();

      if (
        dados.estado !==
        "baixado"
      ) {
        total +=
          Number(
            dados.quantidade
          ) || 0;
      }
    }
  );

  return total;
}