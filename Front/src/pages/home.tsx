import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import SideMenu from "../components/layout/sideMenu";
import BalanceLineChart from "../components/dashboard/BalanceLineChart";
import ExpenseDistributionChart from "../components/dashboard/ExpenseDistributionChart";
import MonthlyExpensesChart from "../components/dashboard/MonthlyExpensesChart";
import SummaryCard from "../components/dashboard/SummaryCard";
import TransactionHistory from "../components/dashboard/TransactionHistory";
import {
  dashboardPeriods,
  type DashboardPeriod,
  formatCurrency,
  getRecordDate,
} from "../functions/financeDashboard";
import { auth, db } from "../services/firebase";
import type { RecordType } from "../types/recordType";
import styles from "./home.module.css";

export default function Home() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [period, setPeriod] = useState<DashboardPeriod>("6M");
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    // onAuthStateChanged recebe Auth e callback de User|null; seu retorno cancela a observação.
    // Para cada conta autenticada, onSnapshot observa users/{uid}/records ordenados por dateKey,
    // entrega os documentos convertidos em RecordType e retorna a função para encerrar a escuta.
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

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (a, b) => getRecordDate(b).getTime() - getRecordDate(a).getTime(),
      ),
    [records],
  );
  const balance = useMemo(
    () =>
      records.reduce(
        (total, record) =>
          total + (record.gain ? Number(record.value) : -Number(record.value)),
        0,
      ),
    [records],
  );
  const income = useMemo(
    () =>
      records
        .filter((record) => record.gain)
        .reduce((total, record) => total + Number(record.value), 0),
    [records],
  );
  const expenses = useMemo(
    () =>
      records
        .filter((record) => !record.gain)
        .reduce((total, record) => total + Number(record.value), 0),
    [records],
  );
  const investments = useMemo(
    () =>
      records
        .filter(
          (record) => record.gain && record.destination_or_source !== "Salary",
        )
        .reduce((total, record) => total + Number(record.value), 0),
    [records],
  );
  const lineData = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(
      start.getDate() -
        { "7D": 7, "1M": 30, "3M": 90, "6M": 180, "1A": 365 }[period],
    );
    let runningBalance = 0;
    const data: number[] = [];
    const categories: string[] = [];
    [...records]
      .sort((a, b) => getRecordDate(a).getTime() - getRecordDate(b).getTime())
      .forEach((record) => {
        runningBalance += record.gain
          ? Number(record.value)
          : -Number(record.value);
        if (getRecordDate(record) >= start && getRecordDate(record) <= end) {
          data.push(runningBalance);
          categories.push(
            getRecordDate(record).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            }),
          );
        }
      });
    return { data, categories };
  }, [records, period]);
  const monthlyExpenses = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = new Date(new Date().getFullYear(), index, 1);
        return {
          label: month
            .toLocaleDateString("pt-BR", { month: "short" })
            .replace(".", ""),
          value: records
            .filter(
              (record) =>
                !record.gain &&
                getRecordDate(record).getFullYear() === month.getFullYear() &&
                getRecordDate(record).getMonth() === month.getMonth(),
            )
            .reduce((sum, record) => sum + Number(record.value), 0),
        };
      }),
    [records],
  );
  const availableMonths = useMemo(
    () =>
      [
        ...new Set(
          records.map((record) => record.dateKey?.slice(0, 7)).filter(Boolean),
        ),
      ]
        .sort()
        .reverse(),
    [records],
  );
  const categoryExpenses = useMemo(
    () =>
      Object.entries(
        records
          .filter(
            (record) =>
              !record.gain &&
              (selectedMonth === "all" ||
                record.dateKey?.startsWith(selectedMonth)),
          )
          .reduce<Record<string, number>>((total, record) => {
            const category = record.destination_or_source || "Other";
            total[category] = (total[category] || 0) + Number(record.value);
            return total;
          }, {}),
      ),
    [records, selectedMonth],
  );
  const filteredRecords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return term
      ? sortedRecords.filter((record) =>
          `${record.description} ${record.destination_or_source}`
            .toLocaleLowerCase("pt-BR")
            .includes(term),
        )
      : sortedRecords;
  }, [search, sortedRecords]);

  return (
    <main className={styles.page}>
      <SideMenu />
      <section className={styles.dashboard}>
        <div className={styles.mainColumn}>
          <section className={styles.balancePanel}>
            <div className={styles.balanceHeader}>
              <div>
                <p className={styles.eyebrow}>SALDO ATUAL</p>
                <h1>{formatCurrency(balance)}</h1>
              </div>
              <div className={styles.periods}>
                {dashboardPeriods.map((item) => (
                  <button
                    key={item}
                    className={item === period ? styles.activePeriod : ""}
                    onClick={() => setPeriod(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.balanceBody}>
              <div className={styles.summaryCards}>
                <SummaryCard
                  label="RECEITAS"
                  value={income}
                  positive
                  className={styles.summaryCard}
                  positiveClassName={styles.positive}
                  mutedPositiveClassName={styles.mutedPositive}
                  negativeClassName={styles.negative}
                />
                <SummaryCard
                  label="INVESTIMENTOS"
                  value={investments}
                  positive
                  muted
                  className={styles.summaryCard}
                  positiveClassName={styles.positive}
                  mutedPositiveClassName={styles.mutedPositive}
                  negativeClassName={styles.negative}
                />
                <SummaryCard
                  label="DESPESAS"
                  value={expenses}
                  className={styles.summaryCard}
                  positiveClassName={styles.positive}
                  mutedPositiveClassName={styles.mutedPositive}
                  negativeClassName={styles.negative}
                />
              </div>
              <div className={styles.lineChart}>
                {lineData.data.length ? (
                  <BalanceLineChart
                    categories={lineData.categories}
                    data={lineData.data}
                  />
                ) : (
                  <EmptyChart text="Ainda não há lançamentos neste período." />
                )}
              </div>
            </div>
          </section>
          <section className={styles.analytics}>
            <article className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Gastos por mês</h2>
                  <p>Comparativo mensal de despesas (R$)</p>
                </div>
              </div>
              <MonthlyExpensesChart data={monthlyExpenses} />
            </article>
            <article className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <p className={styles.eyebrow}>TIPO DE GASTOS</p>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  <option value="all">Todos os meses</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {new Date(`${month}-02T12:00:00`).toLocaleDateString(
                        "pt-BR",
                        { month: "long", year: "numeric" },
                      )}
                    </option>
                  ))}
                </select>
              </div>
              <ExpenseDistributionChart
                data={categoryExpenses}
                contentClassName={styles.donutContent}
                legendClassName={styles.legend}
                emptyClassName={styles.emptyChart}
              />
            </article>
          </section>
        </div>
        <aside className={styles.historyPanel}>
          <TransactionHistory
            records={filteredRecords}
            search={search}
            onSearchChange={setSearch}
            headerClassName={styles.historyHeader}
            searchClassName={styles.searchBox}
            transactionsClassName={styles.transactions}
            dateHeadingClassName={styles.dateHeading}
            transactionClassName={styles.transaction}
            iconClassName={styles.transactionIcon}
            positiveClassName={styles.positive}
            negativeClassName={styles.negative}
            emptyClassName={styles.emptyHistory}
          />
        </aside>
      </section>
    </main>
  );
}

interface EmptyChartProps { text: string }

function EmptyChart({ text }: EmptyChartProps) {
  return <div className={styles.emptyChart}>{text}</div>;
}
