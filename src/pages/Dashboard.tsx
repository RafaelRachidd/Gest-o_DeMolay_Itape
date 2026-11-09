import {
  useEffect,
  useState,
} from "react";

import {
  signOut,
} from "firebase/auth";

import {
  Link,
} from "react-router";

import {
  auth,
} from "../services/firebase";

import {
  contarInadimplentes,
  contarMembrosAtivos,
} from "../services/membrosService";

import {
  calcularResumoFinanceiro,
} from "../services/financeiroService";

import type {
  Usuario,
} from "../types/Usuario";

import "./Dashboard.css";

interface DashboardProps {
  usuario: Usuario;
}

function Dashboard({
  usuario,
}: DashboardProps) {
  const [
    membrosAtivos,
    setMembrosAtivos,
  ] = useState<number | null>(
    null
  );

  const [
    inadimplentes,
    setInadimplentes,
  ] = useState<number | null>(
    null
  );

  const [
    saldo,
    setSaldo,
  ] = useState<number | null>(
    null
  );

  const [
    erroResumo,
    setErroResumo,
  ] = useState("");

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

  async function carregarResumo() {
    try {
      setErroResumo("");

      const [
        totalAtivos,
        totalInadimplentes,
        resumoFinanceiro,
      ] = await Promise.all([
        contarMembrosAtivos(),
        contarInadimplentes(),
        calcularResumoFinanceiro(),
      ]);

      setMembrosAtivos(
        totalAtivos
      );

      setInadimplentes(
        totalInadimplentes
      );

      setSaldo(
        resumoFinanceiro.saldo
      );
    } catch (error) {
      console.error(error);

      setErroResumo(
        "Não foi possível carregar alguns indicadores."
      );
    }
  }

  useEffect(() => {
    carregarResumo();
  }, []);

  async function sair() {
    await signOut(auth);
  }

  return (
    <main
      className="dashboard"
    >
      <header
        className="dashboard-header"
      >
        <div
          className="brand"
        >
          <div
            className="brand-symbol"
          >
            △
          </div>

          <div>
            <h1>
              Capítulo Digital
            </h1>

            <p>
              Capítulo DeMolay de
              Itapetininga
            </p>
          </div>
        </div>

        <div
          className="user-area"
        >
          <div
            className="user-info"
          >
            <strong>
              {usuario.nome}
            </strong>

            <span>
              {usuario.perfil}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={sair}
          >
            Sair
          </button>
        </div>
      </header>

      <div
        className="dashboard-layout"
      >
        <aside
          className="sidebar"
        >
          <nav>
            <Link
              to="/"
              className="nav-item active"
            >
              <span>
                ⌂
              </span>

              Dashboard
            </Link>

            <Link
              to="/membros"
              className="nav-item"
            >
              <span>
                ♙
              </span>

              Membros
            </Link>

            <Link
              to="/financeiro"
              className="nav-item"
            >
              <span>
                $
              </span>

              Financeiro
            </Link>

            <button
              className="nav-item"
              disabled
            >
              <span>
                !
              </span>

              Inadimplências
            </button>

            <button
              className="nav-item"
              disabled
            >
              <span>
                □
              </span>

              Inventário
            </button>

            <button
              className="nav-item"
              disabled
            >
              <span>
                ▤
              </span>

              Relatórios
            </button>
          </nav>

          <div
            className="sidebar-footer"
          >
            <span>
              Capítulo Digital
            </span>

            <small>
              Versão em desenvolvimento
            </small>
          </div>
        </aside>

        <section
          className="dashboard-content"
        >
          <div
            className="welcome"
          >
            <div>
              <p
                className="eyebrow"
              >
                PAINEL ADMINISTRATIVO
              </p>

              <h2>
                Olá, {usuario.nome}.
              </h2>

              <p>
                Veja um resumo das
                principais informações
                do capítulo.
              </p>
            </div>

            <span
              className="profile-badge"
            >
              {usuario.perfil}
            </span>
          </div>

          {erroResumo && (
            <p
              style={{
                marginTop: "18px",
                color: "#ff453a",
                fontSize: "12px",
              }}
            >
              {erroResumo}
            </p>
          )}

          <section
            className="summary-grid"
          >
            <article
              className="summary-card"
            >
              <div
                className="card-top"
              >
                <span>
                  Membros ativos
                </span>

                <div
                  className="card-icon"
                >
                  ♙
                </div>
              </div>

              <strong>
                {membrosAtivos === null
                  ? "..."
                  : membrosAtivos}
              </strong>

              <small>
                Membros atualmente
                ativos no capítulo
              </small>
            </article>

            <article
              className="summary-card danger-card"
            >
              <div
                className="card-top"
              >
                <span>
                  Inadimplentes
                </span>

                <div
                  className="card-icon danger"
                >
                  !
                </div>
              </div>

              <strong>
                {inadimplentes === null
                  ? "..."
                  : inadimplentes}
              </strong>

              <small>
                Membros com situação
                financeira pendente
              </small>
            </article>

            <article
              className="summary-card"
            >
              <div
                className="card-top"
              >
                <span>
                  Saldo em caixa
                </span>

                <div
                  className="card-icon"
                >
                  $
                </div>
              </div>

              <strong
                style={{
                  color:
                    saldo !== null &&
                    saldo < 0
                      ? "#ff453a"
                      : undefined,
                }}
              >
                {saldo === null
                  ? "..."
                  : formatarMoeda(
                      saldo
                    )}
              </strong>

              <small>
                Entradas menos saídas
                registradas
              </small>
            </article>

            <article
              className="summary-card"
            >
              <div
                className="card-top"
              >
                <span>
                  Inventário
                </span>

                <div
                  className="card-icon"
                >
                  □
                </div>
              </div>

              <strong>
                —
              </strong>

              <small>
                Aguardando itens
                cadastrados
              </small>
            </article>
          </section>

          <section
            className="dashboard-columns"
          >
            <article
              className="panel"
            >
              <div
                className="panel-header"
              >
                <div>
                  <p
                    className="eyebrow"
                  >
                    ACESSOS RÁPIDOS
                  </p>

                  <h3>
                    Gestão do capítulo
                  </h3>
                </div>
              </div>

              <div
                className="quick-actions"
              >
                <Link
                  to="/membros"
                  className="quick-action"
                >
                  <div
                    className="quick-icon"
                  >
                    ♙
                  </div>

                  <div>
                    <strong>
                      Membros
                    </strong>

                    <span>
                      Cadastrar e
                      consultar membros
                    </span>
                  </div>

                  <span
                    className="arrow"
                  >
                    ›
                  </span>
                </Link>

                <Link
                  to="/financeiro"
                  className="quick-action"
                >
                  <div
                    className="quick-icon"
                  >
                    $
                  </div>

                  <div>
                    <strong>
                      Financeiro
                    </strong>

                    <span>
                      Entradas e saídas
                    </span>
                  </div>

                  <span
                    className="arrow"
                  >
                    ›
                  </span>
                </Link>

                <button
                  className="quick-action"
                  disabled
                >
                  <div
                    className="quick-icon"
                  >
                    □
                  </div>

                  <div>
                    <strong>
                      Inventário
                    </strong>

                    <span>
                      Bens do capítulo
                    </span>
                  </div>

                  <span
                    className="arrow"
                  >
                    ›
                  </span>
                </button>
              </div>
            </article>

            <article
              className="panel"
            >
              <div
                className="panel-header"
              >
                <div>
                  <p
                    className="eyebrow"
                  >
                    ATIVIDADE
                  </p>

                  <h3>
                    Atividades recentes
                  </h3>
                </div>
              </div>

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
                  sistema aparecerão
                  aqui.
                </p>
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;