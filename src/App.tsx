import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Membros from "./pages/Membros";

import { auth, db } from "./services/firebase";

import type { Usuario } from "./types/Usuario";

function App() {
  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setErro("");

        if (!firebaseUser) {
          setUsuario(null);
          setCarregando(false);
          return;
        }

        try {
          const usuarioRef = doc(
            db,
            "usuarios",
            firebaseUser.uid
          );

          const usuarioSnap =
            await getDoc(usuarioRef);

          if (!usuarioSnap.exists()) {
            setErro(
              "Usuário sem perfil cadastrado."
            );

            await signOut(auth);
            return;
          }

          const dados =
            usuarioSnap.data() as Usuario;

          if (!dados.ativo) {
            setErro(
              "Este usuário está desativado."
            );

            await signOut(auth);
            return;
          }

          setUsuario(dados);
        } catch {
          setErro(
            "Não foi possível carregar o usuário."
          );

          setUsuario(null);
        } finally {
          setCarregando(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  if (carregando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0d",
          color: "#d4af37",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return (
      <Login mensagemSistema={erro} />
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard usuario={usuario} />
        }
      />

      <Route
        path="/membros"
        element={
          <Membros usuario={usuario} />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;