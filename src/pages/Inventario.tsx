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
  cadastrarItemInventario,
  editarItemInventario,
  excluirItemInventario,
  listarItensInventario,
} from "../services/inventarioService";

import type {
  EstadoItem,
  ItemInventario,
  NovoItemInventario,
} from "../types/ItemInventario";

import type {
  Usuario,
} from "../types/Usuario";

import "./Inventario.css";

import MenuMobile
  from "../components/MenuMobile";

interface InventarioProps {
  usuario: Usuario;
}

const itemInicial:
  NovoItemInventario = {
    nome: "",
    categoria: "",
    quantidade: 1,
    estado: "bom",
    localizacao: "",
    numeroPatrimonio: "",
    observacoes: "",
  };

function Inventario({
  usuario,
}: InventarioProps) {
  const [
    itens,
    setItens,
  ] =
    useState<
      ItemInventario[]
    >([]);

  const [
    itemFormulario,
    setItemFormulario,
  ] =
    useState<
      NovoItemInventario
    >({
      ...itemInicial,
    });

  const [
    itemEditando,
    setItemEditando,
  ] =
    useState<
      ItemInventario | null
    >(null);

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
    filtroEstado,
    setFiltroEstado,
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
    excluindoId,
    setExcluindoId,
  ] =
    useState<
      string | null
    >(null);

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
    "patrimonio" ||
  usuario.permissoes
    ?.inventario === true;

