import React from 'react';

const PieChartComponent = ({ data }) => {
    // Filter out items with a value of 0, but only if there are other items
    const filteredData = data.filter(item => item.value > 0);
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);

    // --- NEW LOGIC FOR SINGLE SLICE OR NO DATA ---
    if (filteredData.length === 1) {
        // If there's only one data point, render a full circle
        const singleSlice = filteredData[0];
        return (
            <div className="w-full h-full relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="50" fill={singleSlice.color} />
                </svg>
            </div>
        );
    }
    
    if (filteredData.length === 0) {
        // If there's no data, show a "Data not Found" message
        return (
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400 dark:bg-gray-800 text-xs">
                Data not Found
            </div>
        );
    }

    let cumulativeAngle = 0;
    
    return (
        <div className="w-full h-full relative justify-center">
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
                'M 50 50',
                `L ${startX} ${startY}`,
                `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
                ].join(' ');

                return <path key={`slice-${index}`} d={d} fill={entry.color} />;
            })}
            </svg>
        </div>
    );
};

export default PieChartComponent;