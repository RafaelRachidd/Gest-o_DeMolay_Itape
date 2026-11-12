import {
  useEffect,
  useState,
} from "react";

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
import Financeiro from "./pages/Financeiro";
import Inadimplencias from "./pages/Inadimplencias";
import Inventario from "./pages/Inventario";
import Relatorios from "./pages/Relatorios";

import {
  auth,
  db,
} from "./services/firebase";

import type {
  Usuario,
} from "./types/Usuario";

import "./LogoInterna.css";
import "./Tema.css";

function App() {
  const [
    usuario,
    setUsuario,
  ] =
    useState<Usuario | null>(
      null
    );

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
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (
          firebaseUser
        ) => {
          setErro("");

          if (!firebaseUser) {
            setUsuario(null);
            setCarregando(false);

            return;
          }

          try {
            const referencia =
              doc(
                db,
                "usuarios",
                firebaseUser.uid
              );

            const snapshot =
              await getDoc(
                referencia
              );

            if (
              !snapshot.exists()
            ) {
              setErro(
                "Usuário sem perfil cadastrado."
              );

              await signOut(
                auth
              );

              return;
            }

            const dados =
              snapshot.data() as Usuario;

            if (!dados.ativo) {
              setErro(
                "Este usuário está desativado."
              );

              await signOut(
                auth
              );

              return;
            }

            setUsuario(
              dados
            );
          } catch (error) {
            console.error(
              error
            );

            setErro(
              "Não foi possível carregar o usuário."
            );

            setUsuario(
              null
            );
          } finally {
            setCarregando(
              false
            );
          }
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  if (carregando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#d4af37",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return (
      <Login
        mensagemSistema={
          erro
        }
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            usuario={
              usuario
            }
          />
        }
      />

      <Route
        path="/membros"
        element={
          <Membros
            usuario={
              usuario
            }
          />
        }
      />

      <Route
        path="/financeiro"
        element={
          <Financeiro
            usuario={
              usuario
            }
          />
        }
      />

      <Route
        path="/inadimplencias"
        element={
          <Inadimplencias
            usuario={
              usuario
            }
          />
        }
      />

      <Route
        path="/inventario"
        element={
          <Inventario
            usuario={
              usuario
            }
          />
        }
      />

      <Route
        path="/relatorios"
        element={
          <Relatorios
            usuario={
              usuario
            }
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;