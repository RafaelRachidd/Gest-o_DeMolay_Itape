import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  db,
} from "./firebase";

export interface AtividadeRecente {
  id: string;

  modulo:
    | "membros"
    | "financeiro"
    | "mensalidades"
    | "inventario";

  titulo: string;
  descricao: string;
  data: Date;
}

function converterData(
  valor: unknown
): Date | null {
  if (
    valor &&
    typeof valor === "object" &&
    "toDate" in valor
  ) {
    const timestamp =
      valor as {
        toDate: () => Date;
      };

    return timestamp.toDate();
  }

  return null;
}

function formatarMoeda(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor);
}

function formatarReferencia(
  referencia: string
) {
  const [
    ano,
    mes,
  ] =
    referencia.split("-");

  if (
    !ano ||
    !mes
  ) {
    return referencia;
  }

  return `${mes}/${ano}`;
}

export async function listarAtividadesRecentes(
  limite = 6
): Promise<AtividadeRecente[]> {
  const [
    membros,
    movimentacoes,
    mensalidades,
    inventario,
  ] =
    await Promise.all([
      getDocs(
        collection(
          db,
          "membros"
        )
      ),

      getDocs(
        collection(
          db,
          "movimentacoesFinanceiras"
        )
      ),

      getDocs(
        collection(
          db,
          "mensalidades"
        )
      ),

      getDocs(
        collection(
          db,
          "inventario"
        )
      ),
    ]);

  const atividades:
    AtividadeRecente[] = [];

  membros.docs.forEach(
    (documento) => {
      const dados =
        documento.data();

      const atualizadoEm =
        converterData(
          dados.atualizadoEm
        );

      const criadoEm =
        converterData(
          dados.criadoEm
        );

      const data =
        atualizadoEm ||
        criadoEm;

      if (!data) {
        return;
      }

      atividades.push({
        id:
          `membro-${documento.id}`,

        modulo:
          "membros",

        titulo:
          atualizadoEm
            ? "Membro atualizado"
            : "Novo membro cadastrado",

        descricao:
          dados.nomeCompleto ||
          "Membro",

        data,
      });
    }
  );

  movimentacoes.docs.forEach(
    (documento) => {
      const dados =
        documento.data();

      const data =
        converterData(
          dados.criadoEm
        );

      if (!data) {
        return;
      }

      atividades.push({
        id:
          `financeiro-${documento.id}`,

        modulo:
          "financeiro",

        titulo:
          dados.tipo ===
          "saida"
            ? "Saída registrada"
            : "Entrada registrada",

        descricao:
          `${
            dados.descricao ||
            "Movimentação"
          } • ${formatarMoeda(
            Number(
              dados.valor
            ) || 0
          )}`,

        data,
      });
    }
  );

  mensalidades.docs.forEach(
    (documento) => {
      const dados =
        documento.data();

      const atualizadoEm =
        converterData(
          dados.atualizadoEm
        );

      const criadoEm =
        converterData(
          dados.criadoEm
        );

      const data =
        atualizadoEm ||
        criadoEm;

      if (!data) {
        return;
      }

      let titulo =
        "Mensalidade criada";

      if (
        atualizadoEm &&
        dados.status ===
          "pago"
      ) {
        titulo =
          "Pagamento registrado";
      } else if (
        atualizadoEm
      ) {
        titulo =
          "Mensalidade atualizada";
      }

      atividades.push({
        id:
          `mensalidade-${documento.id}`,

        modulo:
          "mensalidades",

        titulo,

        descricao:
          `${
            dados.membroNome ||
            "Membro"
          } • ${formatarReferencia(
            dados.referencia ||
            ""
          )}`,

        data,
      });
    }
  );

  inventario.docs.forEach(
    (documento) => {
      const dados =
        documento.data();

      const atualizadoEm =
        converterData(
          dados.atualizadoEm
        );

      const criadoEm =
        converterData(
          dados.criadoEm
        );

      const data =
        atualizadoEm ||
        criadoEm;

      if (!data) {
        return;
      }

      atividades.push({
        id:
          `inventario-${documento.id}`,

        modulo:
          "inventario",

        titulo:
          atualizadoEm
            ? "Inventário atualizado"
            : "Item cadastrado",

        descricao:
          dados.nome ||
          "Item do inventário",

        data,
      });
    }
  );

  return atividades
    .sort(
      (a, b) =>
        b.data.getTime() -
        a.data.getTime()
    )
    .slice(
      0,
      limite
    );
}