import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function LineChartComponent({ labels, data, title }) {
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: title,
                data: data,
                fill: false,
                borderColor: '#60a5fa',
                tension: 0.1,
            },
        ],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: !!title, text: title },
        },
    };
    return <Line data={chartData} options={options} />;
}
