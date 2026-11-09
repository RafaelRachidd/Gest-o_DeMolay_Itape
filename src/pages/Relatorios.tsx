import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  listarMembros,
} from "../services/membrosService";

import {
  listarMovimentacoes,
} from "../services/financeiroService";

import {
  listarMensalidades,
} from "../services/mensalidadesService";

import {
  listarItensInventario,
} from "../services/inventarioService";

import type {
  Membro,
} from "../types/Membro";

import type {
  MovimentacaoFinanceira,
} from "../types/MovimentacaoFinanceira";

import type {
  Mensalidade,
} from "../types/Mensalidade";

import type {
  ItemInventario,
} from "../types/ItemInventario";

import type {
  Usuario,
} from "../types/Usuario";

import "./Relatorios.css";

interface RelatoriosProps {
  usuario: Usuario;
}

function hojeLocal() {
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

function calcularFinanceiro(
  movimentacoes:
    MovimentacaoFinanceira[]
) {
  let entradas = 0;
  let saidas = 0;

  let saldoTesouraria = 0;
  let saldoHospitalaria = 0;

  movimentacoes.forEach(
    (movimentacao) => {
      const valor =
        Number(
          movimentacao.valor
        ) || 0;

      if (
        movimentacao.tipo ===
        "entrada"
      ) {
        entradas += valor;

        if (
          movimentacao.caixa ===
          "tesouraria"
        ) {
          saldoTesouraria +=
            valor;
        }

        if (
          movimentacao.caixa ===
          "hospitalaria"
        ) {
          saldoHospitalaria +=
            valor;
        }
      }

      if (
        movimentacao.tipo ===
        "saida"
      ) {
        saidas += valor;

        if (
          movimentacao.caixa ===
          "tesouraria"
        ) {
          saldoTesouraria -=
            valor;
        }

        if (
          movimentacao.caixa ===
          "hospitalaria"
        ) {
          saldoHospitalaria -=
            valor;
        }
      }
    }
  );

  return {
    entradas,
    saidas,
    saldoTesouraria,
    saldoHospitalaria,
    saldo:
      saldoTesouraria +
      saldoHospitalaria,
  };
}

function Relatorios({
  usuario,
}: RelatoriosProps) {
  const [
    membros,
    setMembros,
  ] =
    useState<Membro[]>([]);

  const [
    movimentacoes,
    setMovimentacoes,
  ] =
    useState<
      MovimentacaoFinanceira[]
    >([]);

  const [
    mensalidades,
    setMensalidades,
  ] =
    useState<Mensalidade[]>([]);

  const [
    itens,
    setItens,
  ] =
    useState<
      ItemInventario[]
    >([]);

  const [
    dataInicio,
    setDataInicio,
  ] =
    useState("");

  const [
    dataFim,
    setDataFim,
  ] =
    useState("");

  const [
    carregando,
    setCarregando,
  ] =
    useState(true);

  const [
    erro,
    setErro,
  ] =
    useState("");

  const hoje =
    hojeLocal();

  async function carregarDados() {
    try {
      setErro("");

      const [
        listaMembros,
        listaMovimentacoes,
        listaMensalidades,
        listaInventario,
      ] =
        await Promise.all([
          listarMembros(),

          listarMovimentacoes(),

          listarMensalidades(),

          listarItensInventario(),
        ]);

      setMembros(
        listaMembros
      );

      setMovimentacoes(
        listaMovimentacoes
      );

      setMensalidades(
        listaMensalidades
      );

      setItens(
        listaInventario
      );
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível carregar os dados dos relatórios."
      );
    } finally {
      setCarregando(
        false
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const movimentacoesPeriodo =
    useMemo(() => {
      return movimentacoes.filter(
        (movimentacao) => {
          const depoisInicio =
            !dataInicio ||
            movimentacao.data >=
              dataInicio;

          const antesFim =
            !dataFim ||
            movimentacao.data <=
              dataFim;

          return (
            depoisInicio &&
            antesFim
          );
        }
      );
    }, [
      movimentacoes,
      dataInicio,
      dataFim,
    ]);

  const financeiroTotal =
    useMemo(
      () =>
        calcularFinanceiro(
          movimentacoes
        ),
      [movimentacoes]
    );

  const financeiroPeriodo =
    useMemo(
      () =>
        calcularFinanceiro(
          movimentacoesPeriodo
        ),
      [movimentacoesPeriodo]
    );

  const membrosAtivos =
    membros.filter(
      (membro) =>
        membro.status ===
        "ativo"
    ).length;

  const membrosInativos =
    membros.filter(
      (membro) =>
        membro.status ===
        "inativo"
    ).length;

  const membrosSeniores =
    membros.filter(
      (membro) =>
        membro.status ===
        "senior"
    ).length;

  const mensalidadesAtrasadas =
    mensalidades.filter(
      (mensalidade) =>
        mensalidade.status ===
          "pendente" &&
        mensalidade.vencimento <
          hoje
    );

  const mensalidadesPendentes =
    mensalidades.filter(
      (mensalidade) =>
        mensalidade.status ===
        "pendente"
    );

  const mensalidadesPagas =
    mensalidades.filter(
      (mensalidade) =>
        mensalidade.status ===
        "pago"
    );

  const valorAtrasado =
    mensalidadesAtrasadas.reduce(
      (
        total,
        mensalidade
      ) =>
        total +
        Number(
          mensalidade.valor
        ),
      0
    );

  const membrosInadimplentes =
    new Set(
      mensalidadesAtrasadas.map(
        (mensalidade) =>
          mensalidade.membroId
      )
    ).size;

  const unidadesInventario =
    itens.reduce(
      (
        total,
        item
      ) =>
        item.estado !==
        "baixado"
          ? total +
            Number(
              item.quantidade
            )
          : total,
      0
    );

  const itensManutencao =
    itens.filter(
      (item) =>
        item.estado ===
        "manutencao"
    );

  const itensBaixados =
    itens.filter(
      (item) =>
        item.estado ===
        "baixado"
    ).length;

  function formatarMoeda(
    valor: number
  ) {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        style:
          "currency",

        currency:
          "BRL",
      }
    ).format(valor);
  }

  function formatarData(
    data: string
  ) {
    if (!data) {
      return "—";
    }

    const [
      ano,
      mes,
      dia,
    ] =
      data.split("-");

    if (
      !ano ||
      !mes ||
      !dia
    ) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  }

  function formatarReferencia(
    referencia: string
  ) {
    const [
      ano,
      mes,
    ] =
      referencia.split(
        "-"
      );

    if (
      !ano ||
      !mes
    ) {
      return referencia;
    }

    return `${mes}/${ano}`;
  }

  function limparPeriodo() {
    setDataInicio("");
    setDataFim("");
  }

  function imprimir() {
    window.print();
  }

  if (carregando) {
    return (
      <main
        className="relatorios-page"
      >
        <div
          className="relatorios-carregando"
        >
          Carregando relatórios...
        </div>
      </main>
    );
  }

  return (
    <main
      className="relatorios-page"
    >
      <header
        className="relatorios-header"
      >
        <div>
          <p
            className="relatorios-eyebrow"
          >
            CAPÍTULO DIGITAL
          </p>

          <h1>
            Relatórios
          </h1>

          <p
            className="relatorios-subtitle"
          >
            Visão consolidada dos
            dados do capítulo.
          </p>
        </div>

        <div
          className="relatorios-header-actions relatorios-nao-imprimir"
        >
          <button
            type="button"
            className="relatorios-imprimir"
            onClick={
              imprimir
            }
          >
            Imprimir / Salvar PDF
          </button>

          <Link
            to="/"
            className="relatorios-voltar"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>
      </header>

      <section
        className="relatorios-identificacao"
      >
        <div>
          <strong>
            Capítulo DeMolay de
            Itapetininga
          </strong>

          <span>
            Relatório gerado em{" "}
            {new Date()
              .toLocaleDateString(
                "pt-BR"
              )}
          </span>
        </div>

        <div>
          <span>
            Usuário responsável
          </span>

          <strong>
            {usuario.nome}
          </strong>
        </div>
      </section>

      {erro && (
        <div
          className="relatorios-erro"
        >
          {erro}
        </div>
      )}

      <section
        className="relatorios-resumo"
      >
        <article>
          <span>
            Membros cadastrados
          </span>

          <strong>
            {membros.length}
          </strong>

          <small>
            {membrosAtivos} ativos
          </small>
        </article>

        <article>
          <span>
            Inadimplentes
          </span>

          <strong
            className="relatorio-vermelho"
          >
            {
              membrosInadimplentes
            }
          </strong>

          <small>
            {
              mensalidadesAtrasadas.length
            }{" "}
            mensalidade(s) atrasada(s)
          </small>
        </article>

        <article>
          <span>
            Saldo geral
          </span>

          <strong
            className={
              financeiroTotal.saldo <
              0
                ? "relatorio-vermelho"
                : ""
            }
          >
            {formatarMoeda(
              financeiroTotal.saldo
            )}
          </strong>

          <small>
            Tesouraria + Hospitalaria
          </small>
        </article>

        <article>
          <span>
            Inventário
          </span>

          <strong>
            {unidadesInventario}
          </strong>

          <small>
            unidades disponíveis
          </small>
        </article>
      </section>

      <section
        className="relatorios-card"
      >
        <div
          className="relatorios-card-header"
        >
          <div>
            <p
              className="relatorios-eyebrow"
            >
              FINANCEIRO
            </p>

            <h2>
              Relatório financeiro
            </h2>
          </div>
        </div>

        <div
          className="relatorios-periodo relatorios-nao-imprimir"
        >
          <label>
            Data inicial

            <input
              type="date"
              value={
                dataInicio
              }
              onChange={(
                event
              ) =>
                setDataInicio(
                  event
                    .target
                    .value
                )
              }
            />
          </label>

          <label>
            Data final

            <input
              type="date"
              value={
                dataFim
              }
              onChange={(
                event
              ) =>
                setDataFim(
                  event
                    .target
                    .value
                )
              }
            />
          </label>

          <button
            type="button"
            onClick={
              limparPeriodo
            }
          >
            Limpar período
          </button>
        </div>

        <div
          className="relatorios-periodo-info"
        >
          {dataInicio ||
          dataFim ? (
            <span>
              Período:{" "}
              {dataInicio
                ? formatarData(
                    dataInicio
                  )
                : "início"}{" "}
              até{" "}
              {dataFim
                ? formatarData(
                    dataFim
                  )
                : "hoje"}
            </span>
          ) : (
            <span>
              Período: todas as
              movimentações
            </span>
          )}
        </div>

        <div
          className="relatorios-mini-cards"
        >
          <article>
            <span>
              Entradas
            </span>

            <strong
              className="relatorio-verde"
            >
              {formatarMoeda(
                financeiroPeriodo
                  .entradas
              )}
            </strong>
          </article>

          <article>
            <span>
              Saídas
            </span>

            <strong
              className="relatorio-vermelho"
            >
              {formatarMoeda(
                financeiroPeriodo
                  .saidas
              )}
            </strong>
          </article>

          <article>
            <span>
              Tesouraria
            </span>

            <strong>
              {formatarMoeda(
                financeiroPeriodo
                  .saldoTesouraria
              )}
            </strong>
          </article>

          <article>
            <span>
              Hospitalaria
            </span>

            <strong>
              {formatarMoeda(
                financeiroPeriodo
                  .saldoHospitalaria
              )}
            </strong>
          </article>

          <article>
            <span>
              Saldo do período
            </span>

            <strong
              className={
                financeiroPeriodo
                  .saldo < 0
                  ? "relatorio-vermelho"
                  : ""
              }
            >
              {formatarMoeda(
                financeiroPeriodo
                  .saldo
              )}
            </strong>
          </article>
        </div>

        <h3
          className="relatorios-subtitulo-tabela"
        >
          Movimentações do período
        </h3>

        {movimentacoesPeriodo
          .length === 0 ? (
          <div
            className="relatorios-vazio"
          >
            Nenhuma movimentação
            encontrada no período.
          </div>
        ) : (
          <div
            className="relatorios-tabela-wrapper"
          >
            <table
              className="relatorios-tabela"
            >
              <thead>
                <tr>
                  <th>
                    Data
                  </th>

                  <th>
                    Caixa
                  </th>

                  <th>
                    Descrição
                  </th>

                  <th>
                    Categoria
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    Valor
                  </th>
                </tr>
              </thead>

              <tbody>
                {movimentacoesPeriodo.map(
                  (
                    movimentacao
                  ) => (
                    <tr
                      key={
                        movimentacao.id
                      }
                    >
                      <td>
                        {formatarData(
                          movimentacao
                            .data
                        )}
                      </td>

                      <td>
                        {movimentacao
                          .caixa ===
                        "hospitalaria"
                          ? "Hospitalaria"
                          : "Tesouraria"}
                      </td>

                      <td>
                        {
                          movimentacao
                            .descricao
                        }
                      </td>

                      <td>
                        {
                          movimentacao
                            .categoria
                        }
                      </td>

                      <td>
                        <span
                          className={
                            movimentacao
                              .tipo ===
                            "entrada"
                              ? "relatorio-status entrada"
                              : "relatorio-status saida"
                          }
                        >
                          {
                            movimentacao
                              .tipo
                          }
                        </span>
                      </td>

                      <td
                        className={
                          movimentacao
                            .tipo ===
                          "entrada"
                            ? "relatorio-verde"
                            : "relatorio-vermelho"
                        }
                      >
                        {formatarMoeda(
                          movimentacao
                            .valor
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        className="relatorios-card"
      >
        <div
          className="relatorios-card-header"
        >
          <div>
            <p
              className="relatorios-eyebrow"
            >
              MEMBROS
            </p>

            <h2>
              Situação do quadro
            </h2>
          </div>
        </div>

        <div
          className="relatorios-mini-cards"
        >
          <article>
            <span>
              Total
            </span>

            <strong>
              {membros.length}
            </strong>
          </article>

          <article>
            <span>
              Ativos
            </span>

            <strong
              className="relatorio-verde"
            >
              {membrosAtivos}
            </strong>
          </article>

          <article>
            <span>
              Inativos
            </span>

            <strong>
              {membrosInativos}
            </strong>
          </article>

          <article>
            <span>
              Seniores
            </span>

            <strong>
              {membrosSeniores}
            </strong>
          </article>
        </div>
      </section>

      <section
        className="relatorios-card"
      >
        <div
          className="relatorios-card-header"
        >
          <div>
            <p
              className="relatorios-eyebrow"
            >
              MENSALIDADES
            </p>

            <h2>
              Inadimplências
            </h2>
          </div>
        </div>

        <div
          className="relatorios-mini-cards"
        >
          <article>
            <span>
              Pagas
            </span>

            <strong
              className="relatorio-verde"
            >
              {
                mensalidadesPagas.length
              }
            </strong>
          </article>

          <article>
            <span>
              Em aberto
            </span>

            <strong>
              {
                mensalidadesPendentes
                  .length
              }
            </strong>
          </article>

          <article>
            <span>
              Atrasadas
            </span>

            <strong
              className="relatorio-vermelho"
            >
              {
                mensalidadesAtrasadas
                  .length
              }
            </strong>
          </article>

          <article>
            <span>
              Valor atrasado
            </span>

            <strong
              className="relatorio-vermelho"
            >
              {formatarMoeda(
                valorAtrasado
              )}
            </strong>
          </article>
        </div>

        <h3
          className="relatorios-subtitulo-tabela"
        >
          Mensalidades em atraso
        </h3>

        {mensalidadesAtrasadas
          .length === 0 ? (
          <div
            className="relatorios-vazio"
          >
            Nenhuma mensalidade
            atrasada.
          </div>
        ) : (
          <div
            className="relatorios-tabela-wrapper"
          >
            <table
              className="relatorios-tabela"
            >
              <thead>
                <tr>
                  <th>
                    Membro
                  </th>

                  <th>
                    Referência
                  </th>

                  <th>
                    Vencimento
                  </th>

                  <th>
                    Valor
                  </th>
                </tr>
              </thead>

              <tbody>
                {mensalidadesAtrasadas.map(
                  (
                    mensalidade
                  ) => (
                    <tr
                      key={
                        mensalidade.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            mensalidade
                              .membroNome
                          }
                        </strong>
                      </td>

                      <td>
                        {formatarReferencia(
                          mensalidade
                            .referencia
                        )}
                      </td>

                      <td>
                        {formatarData(
                          mensalidade
                            .vencimento
                        )}
                      </td>

                      <td
                        className="relatorio-vermelho"
                      >
                        {formatarMoeda(
                          mensalidade
                            .valor
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        className="relatorios-card"
      >
        <div
          className="relatorios-card-header"
        >
          <div>
            <p
              className="relatorios-eyebrow"
            >
              PATRIMÔNIO
            </p>

            <h2>
              Inventário
            </h2>
          </div>
        </div>

        <div
          className="relatorios-mini-cards"
        >
          <article>
            <span>
              Itens cadastrados
            </span>

            <strong>
              {itens.length}
            </strong>
          </article>

          <article>
            <span>
              Unidades disponíveis
            </span>

            <strong>
              {unidadesInventario}
            </strong>
          </article>

          <article>
            <span>
              Em manutenção
            </span>

            <strong
              className="relatorio-laranja"
            >
              {
                itensManutencao.length
              }
            </strong>
          </article>

          <article>
            <span>
              Baixados
            </span>

            <strong>
              {itensBaixados}
            </strong>
          </article>
        </div>

        <h3
          className="relatorios-subtitulo-tabela"
        >
          Itens em manutenção
        </h3>

        {itensManutencao
          .length === 0 ? (
          <div
            className="relatorios-vazio"
          >
            Nenhum item em
            manutenção.
          </div>
        ) : (
          <div
            className="relatorios-tabela-wrapper"
          >
            <table
              className="relatorios-tabela"
            >
              <thead>
                <tr>
                  <th>
                    Item
                  </th>

                  <th>
                    Categoria
                  </th>

                  <th>
                    Quantidade
                  </th>

                  <th>
                    Localização
                  </th>

                  <th>
                    Patrimônio
                  </th>
                </tr>
              </thead>

              <tbody>
                {itensManutencao.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td>
                        <strong>
                          {item.nome}
                        </strong>
                      </td>

                      <td>
                        {
                          item.categoria
                        }
                      </td>

                      <td>
                        {
                          item.quantidade
                        }
                      </td>

                      <td>
                        {item.localizacao ||
                          "—"}
                      </td>

                      <td>
                        {item.numeroPatrimonio ||
                          "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Relatorios;