import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router";

import type {
  Usuario,
} from "../types/Usuario";

import "./MenuMobile.css";

interface MenuMobileProps {
  usuario: Usuario;
}

function MenuMobile({
  usuario,
}: MenuMobileProps) {
  const [
    aberto,
    setAberto,
  ] =
    useState(false);

  const location =
    useLocation();

  const administrador =
    usuario.perfil ===
    "admin";

  useEffect(() => {
    if (!aberto) {
      return;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function fecharComEsc(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setAberto(false);
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEsc
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        fecharComEsc
      );
    };
  }, [aberto]);

  function fechar() {
    setAberto(false);
  }

  function classeLink(
    caminho: string
  ) {
    return location.pathname ===
      caminho
      ? "menu-mobile-link ativo"
      : "menu-mobile-link";
  }

  return (
    <div
      className="menu-mobile"
    >
      <button
        type="button"
        className="menu-mobile-trigger"
        onClick={() =>
          setAberto(true)
        }
        aria-label="Abrir menu"
      >
        <span />
        <span />
        <span />
      </button>

      {aberto && (
        <button
          type="button"
          className="menu-mobile-overlay"
          onClick={
            fechar
          }
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={
          `menu-mobile-drawer ${
            aberto
              ? "aberto"
              : ""
          }`
        }
      >
        <div
          className="menu-mobile-header"
        >
          <div>
            <strong>
              Capítulo Digital
            </strong>

            <span>
              Menu principal
            </span>
          </div>

          <button
            type="button"
            className="menu-mobile-fechar"
            onClick={
              fechar
            }
            aria-label="Fechar menu"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav
          className="menu-mobile-nav"
        >
          <Link
            to="/"
            className={
              classeLink("/")
            }
            onClick={
              fechar
            }
          >
            Dashboard
          </Link>

          <Link
            to="/membros"
            className={
              classeLink(
                "/membros"
              )
            }
            onClick={
              fechar
            }
          >
            Membros
          </Link>

          <Link
            to="/financeiro"
            className={
              classeLink(
                "/financeiro"
              )
            }
            onClick={
              fechar
            }
          >
            Financeiro
          </Link>

          <Link
            to="/inadimplencias"
            className={
              classeLink(
                "/inadimplencias"
              )
            }
            onClick={
              fechar
            }
          >
            Inadimplências
          </Link>

          <Link
            to="/inventario"
            className={
              classeLink(
                "/inventario"
              )
            }
            onClick={
              fechar
            }
          >
            Inventário
          </Link>

          <Link
            to="/relatorios"
            className={
              classeLink(
                "/relatorios"
              )
            }
            onClick={
              fechar
            }
          >
            Relatórios
          </Link>

          {administrador && (
            <Link
              to="/usuarios"
              className={
                classeLink(
                  "/usuarios"
                )
              }
              onClick={
                fechar
              }
            >
              Usuários
            </Link>
          )}
        </nav>

        <div
          className="menu-mobile-footer"
        >
          <strong>
            {usuario.nome}
          </strong>

          <span>
            {usuario.perfil}
          </span>
        </div>
      </aside>
    </div>
  );
}

export default MenuMobile;