const podeExcluir =
  usuario.perfil ===
  "admin";

  async function carregarItens() {
    try {
      setErro("");

      const resultado =
        await listarItensInventario();

      setItens(
        resultado
      );
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível carregar o inventário."
      );
    } finally {
      setCarregando(
        false
      );
    }
  }

  useEffect(() => {
    carregarItens();
  }, []);

  const itensFiltrados =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase();

      return itens.filter(
        (item) => {
          const correspondeBusca =
            item.nome
              .toLowerCase()
              .includes(
                termo
              ) ||
            item.categoria
              .toLowerCase()
              .includes(
                termo
              ) ||
            item.localizacao
              .toLowerCase()
              .includes(
                termo
              ) ||
            item.numeroPatrimonio
              .toLowerCase()
              .includes(
                termo
              );

          const correspondeEstado =
            filtroEstado ===
              "todos" ||
            item.estado ===
              filtroEstado;

          return (
            correspondeBusca &&
            correspondeEstado
          );
        }
      );
    }, [
      itens,
      busca,
      filtroEstado,
    ]);

  const totalUnidades =
    itens.reduce(
      (
        total,
        item
      ) =>
        item.estado !==
        "baixado"
          ? total +
            item.quantidade
          : total,
      0
    );

  const totalManutencao =
    itens.filter(
      (item) =>
        item.estado ===
        "manutencao"
    ).length;

  const totalBaixados =
    itens.filter(
      (item) =>
        item.estado ===
        "baixado"
    ).length;

  function alterarCampo<
    K extends keyof
      NovoItemInventario
  >(
    campo: K,
    valor:
      NovoItemInventario[K]
  ) {
    setItemFormulario(
      (anterior) => ({
        ...anterior,

        [campo]:
          valor,
      })
    );
  }

  function abrirNovo() {
    setItemEditando(
      null
    );

    setItemFormulario({
      ...itemInicial,
    });

    setErro("");
    setSucesso("");

    setModalAberto(
      true
    );
  }

  function abrirEdicao(
    item: ItemInventario
  ) {
    setItemEditando(
      item
    );

    setItemFormulario({
      nome:
        item.nome,

      categoria:
        item.categoria,

      quantidade:
        item.quantidade,

      estado:
        item.estado,

      localizacao:
        item.localizacao,

      numeroPatrimonio:
        item.numeroPatrimonio,

      observacoes:
        item.observacoes,
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

    setItemEditando(
      null
    );

    setItemFormulario({
      ...itemInicial,
    });

    setErro("");
  }

  async function salvar(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !itemFormulario.nome.trim() ||
      !itemFormulario.categoria.trim() ||
      itemFormulario.quantidade <= 0
    ) {
      setErro(
        "Preencha nome, categoria e uma quantidade válida."
      );

      return;
    }

    try {
      setSalvando(
        true
      );

      setErro("");
      setSucesso("");

      if (
        itemEditando
      ) {
        await editarItemInventario(
          itemEditando.id,
          itemFormulario
        );

        setSucesso(
          "Item atualizado com sucesso."
        );
      } else {
        await cadastrarItemInventario(
          itemFormulario
        );

        setSucesso(
          "Item cadastrado com sucesso."
        );
      }

      setModalAberto(
        false
      );

      setItemEditando(
        null
      );

      setItemFormulario({
        ...itemInicial,
      });

      await carregarItens();
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível salvar o item."
      );
    } finally {
      setSalvando(
        false
      );
    }
  }

  async function remover(
    item:
      ItemInventario
  ) {
    const confirmou =
      window.confirm(
        `Deseja realmente excluir "${item.nome}"?`
      );

    if (!confirmou) {
      return;
    }

    try {
      setExcluindoId(
        item.id
      );

      setErro("");
      setSucesso("");

      await excluirItemInventario(
        item.id
      );

      setSucesso(
        "Item excluído com sucesso."
      );

      await carregarItens();
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível excluir o item."
      );
    } finally {
      setExcluindoId(
        null
      );
    }
  }

  function nomeEstado(
    estado:
      EstadoItem
  ) {
    if (
      estado ===
      "bom"
    ) {
      return "Bom";
    }

    if (
      estado ===
      "regular"
    ) {
      return "Regular";
    }

    if (
      estado ===
      "manutencao"
    ) {
      return "Manutenção";
    }

    return "Baixado";
  }

  return (
    <main
      className="inventario-page"
    >
      <MenuMobile usuario={usuario} />
      <header
        className="inventario-header"
      >
        <div>
          <p
            className="inventario-eyebrow"
          >
            CAPÍTULO DIGITAL
          </p>

          <h1>
            Inventário
          </h1>

          <p
            className="inventario-subtitle"
          >
            Controle dos bens e
            materiais do capítulo.
          </p>
        </div>

        <Link
          to="/"
          className="inventario-voltar"
        >
          ← Voltar ao Dashboard
        </Link>
      </header>

      <section
        className="inventario-resumo"
      >
        <article>
          <span>
            Unidades disponíveis
          </span>

          <strong>
            {totalUnidades}
          </strong>
        </article>

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
            Em manutenção
          </span>

          <strong
            className="inventario-alerta-numero"
          >
            {totalManutencao}
          </strong>
        </article>

        <article>
          <span>
            Baixados
          </span>

          <strong>
            {totalBaixados}
          </strong>
        </article>
      </section>

      {sucesso && (
        <div
          className="inventario-mensagem sucesso"
        >
          {sucesso}
        </div>
      )}

      {erro && (
        <div
          className="inventario-mensagem erro"
        >
          {erro}
        </div>
      )}

      <section
        className="inventario-card"
      >
        <div
          className="inventario-card-header"
        >
          <div>
            <p
              className="inventario-eyebrow"
            >
              PATRIMÔNIO
            </p>

            <h2>
              Itens cadastrados
            </h2>
          </div>

          {podeGerenciar && (
            <button
              className="inventario-novo"
              onClick={
                abrirNovo
              }
            >
              + Novo item
            </button>
          )}
        </div>

        <div
          className="inventario-filtros"
        >
          <input
            type="search"
            placeholder="Buscar item, categoria, localização ou patrimônio..."
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
              filtroEstado
            }
            onChange={(
              event
            ) =>
              setFiltroEstado(
                event
                  .target
                  .value
              )
            }
          >
            <option
              value="todos"
            >
              Todos os estados
            </option>

            <option
              value="bom"
            >
              Bom
            </option>

            <option
              value="regular"
            >
              Regular
            </option>

            <option
              value="manutencao"
            >
              Manutenção
            </option>

            <option
              value="baixado"
            >
              Baixado
            </option>
          </select>
        </div>

        {carregando ? (
          <div
            className="inventario-vazio"
          >
            Carregando inventário...
          </div>
        ) :
        itensFiltrados
          .length === 0 ? (
          <div
            className="inventario-vazio"
          >
            Nenhum item encontrado.
          </div>
        ) : (
          <div
            className="inventario-tabela-wrapper"
          >
            <table
              className="inventario-tabela"
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
                    Estado
                  </th>

                  <th>
                    Localização
                  </th>

                  <th>
                    Patrimônio
                  </th>

                  <th>
                    Observações
                  </th>

                  <th>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {itensFiltrados.map(
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
                        {item.categoria ||
                          "—"}
                      </td>

                      <td>
                        {item.quantidade}
                      </td>

                      <td>
                        <span
                          className={
                            `inventario-status ${item.estado}`
                          }
                        >
                          {nomeEstado(
                            item.estado
                          )}
                        </span>
                      </td>

                      <td>
                        {item.localizacao ||
                          "—"}
                      </td>

                      <td>
                        {item.numeroPatrimonio ||
                          "—"}
                      </td>

                      <td>
                        {item.observacoes ||
                          "—"}
                      </td>

                      <td>
                        <div
                          className="inventario-acoes"
                        >
                          {podeGerenciar && (
                            <button
                              className="inventario-editar"
                              onClick={() =>
                                abrirEdicao(
                                  item
                                )
                              }
                            >
                              Editar
                            </button>
                          )}

                          {podeExcluir && (
                            <button
                              className="inventario-excluir"
                              disabled={
                                excluindoId ===
                                item.id
                              }
                              onClick={() =>
                                remover(
                                  item
                                )
                              }
                            >
                              {excluindoId ===
                              item.id
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

      {modalAberto && (
        <div
          className="inventario-modal-overlay"
        >
          <div
            className="inventario-modal"
          >
            <div
              className="inventario-modal-header"
            >
              <div>
                <p
                  className="inventario-eyebrow"
                >
                  {itemEditando
                    ? "EDIÇÃO"
                    : "CADASTRO"}
                </p>

                <h2>
                  {itemEditando
                    ? "Editar item"
                    : "Novo item"}
                </h2>
              </div>

              <button
                type="button"
                className="inventario-fechar"
                onClick={
                  fecharModal
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                salvar
              }
            >
              <div
                className="inventario-modal-grid"
              >
                <label>
                  Nome do item

                  <input
                    value={
                      itemFormulario.nome
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "nome",
                        event
                          .target
                          .value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Categoria

                  <input
                    value={
                      itemFormulario.categoria
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "categoria",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Ex.: Mobiliário"
                    required
                  />
                </label>

                <label>
                  Quantidade

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      itemFormulario.quantidade
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "quantidade",
                        Number(
                          event
                            .target
                            .value
                        )
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Estado

                  <select
                    value={
                      itemFormulario.estado
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "estado",
                        event
                          .target
                          .value as
                          EstadoItem
                      )
                    }
                  >
                    <option
                      value="bom"
                    >
                      Bom
                    </option>

                    <option
                      value="regular"
                    >
                      Regular
                    </option>

                    <option
                      value="manutencao"
                    >
                      Manutenção
                    </option>

                    <option
                      value="baixado"
                    >
                      Baixado
                    </option>
                  </select>
                </label>

                <label>
                  Localização

                  <input
                    value={
                      itemFormulario.localizacao
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "localizacao",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Ex.: Sala principal"
                  />
                </label>

                <label>
                  Nº de patrimônio

                  <input
                    value={
                      itemFormulario.numeroPatrimonio
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "numeroPatrimonio",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Opcional"
                  />
                </label>

                <label
                  className="inventario-campo-largo"
                >
                  Observações

                  <textarea
                    value={
                      itemFormulario.observacoes
                    }
                    onChange={(
                      event
                    ) =>
                      alterarCampo(
                        "observacoes",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Informações adicionais..."
                  />
                </label>
              </div>

              <div
                className="inventario-modal-actions"
              >
                <button
                  type="button"
                  className="inventario-cancelar"
                  onClick={
                    fecharModal
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="inventario-salvar"
                  disabled={
                    salvando
                  }
                >
                  {salvando
                    ? "Salvando..."
                    : itemEditando
                    ? "Salvar alterações"
                    : "Cadastrar item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Inventario;