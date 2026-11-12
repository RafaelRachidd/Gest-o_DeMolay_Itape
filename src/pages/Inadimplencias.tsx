import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
} from "react-router";

import {
  listarMembros,
} from "../services/membrosService";

import {
  alterarStatusMensalidade,
  cadastrarMensalidade,
  excluirMensalidade,
  listarMensalidades,
} from "../services/mensalidadesService";

import type {
  Membro,
} from "../types/Membro";

import type {
  Mensalidade,
} from "../types/Mensalidade";

import type {
  Usuario,
} from "../types/Usuario";

import "./Inadimplencias.css";

import MenuMobile
  from "../components/MenuMobile";

interface InadimplenciasProps {
  usuario: Usuario;
}

function hojeLocal() {
  const hoje =
    new Date();

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

function referenciaAtual() {
  const hoje =
    new Date();

  const ano =
    hoje.getFullYear();

  const mes =
    String(
      hoje.getMonth() + 1
    ).padStart(2, "0");

  return `${ano}-${mes}`;
}

function Inadimplencias({
  usuario,
}: InadimplenciasProps) {
  const [
    membros,
    setMembros,
  ] =
    useState<Membro[]>([]);

  const [
    mensalidades,
    setMensalidades,
  ] =
    useState<Mensalidade[]>([]);

  const [
    membroId,
    setMembroId,
  ] =
    useState("");

  const [
    referencia,
    setReferencia,
  ] =
    useState(
      referenciaAtual()
    );

  const [
    vencimento,
    setVencimento,
  ] =
    useState(
      hojeLocal()
    );

  const [
    valor,
    setValor,
  ] =
    useState("");

  const [
    busca,
    setBusca,
  ] =
    useState("");

  const [
    filtro,
    setFiltro,
  ] =
    useState("todos");

  const [
    carregando,
    setCarregando,
  ] =
    useState(true);

  const [
    salvando,
    setSalvando,
  ] =
    useState(false);

  const [
    erro,
    setErro,
  ] =
    useState("");

  const [
    sucesso,
    setSucesso,
  ] =
    useState("");

const podeGerenciar =
  usuario.perfil ===
    "admin" ||
  usuario.perfil ===
    "tesouraria" ||
  usuario.permissoes
    ?.mensalidades === true;

const podeExcluir =
  usuario.perfil ===
  "admin";

  async function carregarDados() {
    try {
      setErro("");

      const [
        listaMembros,
        listaMensalidades,
      ] =
        await Promise.all([
          listarMembros(),
          listarMensalidades(),
        ]);

      setMembros(
        listaMembros
      );

      setMensalidades(
        listaMensalidades
      );
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar as mensalidades."
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

  const hoje =
    hojeLocal();

  function atrasada(
    mensalidade: Mensalidade
  ) {
    return (
      mensalidade.status ===
        "pendente" &&
      mensalidade.vencimento <
        hoje
    );
  }

  const resumo =
    useMemo(() => {
      let pendentes = 0;
      let atrasadas = 0;
      let valorAtrasado = 0;

      const membrosAtrasados =
        new Set<string>();

      mensalidades.forEach(
        (mensalidade) => {
          if (
            mensalidade.status ===
            "pendente"
          ) {
            pendentes++;
          }

          if (
            mensalidade.status ===
              "pendente" &&
            mensalidade.vencimento <
              hoje
          ) {
            atrasadas++;

            valorAtrasado +=
              mensalidade.valor;

            membrosAtrasados.add(
              mensalidade.membroId
            );
          }
        }
      );

      return {
        pendentes,
        atrasadas,
        valorAtrasado,
        membrosInadimplentes:
          membrosAtrasados.size,
      };
    }, [
      mensalidades,
      hoje,
    ]);

  const mensalidadesFiltradas =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase();

      return mensalidades.filter(
        (mensalidade) => {
          const correspondeBusca =
            mensalidade.membroNome
              .toLowerCase()
              .includes(termo) ||
            mensalidade.referencia
              .includes(termo);

          let correspondeFiltro =
            true;

          if (
            filtro ===
            "pago"
          ) {
            correspondeFiltro =
              mensalidade.status ===
              "pago";
          }

          if (
            filtro ===
            "pendente"
          ) {
            correspondeFiltro =
              mensalidade.status ===
              "pendente";
          }

          if (
            filtro ===
            "atrasado"
          ) {
            correspondeFiltro =
              atrasada(
                mensalidade
              );
          }

          return (
            correspondeBusca &&
            correspondeFiltro
          );
        }
      );
    }, [
      mensalidades,
      busca,
      filtro,
      hoje,
    ]);

  function formatarMoeda(
    numero: number
  ) {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    ).format(numero);
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

    return `${dia}/${mes}/${ano}`;
  }

  function formatarReferencia(
    referenciaOriginal: string
  ) {
    const [
      ano,
      mes,
    ] =
      referenciaOriginal.split(
        "-"
      );

    return `${mes}/${ano}`;
  }

  async function salvar(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const membro =
      membros.find(
        (item) =>
          item.id ===
          membroId
      );

    const valorNumerico =
      Number(valor);

    if (
      !membro ||
      !referencia ||
      !vencimento ||
      !valorNumerico ||
      valorNumerico <= 0
    ) {
      setErro(
        "Preencha todos os campos corretamente."
      );

      return;
    }

    const duplicada =
      mensalidades.some(
        (mensalidade) =>
          mensalidade.membroId ===
            membroId &&
          mensalidade.referencia ===
            referencia
      );

    if (duplicada) {
      setErro(
        "Este membro já possui uma mensalidade para essa referência."
      );

      return;
    }

    try {
      setSalvando(true);

      setErro("");
      setSucesso("");

      await cadastrarMensalidade({
        membroId:
          membro.id,

        membroNome:
          membro.nomeCompleto,

        referencia,

        valor:
          valorNumerico,

        vencimento,

        status:
          "pendente",

        dataPagamento:
          null,
      });

      setValor("");

      setSucesso(
        "Mensalidade criada com sucesso."
      );

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível criar a mensalidade."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(
    mensalidade:
      Mensalidade
  ) {
    const novoStatus =
      mensalidade.status ===
        "pago"
        ? "pendente"
        : "pago";

    try {
      setErro("");
      setSucesso("");

      await alterarStatusMensalidade(
        mensalidade.id,
        novoStatus
      );

      setSucesso(
        novoStatus ===
          "pago"
          ? "Pagamento registrado."
          : "Mensalidade reaberta."
      );

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível alterar o status."
      );
    }
  }

  async function remover(
    mensalidade:
      Mensalidade
  ) {
    const confirmou =
      window.confirm(
        `Excluir a mensalidade de ${mensalidade.membroNome} - ${formatarReferencia(
          mensalidade.referencia
        )}?`
      );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");
      setSucesso("");

      await excluirMensalidade(
        mensalidade.id
      );

      setSucesso(
        "Mensalidade excluída."
      );

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível excluir a mensalidade."
      );
    }
  }

  return (
    <main className="inadimplencias-page">
      <MenuMobile usuario={usuario} />
      <header className="inadimplencias-header">
        <div>
          <p className="inadimplencias-eyebrow">
            CAPÍTULO DIGITAL
          </p>

          <h1>
            Inadimplências
          </h1>

          <p className="inadimplencias-subtitle">
            Controle de mensalidades e
            pagamentos dos membros.
          </p>
        </div>

        <Link
          to="/"
          className="inadimplencias-voltar"
        >
          ← Voltar ao Dashboard
        </Link>
      </header>

      <section className="inadimplencias-resumo">
        <article>
          <span>
            Membros inadimplentes
          </span>

          <strong className="vermelho">
            {
              resumo
                .membrosInadimplentes
            }
          </strong>
        </article>

        <article>
          <span>
            Mensalidades em aberto
          </span>

          <strong>
            {
              resumo
                .pendentes
            }
          </strong>
        </article>

        <article>
          <span>
            Mensalidades atrasadas
          </span>

          <strong className="vermelho">
            {
              resumo
                .atrasadas
            }
          </strong>
        </article>

        <article>
          <span>
            Valor em atraso
          </span>

          <strong className="vermelho">
            {formatarMoeda(
              resumo
                .valorAtrasado
            )}
          </strong>
        </article>
      </section>

      {erro && (
        <div className="inadimplencias-alerta erro">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="inadimplencias-alerta sucesso">
          {sucesso}
        </div>
      )}

      {podeGerenciar && (
        <section className="inadimplencias-card">
          <div className="inadimplencias-card-header">
            <div>
              <p className="inadimplencias-eyebrow">
                NOVA COBRANÇA
              </p>

              <h2>
                Criar mensalidade
              </h2>
            </div>
          </div>

          <form
            className="inadimplencias-form"
            onSubmit={salvar}
          >
            <label>
              Membro

              <select
                value={membroId}
                onChange={(
                  event
                ) =>
                  setMembroId(
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Selecione...
                </option>

                {membros.map(
                  (membro) => (
                    <option
                      key={
                        membro.id
                      }
                      value={
                        membro.id
                      }
                    >
                      {
                        membro
                          .nomeCompleto
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Referência

              <input
                type="month"
                value={
                  referencia
                }
                onChange={(
                  event
                ) =>
                  setReferencia(
                    event
                      .target
                      .value
                  )
                }
                required
              />
            </label>

            <label>
              Vencimento

              <input
                type="date"
                value={
                  vencimento
                }
                onChange={(
                  event
                ) =>
                  setVencimento(
                    event
                      .target
                      .value
                  )
                }
                required
              />
            </label>

            <label>
              Valor

              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(
                  event
                ) =>
                  setValor(
                    event
                      .target
                      .value
                  )
                }
                required
              />
            </label>

            <button
              type="submit"
              className="inadimplencias-salvar"
              disabled={
                salvando
              }
            >
              {salvando
                ? "Salvando..."
                : "Criar mensalidade"}
            </button>
          </form>
        </section>
      )}

      <section className="inadimplencias-card">
        <div className="inadimplencias-card-header">
          <div>
            <p className="inadimplencias-eyebrow">
              MENSALIDADES
            </p>

            <h2>
              Histórico de cobranças
            </h2>
          </div>
        </div>

        <div className="inadimplencias-filtros">
          <input
            type="search"
            placeholder="Buscar membro..."
            value={busca}
            onChange={(
              event
            ) =>
              setBusca(
                event
                  .target
                  .value
              )
            }
          />

          <select
            value={filtro}
            onChange={(
              event
            ) =>
              setFiltro(
                event
                  .target
                  .value
              )
            }
          >
            <option value="todos">
              Todas
            </option>

            <option value="pendente">
              Em aberto
            </option>

            <option value="atrasado">
              Atrasadas
            </option>

            <option value="pago">
              Pagas
            </option>
          </select>
        </div>

        {carregando ? (
          <div className="inadimplencias-vazio">
            Carregando...
          </div>
        ) :
        mensalidadesFiltradas
          .length === 0 ? (
          <div className="inadimplencias-vazio">
            Nenhuma mensalidade
            encontrada.
          </div>
        ) : (
          <div className="inadimplencias-tabela-wrapper">
            <table className="inadimplencias-tabela">
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
                    Status
                  </th>

                  <th>
                    Valor
                  </th>

                  <th>
                    Pagamento
                  </th>

                  <th>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {mensalidadesFiltradas.map(
                  (
                    mensalidade
                  ) => {
                    const estaAtrasada =
                      atrasada(
                        mensalidade
                      );

                    return (
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

                        <td>
                          <span
                            className={
                              mensalidade
                                .status ===
                              "pago"
                                ? "mensalidade-status pago"
                                : estaAtrasada
                                ? "mensalidade-status atrasado"
                                : "mensalidade-status pendente"
                            }
                          >
                            {mensalidade
                              .status ===
                            "pago"
                              ? "Pago"
                              : estaAtrasada
                              ? "Atrasado"
                              : "Em aberto"}
                          </span>
                        </td>

                        <td>
                          {formatarMoeda(
                            mensalidade
                              .valor
                          )}
                        </td>

                        <td>
                          {mensalidade
                            .dataPagamento
                            ? formatarData(
                                mensalidade
                                  .dataPagamento
                              )
                            : "—"}
                        </td>

                        <td>
                          <div className="mensalidade-acoes">
                            {podeGerenciar && (
                              <button
                                className={
                                  mensalidade
                                    .status ===
                                  "pago"
                                    ? "acao-reabrir"
                                    : "acao-pagar"
                                }
                                onClick={() =>
                                  mudarStatus(
                                    mensalidade
                                  )
                                }
                              >
                                {mensalidade
                                  .status ===
                                "pago"
                                  ? "Reabrir"
                                  : "Marcar paga"}
                              </button>
                            )}

                            {podeExcluir && (
                              <button
                                className="acao-excluir"
                                onClick={() =>
                                  remover(
                                    mensalidade
                                  )
                                }
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Inadimplencias;