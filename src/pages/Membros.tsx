import type { Usuario } from "../types/Usuario";
import "./Membros.css";

interface MembrosProps {
  usuario: Usuario;
}

function Membros({ usuario }: MembrosProps) {
  return (
    <main>
      <h1>Gestão de Membros</h1>
      <p>Usuário: {usuario.nome}</p>
    </main>
  );
}

export default Membros;