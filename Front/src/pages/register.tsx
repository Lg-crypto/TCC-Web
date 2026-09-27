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
import { FiChevronDown } from "react-icons/fi";
import ModalMessage from "../components/layout/modalMessage";
import { auth } from "../services/firebase";

import Google from "../assets/google-icon.svg";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
};
const registerSchema = z.object({
  firstName: z.string().min(2, { message: "Informe seu primeiro nome." }),
  lastName: z.string().min(2, { message: "Informe seu sobrenome." }),
  email: z.email({ message: "Informe um e-mail válido." }),
  password: z
    .string()
    .min(6, { message: "Informe uma senha com 6 caracteres ou mais." }),
  phone: z.string().min(8, { message: "Informe um telefone válido." }),
});

export default function Register() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
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
      navigate("/home");
    } catch (error) {
      console.error(error);
      setOpen(true);
    }
  };
  // signInWithPopup recebe Auth e GoogleAuthProvider e devolve UserCredential após o OAuth.
  const authenticateWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/home");
    } catch (error) {
      console.error(error);
      setOpen(true);
    }
  };
  const error = Object.values(errors)[0]?.message;

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
            <label className={`${styles.field} ${styles.phoneField}`}>
              <span className={styles.flag}>🇧🇷</span>
              <FiChevronDown />
              <span className={styles.srOnly}>Telefone</span>
              <input
                type="tel"
                placeholder="(55) 9983-0439"
                autoComplete="tel"
                {...register("phone")}
              />
            </label>
          </div>
          {error && <p className={styles.error}>{error}</p>}
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
        <p>
          Não foi possível criar sua conta. Verifique os dados e tente
          novamente.
        </p>
      </ModalMessage>
    </main>
  );
}
