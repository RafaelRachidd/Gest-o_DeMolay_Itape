import "./LogoCapitulo.css";
import logoDemolay from "../assets/logo-demolay.png";

type LogoCapituloProps = {
  compact?: boolean;
  titulo?: string;
  subtitulo?: string;
};

export default function LogoCapitulo({
  compact = false,
  titulo = "Capítulo Digital",
  subtitulo = "Capítulo DeMolay de Itapetininga",
}: LogoCapituloProps) {
  return (
    <div className={`logo-capitulo ${compact ? "compact" : ""}`}>
      <img
        src={logoDemolay}
        alt="Logo da Ordem DeMolay"
        className="logo-capitulo-imagem"
      />

      <div className="logo-capitulo-texto">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>
    </div>
  );
}