import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import "./Login.css";

interface Usuario {
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
}

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      const usuarioRef = doc(
        db,
        "usuarios",
        credencial.user.uid
      );

      const usuarioSnap = await getDoc(usuarioRef);

      if (!usuarioSnap.exists()) {
        await signOut(auth);
        setErro("Usuário não possui perfil cadastrado.");
        return;
      }

      const dados = usuarioSnap.data() as Usuario;

      if (!dados.ativo) {
        await signOut(auth);
        setErro("Este usuário está desativado.");
        return;
      }

      setUsuario(dados);
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    await signOut(auth);
    setUsuario(null);
    setEmail("");
    setSenha("");
  }

  if (usuario) {
    return (
      <main className="login-container">
        <section className="login-card">
          <span className="login-symbol">△</span>

          <h1>Bem-vindo</h1>

          <p className="login-subtitle">
            {usuario.nome}
          </p>

          <div className="usuario-info">
            <span>Perfil</span>
            <strong>{usuario.perfil}</strong>
          </div>

          <button
            className="login-button"
            onClick={sair}
          >
            Sair
          </button>
        </section>
      </main>
    );
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

          {erro && (
            <p className="login-error">
              {erro}
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