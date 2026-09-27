import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  LuCircleDollarSign,
  LuCircleUser,
  LuFilter,
  LuPlus,
  LuSearch,
  LuTag,
} from "react-icons/lu";
import SideMenu from "../components/layout/sideMenu";
import { auth, db } from "../services/firebase";
import { createRecord } from "../services/records";
import {
  categoryDetails,
  formatCurrency,
  getDateHeading,
  getRecordDate,
} from "../functions/financeDashboard";
import type { RecordType } from "../types/recordType";
import styles from "./newRecord.module.css";

const gainCategories = [
  { value: "Salary", label: "Salário" },
  { value: "Other", label: "Freelance / Outros" },
];
const expenseCategories = [
  { value: "House", label: "Casa" },
  { value: "Shopping", label: "Mercado / Compras" },
  { value: "Food", label: "Alimentação" },
  { value: "Transport", label: "Transporte" },
  { value: "Entertainment", label: "Entretenimento" },
  { value: "Other", label: "Outros" },
];
const recordSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "Informe um nome com ao menos 3 caracteres."),
  type: z.enum(["Gain", "Expense"]),
  value: z
    .number("Informe um valor válido.")
    .positive("Informe um valor maior que zero."),
  category: z.string().min(1, "Selecione uma categoria."),
  comment: z
    .string()
    .trim()
    .max(280, "O comentário deve ter no máximo 280 caracteres.")
    .optional(),
});
type FormValues = z.infer<typeof recordSchema>;
type Filter = "all" | "gain" | "expense" | "today" | "yesterday";
const initialValues = {
  type: "Expense" as const,
  category: "House",
  description: "",
  value: undefined,
  comment: "",
};

