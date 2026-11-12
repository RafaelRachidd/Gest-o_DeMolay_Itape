import {
  useEffect,
  useState,
} from "react";

type Tema =
  | "dark"
  | "light";

function IconeSol() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="
          M21 12.79
          A9 9 0 1 1
          11.21 3
          7 7 0 0 0
          21 12.79
        "
      />
    </svg>
  );
}

function ThemeToggle() {
  const [
    tema,
    setTema,
  ] =
    useState<Tema>(() => {
      const salvo =
        localStorage.getItem(
          "capitulo-digital-tema"
        );

      return salvo === "light"
        ? "light"
        : "dark";
    });

  useEffect(() => {
    document
      .documentElement
      .setAttribute(
        "data-theme",
        tema
      );

    localStorage.setItem(
      "capitulo-digital-tema",
      tema
    );
  }, [tema]);

  function alternarTema() {
    setTema(
      (atual) =>
        atual === "dark"
          ? "light"
          : "dark"
    );
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={
        alternarTema
      }
      title={
        tema === "dark"
          ? "Usar modo claro"
          : "Usar modo escuro"
      }
      aria-label={
        tema === "dark"
          ? "Usar modo claro"
          : "Usar modo escuro"
      }
    >
      {tema === "dark"
        ? <IconeSol />
        : <IconeLua />}
    </button>
  );
}

export default ThemeToggle;