import styles from "./register.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { FaAt } from "react-icons/fa";
import ModalMessage from "../components/layout/modalMessage";
import PrivacyPolicy from "../components/layout/PrivacyPolicy";
import { auth } from "../services/firebase";
import { recordPrivacyAcceptance } from "../services/privacy";

import Google from "../assets/google-icon.svg";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  privacyAccepted: boolean;
};
const registerSchema = z.object({
  firstName: z.string().min(2, { message: "Informe seu primeiro nome." }),
  lastName: z.string().min(2, { message: "Informe seu sobrenome." }),
  email: z.email({ message: "Informe um e-mail válido." }),
  password: z
    .string()
    .min(6, { message: "Informe uma senha com 6 caracteres ou mais." }),
  privacyAccepted: z.boolean().refine((accepted) => accepted, {
    message: "Leia e aceite a política de privacidade para continuar.",
  }),
});

export default function Register() {
  const [open, setOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [modalText, setModalText] = useState(
    "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
  );
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(registerSchema) });
  // createUserWithEmailAndPassword recebe Auth, e-mail e senha e devolve UserCredential;
  // updateProfile usa a instância User e o displayName para registrar o nome visível.
  const createAccount = async (data: FormValues) => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      await updateProfile(credential.user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });
      await recordPrivacyAcceptance(credential.user.uid);
      navigate("/home");
    } catch (error) {
      console.error(error);
      setModalText(
        "Não foi possível concluir o cadastro. Confira os dados e tente novamente.",
      );
      setOpen(true);
    }
  };
  // signInWithPopup recebe Auth e GoogleAuthProvider e devolve UserCredential após o OAuth.
  const authenticateWithGoogle = async () => {
    if (!getValues("privacyAccepted")) {
      setError("privacyAccepted", {
        type: "manual",
        message: "Leia e aceite a política de privacidade para continuar.",
      });
      return;
    }
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await recordPrivacyAcceptance(credential.user.uid);
      navigate("/home");
    } catch (error) {
      console.error(error);
      setModalText(
        "Não foi possível concluir o cadastro com Google. Tente novamente.",
      );
      setOpen(true);
    }
  };
  const error = errors.firstName?.message || errors.lastName?.message ||
    errors.email?.message || errors.password?.message;

  return (
    <main className={styles.page}>
      <section className={styles.photoPanel} aria-hidden="true" />
      <section className={styles.authPanel}>
        <form className={styles.form} onSubmit={handleSubmit(createAccount)}>
          <nav className={styles.tabs} aria-label="Autenticação">
            <span className={styles.activeTab}>Sign up</span>
            <Link to="/login">Login</Link>
          </nav>
          <h1>Create an account</h1>
          <div className={styles.fields}>
            <div className={styles.nameFields}>
              <label className={styles.field}>
                <span className={styles.srOnly}>Nome</span>
                <input
                  placeholder="First Name"
                  autoComplete="given-name"
                  {...register("firstName")}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.srOnly}>Sobrenome</span>
                <input
                  placeholder="Last Name"
                  autoComplete="family-name"
                  {...register("lastName")}
                />
              </label>
            </div>
            <label className={`${styles.field} ${styles.iconField}`}>
              <FaAt />
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
                autoComplete="new-password"
                {...register("password")}
              />
            </label>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.privacyConsent}>
            <input
              id="privacyAccepted"
              type="checkbox"
              required
              {...register("privacyAccepted", {
                onChange: () => clearErrors("privacyAccepted"),
              })}
              aria-invalid={Boolean(errors.privacyAccepted)}
              aria-describedby={
                errors.privacyAccepted ? "privacyError" : undefined
              }
            />
            <label htmlFor="privacyAccepted">
              Li e concordo com a
            </label>
            <button
              className={styles.privacyLink}
              type="button"
              onClick={() => setPrivacyOpen(true)}
            >
              política de privacidade
            </button>
          </div>
          {errors.privacyAccepted && (
            <p className={styles.error} id="privacyError" role="alert">
              {errors.privacyAccepted.message}
            </p>
          )}
          <button className={styles.primaryButton} type="submit">
            Create an account
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
              aria-label="Cadastrar com Google"
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
        isOpen={privacyOpen}
        title="Política de privacidade"
        onClose={() => setPrivacyOpen(false)}
        className={styles.policyModal}
      >
        <PrivacyPolicy />
      </ModalMessage>
    </main>
  );
}