function getToday() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return {
    date: `${day}/${month}/${year}`,
    dateKey: `${year}-${month}-${day}`,
  };
}
function sameCalendarDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function NewRecordPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<RecordType[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: initialValues,
  });
  const selectedType = useWatch({ control, name: "type" });
  const categories =
    selectedType === "Gain" ? gainCategories : expenseCategories;

  useEffect(() => {
    setValue("category", selectedType === "Gain" ? "Salary" : "House");
  }, [selectedType, setValue]);
  useEffect(() => {
    // onAuthStateChanged recebe Auth e callback de User|null; seu retorno cancela a observação.
    // onSnapshot acompanha users/{uid}/records, fornece os documentos em tempo real e devolve a função de cancelamento.
    let unsubscribeRecords: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeRecords?.();
      if (!user) return setRecords([]);
      unsubscribeRecords = onSnapshot(
        query(
          collection(db, "users", user.uid, "records"),
          orderBy("dateKey", "desc"),
        ),
        (snapshot) =>
          setRecords(
            snapshot.docs.map((document) => ({
              id: document.id,
              ...document.data(),
            })) as RecordType[],
          ),
      );
    });
    return () => {
      unsubscribeAuth();
      unsubscribeRecords?.();
    };
  }, []);

  const onSubmit = async (data: FormValues) => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");
    try {
      setSubmitError("");
      const { date, dateKey } = getToday();
      await createRecord(user.uid, {
        gain: data.type === "Gain",
        value: data.value,
        date,
        dateKey,
        description: data.description,
        destination_or_source: data.category,
        comment: data.comment || "",
      });
      reset(initialValues);
    } catch (error) {
      console.error(error);
      setSubmitError("Não foi possível salvar a transação. Tente novamente.");
    }
  };
  const totals = useMemo(
    () =>
      records.reduce(
        (result, record) => {
          const value = Number(record.value) || 0;
          if (record.gain) result.gains += value;
          else result.expenses += value;
          result.balance += record.gain ? value : -value;
          return result;
        },
        { balance: 0, gains: 0, expenses: 0 },
      ),
    [records],
  );
  const filteredRecords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return [...records]
      .sort((a, b) => getRecordDate(b).getTime() - getRecordDate(a).getTime())
      .filter((record) => {
        const date = getRecordDate(record);
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "gain" && record.gain) ||
          (activeFilter === "expense" && !record.gain) ||
          (activeFilter === "today" && sameCalendarDay(date, today)) ||
          (activeFilter === "yesterday" && sameCalendarDay(date, yesterday));
        return (
          matchesFilter &&
          (!term ||
            `${record.description} ${record.destination_or_source} ${record.comment || ""}`
              .toLocaleLowerCase("pt-BR")
              .includes(term))
        );
      });
  }, [records, activeFilter, search]);
  const groups = useMemo(
    () =>
      filteredRecords.reduce<{ title: string; records: RecordType[] }[]>(
        (items, record) => {
          const title = getDateHeading(record);
          const group = items.find((item) => item.title === title);
          if (group) group.records.push(record);
          else items.push({ title, records: [record] });
          return items;
        },
        [],
      ),
    [filteredRecords],
  );
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "gain", label: "Ganhos" },
    { id: "expense", label: "Gastos" },
    { id: "today", label: "Hoje" },
    { id: "yesterday", label: "Ontem" },
  ];

  return (
    <main className={styles.page}>
      <SideMenu />
      <section className={styles.content}>
        <header className={styles.pageHeader}>
          <div>
            <h1>Registro</h1>
            <p>Adicione transações e acompanhe seus ganhos e gastos.</p>
          </div>
          <div className={styles.headerActions}>
            <label className={styles.searchBox}>
              <LuSearch size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar transações"
                aria-label="Buscar transações"
              />
            </label>
            <button
              className={styles.iconButton}
              type="button"
              onClick={() => {
                setSearch("");
                setActiveFilter("all");
              }}
              aria-label="Limpar filtros"
            >
              <LuFilter size={19} />
            </button>
            <button
              className={styles.iconButton}
              type="button"
              onClick={() => navigate("/profile")}
              aria-label="Abrir perfil"
            >
              <LuCircleUser size={20} />
            </button>
          </div>
        </header>
        <div className={styles.layout}>
          <form className={styles.formCard} onSubmit={handleSubmit(onSubmit)}>
            <div>
              <h2>Nova transação</h2>
              <p className={styles.intro}>
                Preencha os campos abaixo para registrar um novo lançamento.
              </p>
            </div>
            <label className={styles.field}>
              Nome
              <div className={styles.inputWrap}>
                <LuTag size={17} />
                <input
                  {...register("description")}
                  placeholder="Ex.: Salgado da cantina"
                />
              </div>
              {errors.description && <span>{errors.description.message}</span>}
            </label>
            <label className={styles.field}>
              Tipo
              <select {...register("type")}>
                <option value="Gain">Ganhos</option>
                <option value="Expense">Gastos</option>
              </select>
            </label>
            <label className={styles.field}>
              Valor
              <div className={styles.inputWrap}>
                <LuCircleDollarSign size={17} />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  {...register("value", { valueAsNumber: true })}
                />
              </div>
              {errors.value && <span>{errors.value.message}</span>}
            </label>
            <label className={styles.field}>
              Categoria
              <select {...register("category")}>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              Comentário
              <textarea
                {...register("comment")}
                placeholder="Adicione uma observação (opcional)"
              />
              {errors.comment && <span>{errors.comment.message}</span>}
            </label>
            {submitError && <p className={styles.formError}>{submitError}</p>}
            <div className={styles.formActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => reset(initialValues)}
              >
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                type="submit"
                disabled={isSubmitting}
              >
                <LuPlus size={18} />
                {isSubmitting ? "Salvando..." : "Salvar transação"}
              </button>
            </div>
          </form>
          <section className={styles.history}>
            <div className={styles.historyTop}>
              <div>
                <h2>Histórico de Transações</h2>
                <p>Hoje e ontem</p>
              </div>
              <div className={styles.summaryCards}>
                <Summary label="Saldo" value={totals.balance} />
                <Summary label="Ganhos" value={totals.gains} positive />
                <Summary label="Gastos" value={totals.expenses} negative />
              </div>
            </div>
            <div className={styles.filters}>
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={
                    activeFilter === filter.id ? styles.activeFilter : ""
                  }
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className={styles.transactionGroups}>
              {groups.length ? (
                groups.map((group) => (
                  <section className={styles.group} key={group.title}>
                    <div className={styles.groupHeading}>
                      <h3>{group.title}</h3>
                      <span>
                        {group.records.length}{" "}
                        {group.records.length === 1
                          ? "transação"
                          : "transações"}
                      </span>
                    </div>
                    {group.records.map((record, index) => (
                      <Transaction
                        key={record.id || `${group.title}-${index}`}
                        record={record}
                      />
                    ))}
                  </section>
                ))
              ) : (
                <p className={styles.empty}>Nenhuma transação encontrada.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
interface SummaryProps {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
}

function Summary({ label, value, positive, negative }: SummaryProps) {
  return (
    <article className={styles.summary}>
      <span>{label}</span>
      <strong
        className={
          positive
            ? styles.positive
            : negative || value < 0
              ? styles.negative
              : styles.positive
        }
      >
        {label === "Saldo" && value >= 0 ? "+" : label === "Gastos" ? "−" : ""}
        {formatCurrency(Math.abs(value))}
      </strong>
    </article>
  );
}
interface TransactionProps { record: RecordType }

function Transaction({ record }: TransactionProps) {
  const detail =
    categoryDetails[record.destination_or_source || "Other"] ||
    categoryDetails.Other;
  const Icon = detail.icon;
  return (
    <article className={styles.transaction}>
      <span className={styles.transactionIcon}>
        <Icon size={19} />
      </span>
      <div>
        <h4>{record.description}</h4>
        <p>{record.gain ? "Ganhos" : "Gastos"}</p>
      </div>
      <strong className={record.gain ? styles.positive : styles.negative}>
        {record.gain ? "+" : "−"}
        {formatCurrency(Number(record.value))}
      </strong>
    </article>
  );
}
