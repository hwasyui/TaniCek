import React from 'react';
// This is a simple SVG placeholder. For a real app, integrate a charting library like Recharts or Chart.js
const PieChartComponent = ({ data }) => {
const filteredData = data.filter(item => item.value > 0);
const total = filteredData.reduce((sum, item) => sum + item.value, 0);
let cumulativeAngle = 0;

    return (
        <div className="w-48 h-48 relative">
        {filteredData.length > 0 ? (
            <svg viewBox="0 0 100 100" className="w-full h-full">
            {filteredData.map((entry, index) => {
                const angle = (entry.value / total) * 360;
                const largeArcFlag = angle > 180 ? 1 : 0;
                const startAngle = cumulativeAngle;
                cumulativeAngle += angle;
                const endAngle = cumulativeAngle;

                const startX = 50 + 50 * Math.cos(Math.PI * (startAngle - 90) / 180);
                const startY = 50 + 50 * Math.sin(Math.PI * (startAngle - 90) / 180);
                const endX = 50 + 50 * Math.cos(Math.PI * (endAngle - 90) / 180);
                const endY = 50 + 50 * Math.sin(Math.PI * (endAngle - 90) / 180);

                const d = [
                `M 50 50`,
                `L ${startX} ${startY}`,
                `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `Z`
                ].join(' ');

                return <path key={`slice-${index}`} d={d} fill={entry.color} />;
            })}
            </svg>
        ) : (
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-text-light text-xs">
            Data not Found
            </div>
        )}
        </div>
    );
}

export default PieChartComponent;