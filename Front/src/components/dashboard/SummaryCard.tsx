import { formatCurrency } from "../../functions/financeDashboard";

interface SummaryCardProps {
  label: string;
  value: number;
  positive?: boolean;
  muted?: boolean;
  className: string;
  positiveClassName: string;
  mutedPositiveClassName: string;
  negativeClassName: string;
}

export default function SummaryCard({
  label,
  value,
  positive,
  muted,
  className,
  positiveClassName,
  mutedPositiveClassName,
  negativeClassName,
}: SummaryCardProps) {
  const valueClassName = positive
    ? muted
      ? mutedPositiveClassName
      : positiveClassName
    : negativeClassName;
  return (
    <div className={className}>
      <p>{label}</p>
      <strong className={valueClassName}>
        {positive ? "+" : "−"}
        {formatCurrency(value)}
      </strong>
    </div>
  );
}
