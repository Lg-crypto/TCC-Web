import type { ApexOptions, ApexNonAxisChartSeries } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import { getDisabledChartAnimations } from './dashboard/chartAnimations';
import styles from './lineChart.module.css'


interface LineChartProps{
    categories: string[],
    name:       string,
    data:       number[] 
}

export default function LineChart ({categories, name, data}: LineChartProps){
    const options: ApexOptions = {
        chart: {
            type: 'line',
            toolbar: { show: false },
            animations: getDisabledChartAnimations(),
        },
        xaxis: {
            categories: categories
        },
        yaxis:{
            axisBorder:{
                show: false
            },
            labels: {
            formatter: (value) => {
                return value.toFixed(2);
            }
        }
        },
        grid:{
            yaxis:{
                lines:{
                    show: false
                }
            },
        },
        fill: {
            type: 'horizontal',
            
        },
        colors: [
            (data[0] > data[data.length - 1] ? '#ff4e7b' : '#24d878')
        ],
        
    };

    const series: ApexNonAxisChartSeries = [
        {
            name: name,
            data: data
        }
    ];

  return (
    <ReactApexChart 
        className={styles.chart}
        options={options} 
        series={series} 
        type="line" 
        height={350} 
    />
  );
}
