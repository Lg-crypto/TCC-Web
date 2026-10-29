import { LuSearch } from "react-icons/lu";
import {
  categoryDetails,
  formatCurrency,
  getDateHeading,
} from "../../functions/financeDashboard";
import type { RecordType } from "../../types/recordType";

interface TransactionHistoryProps {
  records: RecordType[];
  search: string;
  onSearchChange: (value: string) => void;
  headerClassName: string;
  searchClassName: string;
  transactionsClassName: string;
  dateHeadingClassName: string;
  transactionClassName: string;
  iconClassName: string;
  positiveClassName: string;
  negativeClassName: string;
  emptyClassName: string;
}

export default function TransactionHistory({
  records,
  search,
  onSearchChange,
  headerClassName,
  searchClassName,
  transactionsClassName,
  dateHeadingClassName,
  transactionClassName,
  iconClassName,
  positiveClassName,
  negativeClassName,
  emptyClassName,
}: TransactionHistoryProps) {
  return (
    <>
      <div className={headerClassName}>
        <h2>Histórico de transações</h2>
        <label className={searchClassName}>
          <LuSearch size={17} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder=""
            aria-label="Buscar transações"
          />
        </label>
      </div>
      <div className={transactionsClassName}>
        {records.length ? (
          records.map((record, index) => (
            <TransactionCard
              key={record.id || index}
              record={record}
              showHeading={
                index === 0 ||
                getDateHeading(record) !== getDateHeading(records[index - 1])
              }
              dateHeadingClassName={dateHeadingClassName}
              transactionClassName={transactionClassName}
              iconClassName={iconClassName}
              positiveClassName={positiveClassName}
              negativeClassName={negativeClassName}
            />
          ))
        ) : (
          <p className={emptyClassName}>Nenhuma transação encontrada.</p>
        )}
      </div>
    </>
  );
}

interface TransactionCardProps extends Pick<
  TransactionHistoryProps,
  | "dateHeadingClassName"
  | "transactionClassName"
  | "iconClassName"
  | "positiveClassName"
  | "negativeClassName"
> {
  record: RecordType;
  showHeading: boolean;
}
export function TransactionCard({
  record,
  showHeading,
  dateHeadingClassName,
  transactionClassName,
  iconClassName,
  positiveClassName,
  negativeClassName,
}: TransactionCardProps) {
  const detail =
    categoryDetails[record.destination_or_source || "Other"] ||
    categoryDetails.Other;
  const Icon = detail.icon;
  return (
    <>
      {showHeading && (
        <h3 className={dateHeadingClassName}>{getDateHeading(record)}</h3>
      )}
      <article className={transactionClassName}>
        <span className={iconClassName}>
          <Icon size={17} />
        </span>
        <div>
          <h4>{record.description}</h4>
          <p>{record.gain ? "Ganhos" : "Gastos"}</p>
        </div>
        <strong className={record.gain ? positiveClassName : negativeClassName}>
          {record.gain ? "+" : "−"}
          {formatCurrency(Number(record.value))}
        </strong>
      </article>
    </>
  );
}
