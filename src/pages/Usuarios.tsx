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
  auth,
} from "../services/firebase";

import {
  alterarStatusUsuario,
  atualizarUsuario,
  cadastrarUsuario,
  listarUsuarios,
  obterPermissoesPerfil,
  permissoesVazias,
} from "../services/usuariosService";

import type {
  PerfilUsuario,
  PermissoesUsuario,
  Usuario,
  UsuarioCadastrado,
} from "../types/Usuario";

import "./Usuarios.css";

interface UsuariosProps {
  usuario: Usuario;
}

interface FormularioUsuario {
  uid: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  permissoes: PermissoesUsuario;
}

const formularioInicial:
  FormularioUsuario = {
    uid: "",
    nome: "",
    email: "",
    perfil: "consulta",
    ativo: true,
    permissoes: {
      ...permissoesVazias,
    },
  };

function Usuarios({
  usuario,
}: UsuariosProps) {
  const [
    usuarios,
    setUsuarios,
  ] =
    useState<UsuarioCadastrado[]>(
      []
    );

  const [
    formulario,
    setFormulario,
  ] =
    useState<FormularioUsuario>(
      formularioInicial
    );

  const [
    usuarioEditando,
    setUsuarioEditando,
  ] =
    useState<UsuarioCadastrado | null>(
      null
    );

  const [
    modalAberto,
    setModalAberto,
  ] =
    useState(false);

  const [
    busca,
    setBusca,
  ] =
    useState("");

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
    alterandoStatus,
    setAlterandoStatus,
  ] =
    useState<string | null>(
      null
    );

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

  const uidAtual =
    auth.currentUser?.uid ?? "";

  async function carregarUsuarios() {
    try {
      setErro("");

      const resultado =
        await listarUsuarios();

      setUsuarios(
        resultado
      );
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível carregar os usuários."
      );
    } finally {
      setCarregando(
        false
      );
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase();

      if (!termo) {
        return usuarios;
      }

      return usuarios.filter(
        (item) =>
          item.nome
            .toLowerCase()
            .includes(
              termo
            ) ||
          item.email
            .toLowerCase()
            .includes(
              termo
            ) ||
          item.perfil
            .toLowerCase()
            .includes(
              termo
            )
      );
    }, [
      usuarios,
      busca,
    ]);

  function abrirNovoUsuario() {
    setUsuarioEditando(
      null
    );

    setFormulario({
      ...formularioInicial,

      permissoes: {
        ...permissoesVazias,
      },
    });

    setErro("");
    setSucesso("");

    setModalAberto(
      true
    );
  }

  function abrirEdicao(
    item:
      UsuarioCadastrado
  ) {
    setUsuarioEditando(
      item
    );

    setFormulario({
      uid:
        item.id,

      nome:
        item.nome ?? "",

      email:
        item.email ?? "",

      perfil:
        item.perfil,

      ativo:
        item.ativo,

      permissoes:
        item.permissoes
        ?? obterPermissoesPerfil(
          item.perfil
        ),
    });

    setErro("");
    setSucesso("");

    setModalAberto(
      true
    );
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModalAberto(
      false
    );

    setUsuarioEditando(
      null
    );

    setFormulario({
      ...formularioInicial,

      permissoes: {
        ...permissoesVazias,
      },
    });

    setErro("");
  }

  function alterarPerfil(
    perfil:
      PerfilUsuario
  ) {
    setFormulario(
      (anterior) => ({
        ...anterior,

        perfil,

        permissoes:
          perfil ===
          "personalizado"
            ? {
                ...anterior
                  .permissoes,
              }
            : obterPermissoesPerfil(
                perfil
              ),
      })
    );
  }

  function alterarPermissao(
    campo:
      keyof PermissoesUsuario
  ) {
    if (
      formulario.perfil !==
      "personalizado"
    ) {
      return;
    }

    setFormulario(
      (anterior) => ({
        ...anterior,

        permissoes: {
          ...anterior.permissoes,

          [campo]:
            !anterior
              .permissoes[
                campo
              ],
        },
      })
    );
  }

  async function salvarUsuario(
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
        !formulario.uid.trim()
      ) {
        setErro(
          "Informe o UID do usuário."
        );

        return;
      }

      if (
        !formulario.nome.trim()
      ) {
        setErro(
          "Informe o nome do usuário."
        );

        return;
      }

      if (
        !formulario.email.trim()
      ) {
        setErro(
          "Informe o e-mail do usuário."
        );

        return;
      }

      if (
        usuarioEditando
      ) {
        await atualizarUsuario(
          usuarioEditando.id,
          {
            nome:
              formulario.nome,

            email:
              formulario.email,

            perfil:
              formulario.perfil,

            ativo:
              formulario.ativo,

            permissoes:
              formulario
                .permissoes,
          }
        );

        setSucesso(
          "Usuário atualizado com sucesso."
        );
      } else {
        const uidJaCadastrado =
          usuarios.some(
            (item) =>
              item.id ===
              formulario.uid.trim()
          );

        if (
          uidJaCadastrado
        ) {
          setErro(
            "Já existe um perfil cadastrado com esse UID."
          );

          return;
        }

        await cadastrarUsuario(
          {
            uid:
              formulario.uid,

            nome:
              formulario.nome,

            email:
              formulario.email,

            perfil:
              formulario.perfil,

            ativo:
              formulario.ativo,

            permissoes:
              formulario
                .permissoes,
          }
        );

        setSucesso(
          "Usuário cadastrado com sucesso."
        );
      }

      setModalAberto(
        false
      );

      setUsuarioEditando(
        null
      );

      setFormulario({
        ...formularioInicial,

        permissoes: {
          ...permissoesVazias,
        },
      });

      await carregarUsuarios();
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível salvar o usuário."
      );
    } finally {
      setSalvando(
        false
      );
    }
  }

  async function alternarStatus(
    item:
      UsuarioCadastrado
  ) {
    if (
      item.id ===
        uidAtual &&
      item.ativo
    ) {
      setErro(
        "Você não pode desativar o usuário que está utilizando neste momento."
      );

      return;
    }

    const novoStatus =
      !item.ativo;

    const confirmou =
      window.confirm(
        novoStatus
          ? `Deseja ativar o acesso de ${item.nome}?`
          : `Deseja desativar o acesso de ${item.nome}?`
      );

    if (!confirmou) {
      return;
    }

    try {
      setAlterandoStatus(
        item.id
      );

      setErro("");
      setSucesso("");

      await alterarStatusUsuario(
        item.id,
        novoStatus
      );

      setSucesso(
        novoStatus
          ? "Usuário ativado com sucesso."
          : "Usuário desativado com sucesso."
      );

      await carregarUsuarios();
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível alterar o status do usuário."
      );
    } finally {
      setAlterandoStatus(
        null
      );
    }
  }

  function nomePerfil(
    perfil:
      PerfilUsuario
  ) {
    switch (perfil) {
      case "admin":
        return "Administrador";

      case "secretaria":
        return "Secretaria";

      case "tesouraria":
        return "Tesouraria";

      case "patrimonio":
        return "Patrimônio";

      case "consulta":
        return "Consulta";

      case "personalizado":
        return "Personalizado";

      default:
        return perfil;
    }
  }

  if (
    usuario.perfil !==
    "admin"
  ) {
    return (
      <main
        className="usuarios-page"
      >
        <section
          className="usuarios-sem-acesso"
        >
          <h1>
            Acesso restrito
          </h1>

          <p>
            Somente administradores
            podem gerenciar usuários.
          </p>

          <Link
            to="/"
            className="usuarios-voltar"
          >
            Voltar ao painel
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      className="usuarios-page"
    >
      <header
        className="usuarios-header"
      >
        <div
          className="usuarios-brand"
        >
          <div
            className="brand-symbol"
          >
            △
          </div>

          <div>
            <p
              className="usuarios-eyebrow"
            >
              ADMINISTRAÇÃO
            </p>

            <h1>
              Usuários
            </h1>

            <p
              className="usuarios-subtitle"
            >
              Gerencie acessos,
              perfis e permissões
              do Capítulo Digital.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="usuarios-voltar"
        >
          Voltar ao painel
        </Link>
      </header>

      <section
        className="usuarios-container"
      >
        <div
          className="usuarios-intro"
        >
          <div>
            <span>
              {usuarios.length}
            </span>

            <p>
              usuários cadastrados
            </p>
          </div>

          <button
            type="button"
            className="novo-usuario"
            onClick={
              abrirNovoUsuario
            }
          >
            + Novo usuário
          </button>
        </div>

        <div
          className="usuarios-aviso"
        >
          <strong>
            Antes de cadastrar
          </strong>

          <p>
            Crie primeiro o login em
            Firebase Authentication,
            copie o UID gerado e depois
            finalize o acesso nesta
            tela.
          </p>
        </div>

        {sucesso && (
          <div
            className="usuarios-mensagem sucesso"
          >
            {sucesso}
          </div>
        )}

        {erro && (
          <div
            className="usuarios-mensagem erro"
          >
            {erro}
          </div>
        )}

        <section
          className="usuarios-card"
        >
          <div
            className="usuarios-toolbar"
          >
            <input
              type="search"
              placeholder="Buscar por nome, e-mail ou perfil..."
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
          </div>

          {carregando ? (
            <div
              className="usuarios-vazio"
            >
              Carregando usuários...
            </div>
          ) :
          usuariosFiltrados
            .length === 0 ? (
            <div
              className="usuarios-vazio"
            >
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div
              className="usuarios-tabela-wrapper"
            >
              <table
                className="usuarios-tabela"
              >
                <thead>
                  <tr>
                    <th>
                      Usuário
                    </th>

                    <th>
                      Perfil
                    </th>

                    <th>
                      Permissões
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
                  {usuariosFiltrados.map(
                    (item) => {
                      const permissoes =
                        item.permissoes
                        ?? obterPermissoesPerfil(
                          item.perfil
                        );

                      const eUsuarioAtual =
                        item.id ===
                        uidAtual;

                      return (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            <div
                              className="usuario-identificacao"
                            >
                              <strong>
                                {item.nome}
                              </strong>

                              <span>
                                {item.email}
                              </span>

                              {eUsuarioAtual && (
                                <small>
                                  Sessão atual
                                </small>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className="usuario-perfil"
                            >
                              {nomePerfil(
                                item.perfil
                              )}
                            </span>
                          </td>

                          <td>
                            <div
                              className="usuario-permissoes"
                            >
                              {permissoes.membros && (
                                <span>
                                  Membros
                                </span>
                              )}

                              {permissoes.financeiro && (
                                <span>
                                  Financeiro
                                </span>
                              )}

                              {permissoes.mensalidades && (
                                <span>
                                  Mensalidades
                                </span>
                              )}

                              {permissoes.inventario && (
                                <span>
                                  Inventário
                                </span>
                              )}

                              {!permissoes.membros &&
                              !permissoes.financeiro &&
                              !permissoes.mensalidades &&
                              !permissoes.inventario && (
                                <span
                                  className="somente-consulta"
                                >
                                  Somente consulta
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                `usuario-status ${
                                  item.ativo
                                    ? "ativo"
                                    : "inativo"
                                }`
                              }
                            >
                              {item.ativo
                                ? "Ativo"
                                : "Inativo"}
                            </span>
                          </td>

                          <td>
                            <div
                              className="usuarios-acoes"
                            >
                              <button
                                type="button"
                                className="usuario-editar"
                                onClick={() =>
                                  abrirEdicao(
                                    item
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className={
                                  item.ativo
                                    ? "usuario-desativar"
                                    : "usuario-ativar"
                                }
                                disabled={
                                  alterandoStatus ===
                                    item.id ||
                                  (
                                    eUsuarioAtual &&
                                    item.ativo
                                  )
                                }
                                onClick={() =>
                                  alternarStatus(
                                    item
                                  )
                                }
                              >
                                {alterandoStatus ===
                                item.id
                                  ? "Alterando..."
                                  : item.ativo
                                    ? "Desativar"
                                    : "Ativar"}
                              </button>
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
      </section>

      {modalAberto && (
        <div
          className="usuarios-modal-overlay"
        >
          <div
            className="usuarios-modal"
          >
            <div
              className="usuarios-modal-header"
            >
              <div>
                <p
                  className="usuarios-eyebrow"
                >
                  {usuarioEditando
                    ? "EDIÇÃO DE ACESSO"
                    : "NOVO ACESSO"}
                </p>

                <h2>
                  {usuarioEditando
                    ? "Editar usuário"
                    : "Cadastrar usuário"}
                </h2>
              </div>

              <button
                type="button"
                className="usuarios-fechar"
                onClick={
                  fecharModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                salvarUsuario
              }
            >
              <div
                className="usuarios-form-grid"
              >
                <label
                  className="usuarios-campo-largo"
                >
                  UID do Firebase Authentication

                  <input
                    value={
                      formulario.uid
                    }
                    disabled={
                      Boolean(
                        usuarioEditando
                      )
                    }
                    onChange={(
                      event
                    ) =>
                      setFormulario(
                        (
                          anterior
                        ) => ({
                          ...anterior,

                          uid:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Cole aqui o UID"
                    required
                  />
                </label>

                <label>
                  Nome

                  <input
                    value={
                      formulario.nome
                    }
                    onChange={(
                      event
                    ) =>
                      setFormulario(
                        (
                          anterior
                        ) => ({
                          ...anterior,

                          nome:
                            event
                              .target
                              .value,
                        })
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
                      formulario.email
                    }
                    onChange={(
                      event
                    ) =>
                      setFormulario(
                        (
                          anterior
                        ) => ({
                          ...anterior,

                          email:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Perfil

                  <select
                    value={
                      formulario.perfil
                    }
                    disabled={
                      usuarioEditando?.id ===
                      uidAtual
                    }
                    onChange={(
                      event
                    ) =>
                      alterarPerfil(
                        event
                          .target
                          .value as PerfilUsuario
                      )
                    }
                  >
                    <option
                      value="admin"
                    >
                      Administrador
                    </option>

                    <option
                      value="secretaria"
                    >
                      Secretaria
                    </option>

                    <option
                      value="tesouraria"
                    >
                      Tesouraria
                    </option>

                    <option
                      value="patrimonio"
                    >
                      Patrimônio
                    </option>

                    <option
                      value="consulta"
                    >
                      Consulta
                    </option>

                    <option
                      value="personalizado"
                    >
                      Personalizado
                    </option>
                  </select>
                </label>

                <label
                  className="usuarios-status-form"
                >
                  Status

                  <div
                    className="usuarios-checkbox-status"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formulario.ativo
                      }
                      disabled={
                        usuarioEditando?.id ===
                        uidAtual
                      }
                      onChange={(
                        event
                      ) =>
                        setFormulario(
                          (
                            anterior
                          ) => ({
                            ...anterior,

                            ativo:
                              event
                                .target
                                .checked,
                          })
                        )
                      }
                    />

                    <span>
                      Usuário ativo
                    </span>
                  </div>
                </label>
              </div>

              <section
                className="permissoes-box"
              >
                <div
                  className="permissoes-header"
                >
                  <div>
                    <strong>
                      Permissões de alteração
                    </strong>

                    <p>
                      Todos os usuários
                      ativos podem consultar.
                      Aqui você define o
                      que este usuário pode
                      modificar.
                    </p>
                  </div>

                  {formulario.perfil !==
                    "personalizado" && (
                    <span>
                      Definidas pelo perfil
                    </span>
                  )}
                </div>

                <div
                  className="permissoes-grid"
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={
                        formulario
                          .permissoes
                          .membros
                      }
                      disabled={
                        formulario.perfil !==
                        "personalizado"
                      }
                      onChange={() =>
                        alterarPermissao(
                          "membros"
                        )
                      }
                    />

                    <div>
                      <strong>
                        Membros
                      </strong>

                      <span>
                        Cadastrar e editar membros
                      </span>
                    </div>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={
                        formulario
                          .permissoes
                          .financeiro
                      }
                      disabled={
                        formulario.perfil !==
                        "personalizado"
                      }
                      onChange={() =>
                        alterarPermissao(
                          "financeiro"
                        )
                      }
                    />

                    <div>
                      <strong>
                        Financeiro
                      </strong>

                      <span>
                        Registrar movimentações
                      </span>
                    </div>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={
                        formulario
                          .permissoes
                          .mensalidades
                      }
                      disabled={
                        formulario.perfil !==
                        "personalizado"
                      }
                      onChange={() =>
                        alterarPermissao(
                          "mensalidades"
                        )
                      }
                    />

                    <div>
                      <strong>
                        Mensalidades
                      </strong>

                      <span>
                        Gerenciar pagamentos
                      </span>
                    </div>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={
                        formulario
                          .permissoes
                          .inventario
                      }
                      disabled={
                        formulario.perfil !==
                        "personalizado"
                      }
                      onChange={() =>
                        alterarPermissao(
                          "inventario"
                        )
                      }
                    />

                    <div>
                      <strong>
                        Inventário
                      </strong>

                      <span>
                        Cadastrar e editar patrimônio
                      </span>
                    </div>
                  </label>
                </div>

                <p
                  className="permissoes-observacao"
                >
                  A exclusão de registros
                  permanece exclusiva para
                  administradores.
                </p>
              </section>

              {erro && (
                <div
                  className="usuarios-mensagem erro modal"
                >
                  {erro}
                </div>
              )}

              <div
                className="usuarios-modal-actions"
              >
                <button
                  type="button"
                  className="usuarios-cancelar"
                  onClick={
                    fecharModal
                  }
                  disabled={
                    salvando
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="usuarios-salvar"
                  disabled={
                    salvando
                  }
                >
                  {salvando
                    ? "Salvando..."
                    : usuarioEditando
                      ? "Salvar alterações"
                      : "Cadastrar usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Usuarios;