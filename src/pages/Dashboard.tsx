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
  contarMembrosAtivos,
} from "../services/membrosService";

import {
  contarMembrosInadimplentes,
} from "../services/mensalidadesService";

import {
  calcularResumoFinanceiro,
} from "../services/financeiroService";

import {
  contarUnidadesInventario,
} from "../services/inventarioService";

import AtividadesRecentes
  from "../components/AtividadesRecentes";

import ThemeToggle
  from "../components/ThemeToggle";

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
  ] =
    useState<number | null>(
      null
    );

  const [
    inadimplentes,
    setInadimplentes,
  ] =
    useState<number | null>(
      null
    );

  const [
    saldo,
    setSaldo,
  ] =
    useState<number | null>(
      null
    );

  const [
    totalInventario,
    setTotalInventario,
  ] =
    useState<number | null>(
      null
    );

  const [
    erroResumo,
    setErroResumo,
  ] =
    useState("");

  const [
    menuMobileAberto,
    setMenuMobileAberto,
  ] =
    useState(false);

  const administrador =
    usuario.perfil ===
    "admin";

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
        totalItensInventario,
      ] =
        await Promise.all([
          contarMembrosAtivos(),
          contarMembrosInadimplentes(),
          calcularResumoFinanceiro(),
          contarUnidadesInventario(),
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

      setTotalInventario(
        totalItensInventario
      );
    } catch (error) {
      console.error(
        error
      );

      setErroResumo(
        "Não foi possível carregar alguns indicadores."
      );
    }
  }

  useEffect(() => {
    carregarResumo();
  }, []);

  async function sair() {
    await signOut(
      auth
    );
  }

  function fecharMenu() {
    setMenuMobileAberto(
      false
    );
  }

  return (
    <>
      {/* =================================================
          ESTILO DO MENU MOBILE
          Fica aqui para você não precisar mexer em CSS.
          ================================================= */}
      <style>
        {`
          .mobile-menu-button,
          .mobile-menu-header,
          .mobile-menu-overlay {
            display: none;
          }

          .dashboard-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          @media (max-width: 760px) {

            .dashboard {
              padding-bottom: 0 !important;
            }

            .dashboard-header {
              height: 68px !important;
              padding: 0 12px !important;
            }

            .dashboard-header-left {
              min-width: 0;
              gap: 9px;
            }

            .mobile-menu-button {
              width: 38px;
              height: 38px;

              flex-shrink: 0;

              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              gap: 4px;

              padding: 0;

              background: #1c1c1e;

              border: 1px solid #343438;
              border-radius: 10px;

              cursor: pointer;
            }

            .mobile-menu-button span {
              width: 17px;
              height: 2px;

              display: block;

              background: #d4af37;

              border-radius: 20px;
            }

            html[data-theme="light"]
            .mobile-menu-button {
              background: #ffffff;

              border-color: #d1d1d6;
            }

            .brand-symbol {
              width: 40px !important;
              height: 40px !important;
            }

            .brand h1 {
              font-size: 13px !important;
            }

            .brand p {
              display: none !important;
            }

            .user-area {
              gap: 7px !important;
            }

            .user-info {
              display: none !important;
            }

            .theme-toggle {
              width: 36px !important;
              height: 36px !important;
            }

            .logout-button {
              min-height: 36px;

              padding: 7px 10px !important;

              font-size: 10px;
            }

            .dashboard-layout {
              display: block !important;
            }

            .sidebar {
              position: fixed !important;

              top: 0 !important;
              left: 0 !important;
              bottom: 0 !important;
              right: auto !important;

              z-index: 300 !important;

              width: min(290px, 84vw) !important;
              height: 100vh !important;

              display: flex !important;
              flex-direction: column !important;

              padding: 16px 14px !important;

              background: #111113 !important;

              border-right: 1px solid #2c2c2e !important;
              border-top: none !important;

              transform: translateX(-105%);

              transition:
                transform 0.25s ease !important;

              box-shadow:
                18px 0 45px
                rgba(0, 0, 0, 0.35);
            }

            .sidebar.mobile-open {
              transform: translateX(0);
            }

            html[data-theme="light"]
            .sidebar {
              background: #ffffff !important;

              border-color: #dddddf !important;
            }

            .mobile-menu-header {
              display: flex;
              align-items: center;
              justify-content: space-between;

              padding:
                6px
                6px
                16px;

              margin-bottom: 8px;

              border-bottom:
                1px solid #2c2c2e;
            }

            html[data-theme="light"]
            .mobile-menu-header {
              border-color: #e4e4e6;
            }

            .mobile-menu-header strong {
              color: #f5f5f7;

              font-size: 15px;
            }

            html[data-theme="light"]
            .mobile-menu-header strong {
              color: #1c1c1e;
            }

            .mobile-menu-close {
              width: 34px;
              height: 34px;

              display: flex;
              align-items: center;
              justify-content: center;

              padding: 0;

              background: #1c1c1e;

              color: #a1a1a6;

              border: 1px solid #343438;
              border-radius: 9px;

              font-size: 20px;

              cursor: pointer;
            }

            html[data-theme="light"]
            .mobile-menu-close {
              background: #f4f4f6;

              color: #1c1c1e;

              border-color: #d1d1d6;
            }

            .sidebar nav {
              width: 100% !important;

              display: flex !important;
              flex-direction: column !important;

              gap: 6px !important;

              overflow-y: auto;
              overflow-x: hidden !important;
            }

            .sidebar .nav-item {
              width: 100% !important;
              min-width: 0 !important;

              flex: none !important;

              display: flex !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: flex-start !important;

              gap: 12px !important;

              padding: 13px 14px !important;

              font-size: 13px !important;

              text-align: left !important;
            }

            .sidebar .nav-item span {
              width: 20px !important;

              font-size: 15px !important;

              text-align: center;
            }

            .sidebar-footer {
              display: flex !important;

              margin-top: auto;
            }

            .mobile-menu-overlay {
              position: fixed;

              inset: 0;

              z-index: 290;

              display: block;

              padding: 0;

              background:
                rgba(
                  0,
                  0,
                  0,
                  0.52
                );

              border: none;

              backdrop-filter:
                blur(2px);
            }
          }
        `}
      </style>

      <main
        className="dashboard"
      >
        <header
          className="dashboard-header"
        >
          <div
            className="dashboard-header-left"
          >
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setMenuMobileAberto(
                  true
                )
              }
              aria-label="Abrir menu"
            >
              <span />
              <span />
              <span />
            </button>

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
          </div>

          <div
            className="user-area"
          >
            <ThemeToggle />

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
              onClick={
                sair
              }
            >
              Sair
            </button>
          </div>
        </header>

        <div
          className="dashboard-layout"
        >
          <aside
            className={
              `sidebar ${
                menuMobileAberto
                  ? "mobile-open"
                  : ""
              }`
            }
          >
            <div
              className="mobile-menu-header"
            >
              <strong>
                Menu
              </strong>

              <button
                type="button"
                className="mobile-menu-close"
                onClick={
                  fecharMenu
                }
                aria-label="Fechar menu"
              >
                ×
              </button>
            </div>

            <nav>
              <Link
                to="/"
                className="nav-item active"
                onClick={
                  fecharMenu
                }
              >
                <span>
                  ⌂
                </span>

                Dashboard
              </Link>

              <Link
                to="/membros"
                className="nav-item"
                onClick={
                  fecharMenu
                }
              >
                <span>
                  ♙
                </span>

                Membros
              </Link>

              <Link
                to="/financeiro"
                className="nav-item"
                onClick={
                  fecharMenu
                }
              >
                <span>
                  $
                </span>

                Financeiro
              </Link>

              <Link
                to="/inadimplencias"
                className="nav-item"
                onClick={
                  fecharMenu
                }
              >
                <span>
                  !
                </span>

                Inadimplências
              </Link>

              <Link
                to="/inventario"
                className="nav-item"
                onClick={
                  fecharMenu
                }
              >
                <span>
                  □
                </span>

                Inventário
              </Link>

              <Link
                to="/relatorios"
                className="nav-item"
                onClick={
                  fecharMenu
                }
              >
                <span>
                  ▤
                </span>

                Relatórios
              </Link>

              {administrador && (
                <Link
                  to="/usuarios"
                  className="nav-item"
                  onClick={
                    fecharMenu
                  }
                >
                  <span>
                    ⚙
                  </span>

                  Usuários
                </Link>
              )}
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

          {menuMobileAberto && (
            <button
              type="button"
              className="mobile-menu-overlay"
              onClick={
                fecharMenu
              }
              aria-label="Fechar menu"
            />
          )}

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
                  marginTop:
                    "18px",

                  color:
                    "#ff453a",

                  fontSize:
                    "12px",
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
                  {membrosAtivos ===
                  null
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
                  {inadimplentes ===
                  null
                    ? "..."
                    : inadimplentes}
                </strong>

                <small>
                  Membros com mensalidades
                  vencidas
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
                  Tesouraria e Hospitalaria
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
                  {totalInventario ===
                  null
                    ? "..."
                    : totalInventario}
                </strong>

                <small>
                  Unidades registradas
                  no patrimônio
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
                        Cadastrar e consultar membros
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

                  <Link
                    to="/inventario"
                    className="quick-action"
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
                  </Link>

                  <Link
                    to="/relatorios"
                    className="quick-action"
                  >
                    <div
                      className="quick-icon"
                    >
                      ▤
                    </div>

                    <div>
                      <strong>
                        Relatórios
                      </strong>

                      <span>
                        Visão consolidada
                        do capítulo
                      </span>
                    </div>

                    <span
                      className="arrow"
                    >
                      ›
                    </span>
                  </Link>

                  {administrador && (
                    <Link
                      to="/usuarios"
                      className="quick-action"
                    >
                      <div
                        className="quick-icon"
                      >
                        ⚙
                      </div>

                      <div>
                        <strong>
                          Usuários
                        </strong>

                        <span>
                          Acessos e permissões
                        </span>
                      </div>

                      <span
                        className="arrow"
                      >
                        ›
                      </span>
                    </Link>
                  )}
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

                <AtividadesRecentes />
              </article>
            </section>
          </section>
        </div>
      </main>
    </>
  );
}

export default Dashboard;