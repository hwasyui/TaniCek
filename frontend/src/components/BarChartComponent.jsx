import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BarChartComponent({ labels, data, title }) {
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: title,
                data: data,
                backgroundColor: '#34d399',
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
    return <Bar data={chartData} options={options} />;
}
