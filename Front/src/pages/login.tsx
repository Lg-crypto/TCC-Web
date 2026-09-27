import styles from "./login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
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
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

  // Firebase Authentication recebe a instância Auth, e-mail e senha; resolve com UserCredential
  // (usuário e tokens) ou rejeita com um código de erro exibido no modal.
  const userAuthenticate = async (data: FormValues) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate("/home");
    } catch (error) {
      console.error(error);
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
      setOpen(true);
    }
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
              />
            </label>
            <label className={styles.field}>
              <span className={styles.srOnly}>Senha</span>
              <input
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password")}
              />
            </label>
            <Link className={styles.forgotPassword} to="/login">
              forgot my password
            </Link>
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
        <p>
          Não foi possível autenticar. Verifique os dados e tente novamente.
        </p>
      </ModalMessage>
    </main>
  );
}
