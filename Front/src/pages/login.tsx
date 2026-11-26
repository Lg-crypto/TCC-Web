import styles from "./login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import ModalMessage from "../components/layout/modalMessage";
import { auth } from "../services/firebase";
import Google from "../assets/google-icon.svg"



type FormValues = { email: string; password: string };

const loginSchema = z.object({
  email: z.email({ message: "Informe um e-mail válido." }),
  password: z.string().min(6, { message: "Informe uma senha com 6 caracteres ou mais." }),
});

export default function Login() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [modalText, setModalText] = useState(
    "Não foi possível autenticar. Verifique os dados e tente novamente.",
  );
  const [sendingReset, setSendingReset] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

  // Firebase Authentication recebe a instância Auth, e-mail e senha; resolve com UserCredential
  // (usuário e tokens) ou rejeita com um código de erro exibido no modal.
  const userAuthenticate = async (data: FormValues) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate("/home");
    } catch (error) {
      console.error(error);
      setModalText("Não foi possível autenticar. Verifique os dados e tente novamente.");
      setOpen(true);
    }
  };

  // signInWithPopup recebe Auth e GoogleAuthProvider, abre o OAuth do Google e resolve com UserCredential.
  const authenticateWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/home");
    } catch (error) {
      console.error(error);
      setModalText("Não foi possível entrar com Google. Tente novamente.");
      setOpen(true);
    }
  };

  const sendPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = resetEmail.trim();
    const validEmail = z.email().safeParse(email);
    if (!validEmail.success) {
      setResetError("Informe um e-mail válido para receber o link.");
      return;
    }

    setResetError("");
    setResetMessage("");
    setSendingReset(true);
    try {
      auth.languageCode = "pt-BR";
      await sendPasswordResetEmail(auth, email);
      setResetMessage(
        "Se houver uma conta associada a esse e-mail, você receberá uma mensagem com as instruções para trocar a senha.",
      );
    } catch (error) {
      console.error(error);
      setResetError(
        "Não foi possível enviar o e-mail agora. Confira o endereço e tente novamente mais tarde.",
      );
    } finally {
      setSendingReset(false);
    }
  };

  const openPasswordReset = () => {
    setResetEmail("");
    setResetError("");
    setResetMessage("");
    setResetOpen(true);
  };

  const closePasswordReset = () => {
    if (sendingReset) return;
    setResetOpen(false);
  };

  return (
    <main className={styles.page}>
      <section className={styles.photoPanel} aria-hidden="true" />
      <section className={styles.authPanel}>
        <form className={styles.form} onSubmit={handleSubmit(userAuthenticate)}>
          <nav className={styles.tabs} aria-label="Autenticação">
            <Link to="/register">Sign up</Link>
            <span className={styles.activeTab}>Login</span>
          </nav>
          <h1>Sign in</h1>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span className={styles.srOnly}>E-mail</span>
              <input
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.srOnly}>Senha</span>
              <input
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password")}
                aria-invalid={Boolean(errors.password)}
              />
            </label>
            <button
              className={styles.forgotPassword}
              type="button"
              onClick={openPasswordReset}
            >
              Esqueci minha senha
            </button>
          </div>
          {(errors.email || errors.password) && (
            <p className={styles.error}>
              {errors.email?.message ?? errors.password?.message}
            </p>
          )}
          <button className={styles.primaryButton} type="submit">
            Sign in
          </button>
          <div className={styles.divider}>
            <span />
            or sign in with
            <span />
          </div>
          <div className={styles.socialButtons}>
            <button
              className={`${styles.socialButton} ${styles.google}`}
              type="button"
              onClick={authenticateWithGoogle}
              aria-label="Entrar com Google"
            >
              <img src={Google} alt="" />
            </button>
          </div>
        </form>
      </section>
      <ModalMessage isOpen={open} title="Aviso" onClose={() => setOpen(false)}>
        <p>{modalText}</p>
      </ModalMessage>
      <ModalMessage
        isOpen={resetOpen}
        title="Redefinir senha"
        onClose={closePasswordReset}
        className={styles.resetModal}
      >
        <form className={styles.resetForm} onSubmit={sendPasswordReset}>
          <p>Digite o e-mail da sua conta para receber o link de redefinição.</p>
          <label className={styles.resetField}>
            E-mail
            <input
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              placeholder="seu@email.com"
              aria-invalid={Boolean(resetError)}
            />
          </label>
          {resetError && <p className={styles.resetError} role="alert">{resetError}</p>}
          {resetMessage && <p className={styles.resetSuccess} role="status">{resetMessage}</p>}
          <div className={styles.resetActions}>
            <button
              type="button"
              className={styles.resetCancel}
              onClick={closePasswordReset}
              disabled={sendingReset}
            >
              Fechar
            </button>
            <button
              type="submit"
              className={styles.resetSubmit}
              disabled={sendingReset}
            >
              {sendingReset ? "Enviando..." : "Enviar link"}
            </button>
          </div>
        </form>
      </ModalMessage>
    </main>
  );
}
