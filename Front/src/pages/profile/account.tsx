import { useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  LuBadgeCheck,
  LuMail,
  LuPhone,
  LuShieldCheck,
  LuUserRound,
} from "react-icons/lu";
import SettingsSideMenu from "../../components/layout/settingsSideMenu";
import Window from "../../components/layout/window";
import { auth } from "../../services/firebase";
import styles from "./account.module.css";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function getProviderName(user: User) {
  const provider = user.providerData[0]?.providerId;
  if (provider === "google.com") return "Google";
  if (provider === "password") return "E-mail e senha";
  if (provider === "phone") return "Telefone";
  return "Conta FinanControl";
}

export default function Account() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [failedImageUid, setFailedImageUid] = useState<string | null>(null);
  const imageFailed = Boolean(user && failedImageUid === user.uid);

  // onAuthStateChanged recebe Auth e callback de User|null; o retorno cancela a observação ao desmontar.
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const profile = useMemo(() => {
    const displayName =
      user?.displayName?.trim() || user?.email?.split("@")[0] || "Usuário";
    const nameParts = displayName.split(" ").filter(Boolean);
    return {
      displayName,
      firstName: nameParts[0] || "Não informado",
      lastName: nameParts.slice(1).join(" ") || "Não informado",
    };
  }, [user]);

  return (
    <section className={styles.container}>
      <SettingsSideMenu />
      <Window width="65vw" height="90vh" className={styles.content}>
        {user ? (
          <>
            <header className={styles.panel}>
              <div className={styles.cover} />
              <div className={styles.avatar}>
                {user.photoURL && !imageFailed ? (
                  <img
                    src={user.photoURL}
                    alt={`Foto de perfil de ${profile.displayName}`}
                    onError={() => setFailedImageUid(user.uid)}
                  />
                ) : (
                  <span>{getInitials(profile.displayName)}</span>
                )}
              </div>
              <div className={styles.profileHeading}>
                <h1>{profile.displayName}</h1>
                <p>{getProviderName(user)}</p>
              </div>
            </header>
            <div className={styles.infos}>
              <InfoItem
                icon={<LuUserRound />}
                label="Primeiro nome"
                value={profile.firstName}
              />
              <InfoItem
                icon={<LuUserRound />}
                label="Último nome"
                value={profile.lastName}
              />
              <InfoItem
                icon={<LuMail />}
                label="Endereço de e-mail"
                value={user.email || "Não informado"}
              />
              <InfoItem
                icon={<LuPhone />}
                label="Número de telefone"
                value={user.phoneNumber || "Não informado"}
              />
              <InfoItem
                icon={<LuBadgeCheck />}
                label="E-mail verificado"
                value={
                  user.emailVerified ? "Verificado" : "Ainda não verificado"
                }
              />
              <InfoItem
                icon={<LuShieldCheck />}
                label="ID da conta"
                value={user.uid}
                mono
              />
            </div>
            <p className={styles.readOnlyNotice}>
              Estas informações estão disponíveis apenas para consulta por
              enquanto.
            </p>
          </>
        ) : (
          <div className={styles.loading}>Carregando dados da conta…</div>
        )}
      </Window>
    </section>
  );
}

interface InfoItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}

function InfoItem({ icon, label, value, mono = false }: InfoItemProps) {
  return (
    <article className={styles.info}>
      <span className={styles.infoIcon}>{icon}</span>
      <div>
        <h2>{label}</h2>
        <p className={mono ? styles.mono : ""}>{value}</p>
      </div>
    </article>
  );
}
