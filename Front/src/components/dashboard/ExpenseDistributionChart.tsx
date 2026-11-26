import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
  categoryDetails,
  formatCurrency,
} from "../../functions/financeDashboard";
import { getDisabledChartAnimations } from "./chartAnimations";

type CategoryExpense = [string, number];
interface ExpenseDistributionChartProps {
  data: CategoryExpense[];
  contentClassName: string;
  legendClassName: string;
  emptyClassName: string;
}
const categoryColors: Record<string, string> = {
  House: "#24d878",
  Shopping: "#4ea1ff",
  Food: "#ffb454",
  Transport: "#a78bfa",
  Entertainment: "#ff4e7b",
  Other: "#aeb4c4",
};

function getCategoryColor(category: string) {
  if (Object.hasOwn(categoryColors, category)) return categoryColors[category];

  // Keep legacy or custom categories visually stable when the selected month changes.
  const hash = [...category].reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) | 0,
    0,
  );
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue} 68% 62%)`;
}

export default function ExpenseDistributionChart({
  data,
  contentClassName,
  legendClassName,
  emptyClassName,
}: ExpenseDistributionChartProps) {
  if (!data.length)
    return (
      <div className={`${contentClassName} ${emptyClassName}`}>
        Nenhuma despesa encontrada.
      </div>
    );

  const total = data.reduce((sum, [, value]) => sum + value, 0);
  const colors = data.map(([category]) => getCategoryColor(category));
  const options: ApexOptions = {
    chart: { animations: getDisabledChartAnimations() },
    labels: data.map(
      ([category]) => categoryDetails[category]?.label || category,
    ),
    colors,
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { colors: ["#17191f"], width: 2 },
    plotOptions: {
      pie: {
        donut: {
          size: "67%",
          labels: {
            show: true,
            value: { fontSize: "14px", color: "#f5f5f6" },
            total: {
              show: true,
              label: "TOTAL",
              color: "#9a9ca8",
              fontSize: "16px",
              formatter: () => formatCurrency(total),
            },
          },
        },
      },
    },
    tooltip: { theme: "dark", y: { formatter: formatCurrency } },
  };

  return (
    <div className={contentClassName}>
      <ReactApexChart
        options={options}
        series={data.map(([, value]) => value)}
        type="donut"
        width={170}
        height={190}
      />
      <div className={legendClassName}>
        {data.map(([category, value], index) => (
          <div key={category}>
            <span style={{ backgroundColor: colors[index % colors.length] }} />
            <b>{categoryDetails[category]?.label || category}</b>
            <small>{formatCurrency(value)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
