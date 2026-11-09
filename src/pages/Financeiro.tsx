import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router";

import {
  cadastrarMovimentacao,
  calcularResumoFinanceiro,
  excluirMovimentacao,
  listarMovimentacoes,
} from "../services/financeiroService";

import type {
  MovimentacaoFinanceira,
  NovaMovimentacaoFinanceira,
  TipoMovimentacao,
} from "../types/MovimentacaoFinanceira";

import type {
  Usuario,
} from "../types/Usuario";

import "./Financeiro.css";

interface FinanceiroProps {
  usuario: Usuario;
}

function dataHoje() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function Financeiro({
  usuario,
}: FinanceiroProps) {
  const [
    movimentacoes,
    setMovimentacoes,
  ] =
    useState<
      MovimentacaoFinanceira[]
    >([]);

  const [
    tipo,
    setTipo,
  ] =
    useState<TipoMovimentacao>(
      "entrada"
    );

  const [
    descricao,
    setDescricao,
  ] =
    useState("");

  const [
    categoria,
    setCategoria,
  ] =
    useState("Mensalidade");

  const [
    valor,
    setValor,
  ] =
    useState("");

  const [
    data,
    setData,
  ] =
    useState(
      dataHoje()
    );

  const [
    busca,
    setBusca,
  ] =
    useState("");

  const [
    filtroTipo,
    setFiltroTipo,
  ] =
    useState("todos");

  const [
    entradas,
    setEntradas,
  ] =
    useState(0);

  const [
    saidas,
    setSaidas,
  ] =
    useState(0);

  const [
    saldo,
    setSaldo,
  ] =
    useState(0);

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

  const podeMovimentar =
    usuario.perfil === "admin" ||
    usuario.perfil === "tesouraria";

  const podeExcluir =
    usuario.perfil === "admin";

  async function carregarDados() {
    try {
      setErro("");

      const [
        lista,
        resumo,
      ] =
        await Promise.all([
          listarMovimentacoes(),
          calcularResumoFinanceiro(),
        ]);

      setMovimentacoes(lista);

      setEntradas(
        resumo.entradas
      );

      setSaidas(
        resumo.saidas
      );

      setSaldo(
        resumo.saldo
      );
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar os dados financeiros."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const movimentacoesFiltradas =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase();

      return movimentacoes.filter(
        (movimentacao) => {
          const correspondeTipo =
            filtroTipo ===
              "todos" ||
            movimentacao.tipo ===
              filtroTipo;

          const correspondeBusca =
            movimentacao.descricao
              .toLowerCase()
              .includes(termo) ||
            movimentacao.categoria
              .toLowerCase()
              .includes(termo) ||
            movimentacao.responsavel
              .toLowerCase()
              .includes(termo);

          return (
            correspondeTipo &&
            correspondeBusca
          );
        }
      );
    }, [
      movimentacoes,
      busca,
      filtroTipo,
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
    dataOriginal: string
  ) {
    const [
      ano,
      mes,
      dia,
    ] =
      dataOriginal.split("-");

    if (
      !ano ||
      !mes ||
      !dia
    ) {
      return dataOriginal;
    }

    return `${dia}/${mes}/${ano}`;
  }

  async function salvar(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const valorNumerico =
      Number(valor);

    if (
      !descricao.trim() ||
      !valorNumerico ||
      valorNumerico <= 0
    ) {
      setErro(
        "Preencha a descrição e informe um valor maior que zero."
      );

      return;
    }

    const novaMovimentacao:
      NovaMovimentacaoFinanceira = {
        tipo,
        descricao:
          descricao.trim(),
        categoria,
        valor:
          valorNumerico,
        data,
        responsavel:
          usuario.nome,
      };

    try {
      setSalvando(true);

      setErro("");
      setSucesso("");

      await cadastrarMovimentacao(
        novaMovimentacao
      );

      setDescricao("");
      setValor("");
      setCategoria(
        "Mensalidade"
      );
      setTipo(
        "entrada"
      );
      setData(
        dataHoje()
      );

      setSucesso(
        "Movimentação registrada com sucesso."
      );

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível registrar a movimentação."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function remover(
    movimentacao:
      MovimentacaoFinanceira
  ) {
    const confirmou =
      window.confirm(
        `Excluir "${movimentacao.descricao}"?`
      );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");
      setSucesso("");

      await excluirMovimentacao(
        movimentacao.id
      );

      setSucesso(
        "Movimentação excluída."
      );

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível excluir a movimentação."
      );
    }
  }

  return (
    <main className="financeiro-page">
      <header className="financeiro-header">
        <div>
          <p className="financeiro-eyebrow">
            CAPÍTULO DIGITAL
          </p>

          <h1>
            Financeiro
          </h1>

          <p className="financeiro-subtitle">
            Controle de entradas,
            saídas e saldo do capítulo.
          </p>
        </div>

        <Link
          to="/"
          className="financeiro-voltar"
        >
          ← Voltar ao Dashboard
        </Link>
      </header>

      <section className="financeiro-resumo">
        <article>
          <span>
            Saldo em caixa
          </span>

          <strong
            className={
              saldo < 0
                ? "negativo"
                : ""
            }
          >
            {formatarMoeda(
              saldo
            )}
          </strong>
        </article>

        <article>
          <span>
            Entradas
          </span>

          <strong className="entrada-texto">
            {formatarMoeda(
              entradas
            )}
          </strong>
        </article>

        <article>
          <span>
            Saídas
          </span>

          <strong className="saida-texto">
            {formatarMoeda(
              saidas
            )}
          </strong>
        </article>
      </section>

      {erro && (
        <div className="financeiro-alerta erro">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="financeiro-alerta sucesso">
          {sucesso}
        </div>
      )}

      {podeMovimentar && (
        <section className="financeiro-card">
          <div className="financeiro-card-header">
            <div>
              <p className="financeiro-eyebrow">
                NOVO REGISTRO
              </p>

              <h2>
                Registrar movimentação
              </h2>
            </div>
          </div>

          <form
            className="financeiro-form"
            onSubmit={salvar}
          >
            <label>
              Tipo

              <select
                value={tipo}
                onChange={(
                  event
                ) =>
                  setTipo(
                    event.target
                      .value as
                      TipoMovimentacao
                  )
                }
              >
                <option value="entrada">
                  Entrada
                </option>

                <option value="saida">
                  Saída
                </option>
              </select>
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
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              Data

              <input
                type="date"
                value={data}
                onChange={(
                  event
                ) =>
                  setData(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              Categoria

              <select
                value={
                  categoria
                }
                onChange={(
                  event
                ) =>
                  setCategoria(
                    event.target.value
                  )
                }
              >
                <option>
                  Mensalidade
                </option>

                <option>
                  Evento
                </option>

                <option>
                  Doação
                </option>

                <option>
                  Materiais
                </option>

                <option>
                  Alimentação
                </option>

                <option>
                  Manutenção
                </option>

                <option>
                  Outros
                </option>
              </select>
            </label>

            <label className="financeiro-descricao">
              Descrição

              <input
                type="text"
                placeholder="Ex.: Mensalidades de novembro"
                value={
                  descricao
                }
                onChange={(
                  event
                ) =>
                  setDescricao(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <button
              type="submit"
              className="financeiro-salvar"
              disabled={
                salvando
              }
            >
              {salvando
                ? "Salvando..."
                : "Registrar movimentação"}
            </button>
          </form>
        </section>
      )}

      <section className="financeiro-card">
        <div className="financeiro-card-header">
          <div>
            <p className="financeiro-eyebrow">
              HISTÓRICO
            </p>

            <h2>
              Movimentações
            </h2>
          </div>
        </div>

        <div className="financeiro-filtros">
          <input
            type="search"
            placeholder="Buscar movimentação..."
            value={busca}
            onChange={(
              event
            ) =>
              setBusca(
                event.target.value
              )
            }
          />

          <select
            value={
              filtroTipo
            }
            onChange={(
              event
            ) =>
              setFiltroTipo(
                event.target.value
              )
            }
          >
            <option value="todos">
              Todos
            </option>

            <option value="entrada">
              Entradas
            </option>

            <option value="saida">
              Saídas
            </option>
          </select>
        </div>

        {carregando ? (
          <div className="financeiro-vazio">
            Carregando...
          </div>
        ) :
        movimentacoesFiltradas
          .length === 0 ? (
          <div className="financeiro-vazio">
            Nenhuma movimentação
            registrada.
          </div>
        ) : (
          <div className="financeiro-tabela-wrapper">
            <table className="financeiro-tabela">
              <thead>
                <tr>
                  <th>
                    Data
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
                    Responsável
                  </th>

                  <th>
                    Valor
                  </th>

                  <th>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {movimentacoesFiltradas.map(
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
                          movimentacao.data
                        )}
                      </td>

                      <td>
                        <strong>
                          {
                            movimentacao
                              .descricao
                          }
                        </strong>
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
                            `financeiro-badge ${movimentacao.tipo}`
                          }
                        >
                          {
                            movimentacao.tipo
                          }
                        </span>
                      </td>

                      <td>
                        {
                          movimentacao
                            .responsavel
                        }
                      </td>

                      <td
                        className={
                          movimentacao.tipo ===
                          "entrada"
                            ? "entrada-texto"
                            : "saida-texto"
                        }
                      >
                        {movimentacao.tipo ===
                        "entrada"
                          ? "+"
                          : "-"}{" "}

                        {formatarMoeda(
                          movimentacao.valor
                        )}
                      </td>

                      <td>
                        {podeExcluir ? (
                          <button
                            className="financeiro-excluir"
                            onClick={() =>
                              remover(
                                movimentacao
                              )
                            }
                          >
                            Excluir
                          </button>
                        ) : (
                          "—"
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
    </main>
  );
}

export default Financeiro;