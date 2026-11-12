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
  cadastrarMembro,
  editarMembro,
  excluirMembro,
  listarMembros,
} from "../services/membrosService";

import type {
  Membro,
  NovoMembro,
} from "../types/Membro";

import type {
  Usuario,
} from "../types/Usuario";

import "./Membros.css";

import MenuMobile
  from "../components/MenuMobile";

interface MembrosProps {
  usuario: Usuario;
}

const membroInicial:
  NovoMembro = {
    nomeCompleto: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    dataIngresso: "",
    grau: "",
    oficio: "",
    status: "ativo",
  };

function Membros({
  usuario,
}: MembrosProps) {
  const [
    membros,
    setMembros,
  ] =
    useState<Membro[]>(
      []
    );

  const [
    novoMembro,
    setNovoMembro,
  ] =
    useState<NovoMembro>(
      membroInicial
    );

  const [
    membroEditando,
    setMembroEditando,
  ] =
    useState<Membro | null>(
      null
    );

  const [
    excluindoId,
    setExcluindoId,
  ] =
    useState<string | null>(
      null
    );

  const [
    busca,
    setBusca,
  ] =
    useState("");

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState(
      "todos"
    );

  const [
    modalAberto,
    setModalAberto,
  ] =
    useState(false);

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

  const podeAlterarMembros =
  usuario.perfil ===
    "admin" ||
  usuario.perfil ===
    "secretaria" ||
  usuario.permissoes
    ?.membros === true;

const podeCadastrar =
  podeAlterarMembros;

const podeEditar =
  podeAlterarMembros;

const podeExcluir =
  usuario.perfil ===
  "admin";

  async function carregarMembros() {
    try {
      setErro("");

      const resultado =
        await listarMembros();

      setMembros(
        resultado
      );
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível carregar os membros."
      );
    } finally {
      setCarregando(
        false
      );
    }
  }

  useEffect(() => {
    carregarMembros();
  }, []);

  const membrosFiltrados =
    useMemo(() => {
      return membros.filter(
        (membro) => {
          const nome =
            membro.nomeCompleto ??
            "";

          const email =
            membro.email ??
            "";

          const termo =
            busca
              .toLowerCase()
              .trim();

          const correspondeBusca =
            nome
              .toLowerCase()
              .includes(
                termo
              ) ||
            email
              .toLowerCase()
              .includes(
                termo
              );

          const correspondeStatus =
            filtroStatus ===
              "todos" ||
            membro.status ===
              filtroStatus;

          return (
            correspondeBusca &&
            correspondeStatus
          );
        }
      );
    }, [
      membros,
      busca,
      filtroStatus,
    ]);

  function alterarCampo<
    K extends keyof NovoMembro
  >(
    campo: K,
    valor:
      NovoMembro[K]
  ) {
    setNovoMembro(
      (anterior) => ({
        ...anterior,

        [campo]:
          valor,
      })
    );
  }

  function abrirNovoMembro() {
    setMembroEditando(
      null
    );

    setNovoMembro({
      ...membroInicial,
    });

    setErro("");
    setSucesso("");

    setModalAberto(
      true
    );
  }

  function abrirEdicao(
    membro: Membro
  ) {
    setMembroEditando(
      membro
    );

    setNovoMembro({
      nomeCompleto:
        membro.nomeCompleto ??
        "",

      email:
        membro.email ??
        "",

      telefone:
        membro.telefone ??
        "",

      dataNascimento:
        membro.dataNascimento ??
        "",

      dataIngresso:
        membro.dataIngresso ??
        "",

      grau:
        membro.grau ??
        "",

      oficio:
        membro.oficio ??
        "",

      status:
        membro.status,
    });

    setErro("");
    setSucesso("");

    setModalAberto(
      true
    );
  }

  function fecharModal() {
    setModalAberto(
      false
    );

    setMembroEditando(
      null
    );

    setNovoMembro({
      ...membroInicial,
    });

    setErro("");
  }

  async function salvarMembro(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSalvando(
        true
      );

      setErro("");
      setSucesso("");

      if (
        membroEditando
      ) {
        await editarMembro(
          membroEditando.id,
          novoMembro
        );

        setSucesso(
          "Membro atualizado com sucesso."
        );
      } else {
        await cadastrarMembro(
          novoMembro
        );

        setSucesso(
          "Membro cadastrado com sucesso."
        );
      }

      setNovoMembro({
        ...membroInicial,
      });

      setMembroEditando(
        null
      );

      setModalAberto(
        false
      );

      await carregarMembros();
    } catch (error) {
      console.error(
        error
      );

      if (
        membroEditando
      ) {
        setErro(
          "Não foi possível atualizar o membro."
        );
      } else {
        setErro(
          "Não foi possível cadastrar o membro."
        );
      }
    } finally {
      setSalvando(
        false
      );
    }
  }

  async function removerMembro(
    membro: Membro
  ) {
    const confirmou =
      window.confirm(
        `Deseja realmente excluir ${membro.nomeCompleto}?`
      );

    if (
      !confirmou
    ) {
      return;
    }

    try {
      setExcluindoId(
        membro.id
      );

      setErro("");
      setSucesso("");

      await excluirMembro(
        membro.id
      );

      setSucesso(
        "Membro excluído com sucesso."
      );

      await carregarMembros();
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível excluir o membro."
      );
    } finally {
      setExcluindoId(
        null
      );
    }
  }

  const totalAtivos =
    membros.filter(
      (membro) =>
        membro.status ===
        "ativo"
    ).length;

  const totalInativos =
    membros.filter(
      (membro) =>
        membro.status ===
        "inativo"
    ).length;

  const totalSeniores =
    membros.filter(
      (membro) =>
        membro.status ===
        "senior"
    ).length;

  return (
    <main
      className="membros-page"
    >
      <MenuMobile usuario={usuario} />

      <header
        className="membros-topbar"
      >
        <div
          className="membros-brand"
        >
          <div
            className="membros-logo"
          >
            △
          </div>

          <div>
            <strong>
              Capítulo Digital
            </strong>

            <span>
              Gestão de Membros
            </span>
          </div>
        </div>

        <div
          className="membros-user"
        >
          <div>
            <strong>
              {usuario.nome}
            </strong>

            <span>
              {usuario.perfil}
            </span>
          </div>

          <Link
            to="/"
            className="voltar-dashboard"
          >
            Voltar ao painel
          </Link>
        </div>
      </header>

      <section
        className="membros-container"
      >
        <div
          className="membros-title-row"
        >
          <div>
            <p
              className="membros-eyebrow"
            >
              GESTÃO CAPITULAR
            </p>

            <h1>
              Membros
            </h1>

            <p
              className="membros-description"
            >
              Cadastre, consulte,
              edite e acompanhe os
              integrantes do capítulo.
            </p>
          </div>

          {podeCadastrar && (
            <button
              className="novo-membro-button"
              onClick={
                abrirNovoMembro
              }
            >
              + Novo membro
            </button>
          )}
        </div>

        <section
          className="membros-summary"
        >
          <article>
            <span>
              Total de membros
            </span>

            <strong>
              {membros.length}
            </strong>
          </article>

          <article>
            <span>
              Ativos
            </span>

            <strong>
              {totalAtivos}
            </strong>
          </article>

          <article>
            <span>
              Inativos
            </span>

            <strong>
              {totalInativos}
            </strong>
          </article>

          <article>
            <span>
              Seniores
            </span>

            <strong>
              {totalSeniores}
            </strong>
          </article>
        </section>

        {sucesso && (
          <div
            className="mensagem sucesso"
          >
            {sucesso}
          </div>
        )}

        {erro && (
          <div
            className="mensagem erro"
          >
            {erro}
          </div>
        )}

        <section
          className="membros-panel"
        >
          <div
            className="membros-toolbar"
          >
            <input
              type="search"
              placeholder="Buscar por nome ou e-mail..."
              value={
                busca
              }
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
              value={
                filtroStatus
              }
              onChange={(
                event
              ) =>
                setFiltroStatus(
                  event
                    .target
                    .value
                )
              }
            >
              <option
                value="todos"
              >
                Todos os status
              </option>

              <option
                value="ativo"
              >
                Ativos
              </option>

              <option
                value="inativo"
              >
                Inativos
              </option>

              <option
                value="senior"
              >
                Seniores
              </option>
            </select>
          </div>

          {carregando ? (
            <div
              className="membros-empty"
            >
              Carregando membros...
            </div>
          ) :
          membrosFiltrados
            .length === 0 ? (
            <div
              className="membros-empty"
            >
              <strong>
                Nenhum membro encontrado
              </strong>

              <p>
                Cadastre um novo membro
                ou altere os filtros.
              </p>
            </div>
          ) : (
            <div
              className="membros-table-wrapper"
            >
              <table
                className="membros-table"
              >
                <thead>
                  <tr>
                    <th>
                      Nome
                    </th>

                    <th>
                      E-mail
                    </th>

                    <th>
                      Telefone
                    </th>

                    <th>
                      Grau
                    </th>

                    <th>
                      Ofício
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {membrosFiltrados.map(
                    (membro) => (
                      <tr
                        key={
                          membro.id
                        }
                      >
                        <td>
                          <strong>
                            {
                              membro
                                .nomeCompleto
                            }
                          </strong>
                        </td>

                        <td>
                          {membro.email ||
                            "—"}
                        </td>

                        <td>
                          {membro.telefone ||
                            "—"}
                        </td>

                        <td>
                          {membro.grau ||
                            "—"}
                        </td>

                        <td>
                          {membro.oficio ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={
                              `status-badge ${membro.status}`
                            }
                          >
                            {
                              membro.status
                            }
                          </span>
                        </td>

                        <td>
                          <div
                            className="membro-actions"
                          >
                            {podeEditar && (
                              <button
                                type="button"
                                className="editar-membro"
                                onClick={() =>
                                  abrirEdicao(
                                    membro
                                  )
                                }
                              >
                                Editar
                              </button>
                            )}

                            {podeExcluir && (
                              <button
                                type="button"
                                className="excluir-membro"
                                disabled={
                                  excluindoId ===
                                  membro.id
                                }
                                onClick={() =>
                                  removerMembro(
                                    membro
                                  )
                                }
                              >
                                {excluindoId ===
                                membro.id
                                  ? "Excluindo..."
                                  : "Excluir"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {modalAberto && (
        <div
          className="modal-overlay"
        >
          <div
            className="membro-modal"
          >
            <div
              className="modal-header"
            >
              <div>
                <p
                  className="membros-eyebrow"
                >
                  {membroEditando
                    ? "EDIÇÃO"
                    : "CADASTRO"}
                </p>

                <h2>
                  {membroEditando
                    ? "Editar membro"
                    : "Novo membro"}
                </h2>
              </div>

              <button
                type="button"
                className="fechar-modal"
                onClick={
                  fecharModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                salvarMembro
              }
            >
              <div
                className="modal-grid"
              >
                <label>
                  Nome completo

                  <input
                    value={
                      novoMembro
                        .nomeCompleto
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "nomeCompleto",
                        event
                          .target
                          .value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  E-mail

                  <input
                    type="email"
                    value={
                      novoMembro
                        .email
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "email",
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>

                <label>
                  Telefone

                  <input
                    value={
                      novoMembro
                        .telefone
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "telefone",
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>

                <label>
                  Data de nascimento

                  <input
                    type="date"
                    value={
                      novoMembro
                        .dataNascimento
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "dataNascimento",
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>

                <label>
                  Data de ingresso

                  <input
                    type="date"
                    value={
                      novoMembro
                        .dataIngresso
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "dataIngresso",
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>

                <label>
                  Grau

                  <input
                    value={
                      novoMembro
                        .grau
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "grau",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Ex.: DeMolay"
                  />
                </label>

                <label>
                  Ofício

                  <input
                    value={
                      novoMembro
                        .oficio
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "oficio",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Ex.: Mestre Conselheiro"
                  />
                </label>

                <label>
                  Status

                  <select
                    value={
                      novoMembro
                        .status
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "status",
                        event
                          .target
                          .value as
                          NovoMembro["status"]
                      )
                    }
                  >
                    <option
                      value="ativo"
                    >
                      Ativo
                    </option>

                    <option
                      value="inativo"
                    >
                      Inativo
                    </option>

                    <option
                      value="senior"
                    >
                      Sênior
                    </option>
                  </select>
                </label>
              </div>

              <div
                className="modal-actions"
              >
                <button
                  type="button"
                  className="cancelar-button"
                  onClick={
                    fecharModal
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="salvar-button"
                  disabled={
                    salvando
                  }
                >
                  {salvando
                    ? "Salvando..."
                    : membroEditando
                    ? "Salvar alterações"
                    : "Cadastrar membro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Membros;