import { signOut } from "firebase/auth";
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
        <div>
          <span className="dashboard-logo">
            △
          </span>

          <div>
            <h1>Capítulo Digital</h1>
            <p>
              Capítulo DeMolay de Itapetininga
            </p>
          </div>
        </div>

        <div className="dashboard-user">
          <div>
            <strong>{usuario.nome}</strong>
            <span>{usuario.perfil}</span>
          </div>

          <button onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-title">
          <div>
            <h2>Painel Administrativo</h2>

            <p>
              Visão geral da gestão capitular
            </p>
          </div>
        </div>

        <div className="dashboard-cards">
          <article className="dashboard-card">
            <span>Membros ativos</span>
            <strong>—</strong>
            <small>Em breve</small>
          </article>

          <article className="dashboard-card">
            <span>Inadimplentes</span>
            <strong>—</strong>
            <small>Em breve</small>
          </article>

          <article className="dashboard-card">
            <span>Saldo em caixa</span>
            <strong>—</strong>
            <small>Em breve</small>
          </article>

          <article className="dashboard-card">
            <span>Inventário</span>
            <strong>—</strong>
            <small>Em breve</small>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;