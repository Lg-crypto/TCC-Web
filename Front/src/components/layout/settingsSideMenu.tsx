import { useState } from "react";
import styles from "./settingsSideMenu.module.css";
import { LuSlidersVertical, LuShield, LuInfo, LuTrash2,  LuCircleHelp, LuUser, LuArrowLeft } from "react-icons/lu";
import { Link, NavLink } from "react-router-dom";
import ModalMessage from "./modalMessage";
import PrivacyPolicy from "./PrivacyPolicy";

export default function SettingsSideMenu () {
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    return(
        <aside className={styles.container}>
            <div className={styles.miniHeader}>
                <div className={styles.icon}>
                    <LuUser size={30}/>
                </div>
                <div className={styles.miniHeaderTexts}>
                    <h2 className={styles.title}>Configurações</h2>
                    <h5 className={styles.subtitle}>Conta</h5>
                </div>
            </div>

            <nav className={styles.optionsContainer}>
                <h5 className={styles.subtitle}>Conta</h5>
                <NavLink to={'/profile/'} className={styles.option}>
                    <LuUser size={20}/> Conta
                </NavLink>
                <NavLink to={'/profile/settings'} className={styles.option}>
                    <LuSlidersVertical size={20}/> Preferências
                </NavLink>
                <button type="button" className={styles.option} onClick={() => setPrivacyOpen(true)}>
                    <LuShield size={20}/> Privacidade
                </button>

                <h5 className={styles.subtitle}>Sobre</h5>
                <NavLink to={'/about'} className={styles.option}>
                    <LuInfo size={20}/> Sobre nós
                </NavLink>

                <h5 className={styles.subtitle}>Ações</h5>                
                <Link to={'/profile#delete-account'} className={`${styles.option} ${styles.deleteAccount}`}>
                    <LuTrash2 size={20}/> Apagar conta
                </Link>
                <button type="button" className={`${styles.option} ${styles.help}`} onClick={() => setHelpOpen(true)}>
                    <LuCircleHelp size={20}/> Precisa de ajuda? Acesse o centro de ajuda.
                </button>
                <NavLink to={'/home'} className={(styles.option) +" "+ (styles.back)}>
                    <LuArrowLeft size={20}/>
                </NavLink>
            </nav>
            <ModalMessage isOpen={privacyOpen} title="Política de privacidade" onClose={() => setPrivacyOpen(false)} className={styles.policyModal}>
                <PrivacyPolicy />
            </ModalMessage>
            <ModalMessage isOpen={helpOpen} title="Central de ajuda" onClose={() => setHelpOpen(false)}>
                <div className={styles.helpContent}>
                    <h3>Acesso à conta</h3>
                    <p>Se esqueceu sua senha, use “Esqueci minha senha” na tela de login para receber as instruções por e-mail.</p>
                    <h3>Segurança e dados</h3>
                    <p>Na seção Conta você pode trocar a senha ou iniciar a exclusão permanente da conta e dos registros associados.</p>
                    <p>Para falar com a equipe responsável, use o canal de contato da instituição ou da equipe que disponibilizou esta instalação.</p>
                    <Link to="/" onClick={() => setHelpOpen(false)}>Ir para a tela de login</Link>
                </div>
            </ModalMessage>
        </aside>
    )
}
