import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  type User,
} from "firebase/auth";
import {
  LuBadgeCheck,
  LuMail,
  LuPhone,
  LuShieldCheck,
  LuUserRound,
} from "react-icons/lu";
import SettingsSideMenu from "../../components/layout/settingsSideMenu";
import ModalMessage from "../../components/layout/modalMessage";
import Window from "../../components/layout/window";
import { auth } from "../../services/firebase";
import { deleteAccountData } from "../../services/account";
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
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [failedImageUid, setFailedImageUid] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const imageFailed = Boolean(user && failedImageUid === user.uid);

  // onAuthStateChanged recebe Auth e callback de User|null; o retorno cancela a observação ao desmontar.
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (location.hash !== "#delete-account" || !user) return;
    requestAnimationFrame(() =>
      document.getElementById("delete-account")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
    );
  }, [location.hash, user]);

  const hasPasswordProvider = Boolean(
    user?.providerData.some((provider) => provider.providerId === "password"),
  );
  const hasGoogleProvider = Boolean(
    user?.providerData.some((provider) => provider.providerId === "google.com"),
  );

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.email || !hasPasswordProvider) return;
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("A confirmação não corresponde à nova senha.");
      return;
    }

    setSavingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Senha atualizada com sucesso.");
    } catch (error) {
      console.error(error);
      setPasswordError(
        "Não foi possível trocar a senha. Confira a senha atual e tente novamente.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const removeAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setDeleteError("");
    if (deleteConfirmation !== "EXCLUIR") {
      setDeleteError('Digite EXCLUIR para confirmar a remoção da conta.');
      return;
    }

    setDeletingAccount(true);
    try {
      if (hasPasswordProvider && user.email) {
        await reauthenticateWithCredential(
          user,
          EmailAuthProvider.credential(user.email, deletePassword),
        );
      } else if (hasGoogleProvider) {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
      } else {
        setDeleteError(
          "Este tipo de conta precisa ser confirmado pelo provedor de acesso antes de ser excluído.",
        );
        setDeletingAccount(false);
        return;
      }

      await deleteAccountData(user.uid);
      await deleteUser(user);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      setDeleteError(
        "Não foi possível concluir a exclusão. Se o processo já começou, alguns registros podem ter sido removidos. Confira os dados de acesso e tente novamente.",
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const closeDeleteDialog = () => {
    if (deletingAccount) return;
    setDeleteOpen(false);
    setDeleteConfirmation("");
    setDeletePassword("");
    setDeleteError("");
  };

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

            <section className={styles.passwordSection}>
              <h2>Segurança</h2>
              {hasPasswordProvider ? (
                <form className={styles.passwordForm} onSubmit={changePassword}>
                  <label>
                    Senha atual
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Nova senha
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Confirmar nova senha
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </label>
                  {passwordError && <p className={styles.error} role="alert">{passwordError}</p>}
                  {passwordSuccess && <p className={styles.success} role="status">{passwordSuccess}</p>}
                  <button type="submit" className={styles.actionButton} disabled={savingPassword}>
                    {savingPassword ? "Atualizando..." : "Trocar senha"}
                  </button>
                </form>
              ) : (
                <p className={styles.providerNotice}>
                  Esta conta usa {getProviderName(user)}. A senha é gerenciada
                  diretamente por esse provedor.
                </p>
              )}
            </section>

            <section className={styles.dangerSection} id="delete-account">
              <div>
                <h2>Excluir conta</h2>
                <p>Apaga sua conta, transações e assinaturas de forma permanente.</p>
              </div>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => setDeleteOpen(true)}
              >
                Excluir minha conta
              </button>
            </section>
          </>
        ) : (
          <div className={styles.loading}>Carregando dados da conta…</div>
        )}
      </Window>
      <ModalMessage
        isOpen={deleteOpen}
        title="Excluir conta permanentemente"
        onClose={closeDeleteDialog}
        className={styles.deleteModal}
      >
        <form className={styles.deleteForm} onSubmit={removeAccount}>
          <p>
            Esta ação remove seu perfil, todas as transações e assinaturas e não
            pode ser desfeita. Para continuar, digite <strong>EXCLUIR</strong>.
          </p>
          <label>
            Confirmação
            <input
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              autoComplete="off"
              required
            />
          </label>
          {hasPasswordProvider && (
            <label>
              Senha atual
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
          )}
          {deleteError && <p className={styles.error} role="alert">{deleteError}</p>}
          <div className={styles.deleteActions}>
            <button type="button" className={styles.cancelButton} onClick={closeDeleteDialog} disabled={deletingAccount}>
              Cancelar
            </button>
            <button type="submit" className={styles.deleteButton} disabled={deletingAccount}>
              {deletingAccount ? "Excluindo..." : "Excluir conta"}
            </button>
          </div>
        </form>
      </ModalMessage>
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
