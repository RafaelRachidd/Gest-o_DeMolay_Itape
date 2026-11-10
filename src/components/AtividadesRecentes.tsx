import {
  useEffect,
  useState,
} from "react";

import {
  listarAtividadesRecentes,
  type AtividadeRecente,
} from "../services/atividadesService";

import "./AtividadesRecentes.css";

function AtividadesRecentes() {
  const [
    atividades,
    setAtividades,
  ] =
    useState<
      AtividadeRecente[]
    >([]);

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

  useEffect(() => {
    async function carregar() {
      try {
        setErro("");

        const resultado =
          await listarAtividadesRecentes(
            6
          );

        setAtividades(
          resultado
        );
      } catch (error) {
        console.error(
          error
        );

        setErro(
          "Não foi possível carregar as atividades."
        );
      } finally {
        setCarregando(
          false
        );
      }
    }

    carregar();
  }, []);

  function icone(
    modulo:
      AtividadeRecente["modulo"]
  ) {
    if (
      modulo ===
      "financeiro"
    ) {
      return "$";
    }

    if (
      modulo ===
      "mensalidades"
    ) {
      return "!";
    }

    if (
      modulo ===
      "inventario"
    ) {
      return "□";
    }

    return "♙";
  }

  function tempoRelativo(
    data: Date
  ) {
    const agora =
      new Date();

    const diferenca =
      agora.getTime() -
      data.getTime();

    const minutos =
      Math.floor(
        diferenca /
        60000
      );

    if (
      minutos < 1
    ) {
      return "agora";
    }

    if (
      minutos < 60
    ) {
      return `há ${minutos} min`;
    }

    const horas =
      Math.floor(
        minutos / 60
      );

    if (
      horas < 24
    ) {
      return horas === 1
        ? "há 1 hora"
        : `há ${horas} horas`;
    }

    const dias =
      Math.floor(
        horas / 24
      );

    if (
      dias < 7
    ) {
      return dias === 1
        ? "há 1 dia"
        : `há ${dias} dias`;
    }

    return data.toLocaleDateString(
      "pt-BR"
    );
  }

  if (carregando) {
    return (
      <div
        className="atividades-status"
      >
        Carregando atividades...
      </div>
    );
  }

  if (erro) {
    return (
      <div
        className="atividades-status erro"
      >
        {erro}
      </div>
    );
  }

  if (
    atividades.length ===
    0
  ) {
    return (
      <div
        className="empty-state"
      >
        <div
          className="empty-icon"
        >
          ◇
        </div>

        <strong>
          Nenhuma atividade
          registrada
        </strong>

        <p>
          As movimentações do
          sistema aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div
      className="atividades-lista"
    >
      {atividades.map(
        (atividade) => (
          <div
            className="atividade-item"
            key={
              atividade.id
            }
          >
            <div
              className={
                `atividade-icone ${atividade.modulo}`
              }
            >
              {icone(
                atividade.modulo
              )}
            </div>

            <div
              className="atividade-conteudo"
            >
              <strong>
                {
                  atividade.titulo
                }
              </strong>

              <span>
                {
                  atividade.descricao
                }
              </span>
            </div>

            <small>
              {tempoRelativo(
                atividade.data
              )}
            </small>
          </div>
        )
      )}
    </div>
  );
}

export default AtividadesRecentes;