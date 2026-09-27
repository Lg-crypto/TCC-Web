import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { IoPersonCircle } from "react-icons/io5";
import { LuChartNoAxesColumn, LuHouse, LuLogOut, LuPlus, LuSettings } from "react-icons/lu";
import { auth } from "../../services/firebase";
import styles from "./sideMenu.module.css";

export default function SideMenu() {
  const navigate = useNavigate();
  const [saindo, setSaindo] = useState(false);
  const [erroLogout, setErroLogout] = useState("");

  const encerrarSessao = async () => {
    setSaindo(true);
    setErroLogout("");
    try {
      // signOut recebe a instância Auth do Firebase, encerra a sessão atual e resolve sem valor.
      await signOut(auth);
      navigate("/", { replace: true });
    } catch {
      setErroLogout("Não foi possível sair da conta. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  };

  return (
    <aside className={styles.container}>
      <nav className={styles.navigation} aria-label="Navegação principal">
        <NavLink to="/profile" aria-label="Perfil" className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ""}`}>
          <IoPersonCircle size={25} />
        </NavLink>
        <NavLink to="/" aria-label="Início" className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ""}`}>
          <LuHouse size={22} />
        </NavLink>
        <NavLink to="/home" aria-label="Painel financeiro" className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ""}`}>
          <LuChartNoAxesColumn size={22} />
        </NavLink>
        <NavLink to="/newrecord" aria-label="Nova transação" className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ""}`}>
          <LuPlus size={22} />
        </NavLink>
        <NavLink to="/about" aria-label="Sobre o projeto" className={({ isActive }) => `${styles.link} ${styles.aboutButton} ${isActive ? styles.activeLink : ""}`}>
          <LuSettings size={22} />
        </NavLink>
        <button className={`${styles.link} ${styles.logoutButton}`} type="button" onClick={encerrarSessao} disabled={saindo} aria-label="Sair da conta" title="Sair da conta">
          <LuLogOut size={21} />
        </button>
        {erroLogout && <span className={styles.logoutError} role="alert">{erroLogout}</span>}
      </nav>
    </aside>
  );
}
