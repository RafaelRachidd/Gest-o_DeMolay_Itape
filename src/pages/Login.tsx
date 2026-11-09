import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import "./Login.css";

interface LoginProps {
  mensagemSistema?: string;
}

function Login({ mensagemSistema }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-container">
      <section className="login-card">
        <span className="login-symbol">△</span>

        <h1>Capítulo Digital</h1>

        <p className="login-subtitle">
          Capítulo DeMolay de Itapetininga
        </p>

        <form onSubmit={entrar}>
          <div className="form-group">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              placeholder="Digite sua senha"
              required
            />
          </div>

          {(erro || mensagemSistema) && (
            <p className="login-error">
              {erro || mensagemSistema}
            </p>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={carregando}
          >
            {carregando
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>

        <p className="login-footer">
          Acesso restrito aos membros autorizados
        </p>
      </section>
    </main>
  );
}

export default Login;