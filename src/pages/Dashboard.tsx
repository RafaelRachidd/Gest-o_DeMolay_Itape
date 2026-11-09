import { signOut } from "firebase/auth";
import { Link } from "react-router";

import { auth } from "../services/firebase";
import type { Usuario } from "../types/Usuario";

import "./Dashboard.css";

interface DashboardProps {
  usuario: Usuario;
}

function Dashboard({ usuario }: DashboardProps) {
  async function sair() {
    await signOut(auth);
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-symbol">△</div>

          <div>
            <h1>Capítulo Digital</h1>
            <p>Capítulo DeMolay de Itapetininga</p>
          </div>
        </div>

        <div className="user-area">
          <div className="user-info">
            <strong>{usuario.nome}</strong>
            <span>{usuario.perfil}</span>
          </div>

          <button className="logout-button" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <nav>
            <Link to="/" className="nav-item active">
              <span>⌂</span>
              Dashboard
            </Link>

            <Link to="/membros" className="nav-item">
              <span>♙</span>
              Membros
            </Link>

            <button className="nav-item" disabled>
              <span>$</span>
              Financeiro
            </button>

            <button className="nav-item" disabled>
              <span>!</span>
              Inadimplências
            </button>

            <button className="nav-item" disabled>
              <span>□</span>
              Inventário
            </button>

            <button className="nav-item" disabled>
              <span>▤</span>
              Relatórios
            </button>
          </nav>

          <div className="sidebar-footer">
            <span>Capítulo Digital</span>
            <small>Versão em desenvolvimento</small>
          </div>
        </aside>

        <section className="dashboard-content">
          <div className="welcome">
            <div>
              <p className="eyebrow">PAINEL ADMINISTRATIVO</p>

              <h2>
                Olá, {usuario.nome}.
              </h2>

              <p>
                Veja um resumo das principais informações do capítulo.
              </p>
            </div>

            <span className="profile-badge">
              {usuario.perfil}
            </span>
          </div>

          <section className="summary-grid">
            <article className="summary-card">
              <div className="card-top">
                <span>Membros ativos</span>
                <div className="card-icon">♙</div>
              </div>

              <strong>—</strong>

              <small>
                Aguardando dados cadastrados
              </small>
            </article>

            <article className="summary-card danger-card">
              <div className="card-top">
                <span>Inadimplentes</span>
                <div className="card-icon danger">!</div>
              </div>

              <strong>—</strong>

              <small>
                Aguardando módulo financeiro
              </small>
            </article>

            <article className="summary-card">
              <div className="card-top">
                <span>Saldo em caixa</span>
                <div className="card-icon">$</div>
              </div>

              <strong>—</strong>

              <small>
                Aguardando lançamentos
              </small>
            </article>

            <article className="summary-card">
              <div className="card-top">
                <span>Inventário</span>
                <div className="card-icon">□</div>
              </div>

              <strong>—</strong>

              <small>
                Aguardando itens cadastrados
              </small>
            </article>
          </section>

          <section className="dashboard-columns">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">
                    ACESSOS RÁPIDOS
                  </p>

                  <h3>Gestão do capítulo</h3>
                </div>
              </div>

              <div className="quick-actions">
                <Link
                  to="/membros"
                  className="quick-action"
                >
                  <div className="quick-icon">♙</div>

                  <div>
                    <strong>Membros</strong>
                    <span>
                      Cadastrar e consultar membros
                    </span>
                  </div>

                  <span className="arrow">›</span>
                </Link>

                <button
                  className="quick-action"
                  disabled
                >
                  <div className="quick-icon">$</div>

                  <div>
                    <strong>Financeiro</strong>
                    <span>
                      Entradas e saídas
                    </span>
                  </div>

                  <span className="arrow">›</span>
                </button>

                <button
                  className="quick-action"
                  disabled
                >
                  <div className="quick-icon">□</div>

                  <div>
                    <strong>Inventário</strong>
                    <span>
                      Bens do capítulo
                    </span>
                  </div>

                  <span className="arrow">›</span>
                </button>
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">
                    ATIVIDADE
                  </p>

                  <h3>Atividades recentes</h3>
                </div>
              </div>

              <div className="empty-state">
                <div className="empty-icon">◇</div>

                <strong>
                  Nenhuma atividade registrada
                </strong>

                <p>
                  As movimentações do sistema aparecerão aqui.
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