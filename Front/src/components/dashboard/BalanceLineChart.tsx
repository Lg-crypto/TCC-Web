import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { formatCurrency } from "../../functions/financeDashboard";

interface BalanceLineChartProps {
  categories: string[];
  data: number[];
  height?: number;
}

export default function BalanceLineChart({
  categories,
  data,
  height = 235,
}: BalanceLineChartProps) {
  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "Poppins, sans-serif",
    },
    stroke: { curve: "straight", width: 2 },
    colors: ["#24d878"],
    grid: { borderColor: "#2b2e38", strokeDashArray: 3 },
    xaxis: {
      categories,
      labels: { style: { colors: "#9a9ca8", fontSize: "10px" } },
      axisBorder: { color: "#2b2e38" },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) =>
          value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0),
        style: { colors: "#9a9ca8", fontSize: "10px" },
      },
    },
    tooltip: { theme: "dark", y: { formatter: formatCurrency } },
    dataLabels: { enabled: false },
  };
  return (
    <ReactApexChart
      options={options}
      series={[{ name: "Saldo", data }]}
      type="line"
      height={height}
    />
  );
}
