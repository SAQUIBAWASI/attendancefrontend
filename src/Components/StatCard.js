// import CountUp from 'react-countup';
// import { FiPieChart } from 'react-icons/fi'; // Fallback icon

// const StatCard = ({
//   icon: Icon = FiPieChart,
//   label,
//   title, // Support both label and title prop
//   value,
//   color,
//   onClick,
//   isPercentage,
//   isCurrency,
//   prefix = "",
// }) => {
//   // Automatically handle shorthand colour names like "indigo" -> "border-indigo-500"
//   let borderClass = color || "border-blue-500";
//   if (color && !color.startsWith("border-") && !color.includes("-")) {
//     borderClass = `border-${color}-500`;
//   } else if (color && !color.startsWith("border-")) {
//     borderClass = color;
//   }

//   const displayLabel = label || title || "Stat";
  
//   // Decide how to display the value
//   const isStringValue = typeof value === 'string' && isNaN(parseFloat(value));
//   const parsedValue = parseFloat(value) || 0;

//   return (
//     <div
//       onClick={onClick}
//       className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm border-t-4 ${borderClass} ${
//         onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'hover:shadow-md'
//       } transition-all duration-300 flex items-center justify-between`}
//     >
//       <div className="flex items-center gap-2">
//         {Icon && <Icon className="flex-shrink-0 text-base text-gray-500" />}
//         <div className="text-sm font-medium text-gray-700">{displayLabel}</div>
//       </div>
//       <div className="text-sm font-bold text-gray-900">
//         {prefix}
//         {isCurrency ? "₹" : ""}
//         {isStringValue ? (
//           value
//         ) : (
//           <CountUp
//             end={parsedValue}
//             duration={2}
//             decimals={(isPercentage || isCurrency) && parsedValue % 1 !== 0 ? 2 : 0}
//             separator=","
//           />
//         )}
//         {isPercentage ? "%" : ""}
//       </div>
//     </div>
//   );
// };

// export default StatCard;

import CountUp from 'react-countup';
import { FiPieChart } from 'react-icons/fi';

const StatCard = ({
  icon: Icon = FiPieChart,
  label,
  title,
  value,
  color,
  onClick,
  isPercentage,
  isCurrency,
  prefix = "",
}) => {
  // Debug: console mein dekho kya aa raha hai
  console.log("StatCard color prop:", color);
  
  // Direct color hex values - simple mapping
  const getBorderColor = (colorName) => {
    console.log("Getting color for:", colorName);
    
    if (!colorName) return '#6366f1';
    
    // Agar bilkul string match karo
    if (colorName === 'indigo') return '#6366f1';
    if (colorName === 'emerald') return '#10b981';
    if (colorName === 'amber') return '#f59e0b';
    if (colorName === 'rose') return '#f43f5e';
    if (colorName === 'cyan') return '#06b6d4';
    if (colorName === 'blue') return '#3b82f6';
    if (colorName === 'green') return '#22c55e';
    if (colorName === 'border-indigo-500') return '#6366f1';
    if (colorName === 'border-emerald-500') return '#10b981';
    if (colorName === 'border-amber-500') return '#f59e0b';
    if (colorName === 'border-rose-500') return '#f43f5e';
    if (colorName === 'border-cyan-500') return '#06b6d4';
    
    // Default
    return '#6366f1';
  };

  const displayLabel = label || title || "Stat";
  const isStringValue = typeof value === 'string' && isNaN(parseFloat(value));
  const parsedValue = parseFloat(value) || 0;
  
  const borderColor = getBorderColor(color);
  console.log("Final border color:", borderColor);

  return (
    <div
      onClick={onClick}
      style={{
        borderTopColor: borderColor,
        borderTopWidth: '4px',
        borderTopStyle: 'solid',
        borderLeftWidth: '1px',
        borderRightWidth: '1px',
        borderBottomWidth: '1px',
        borderLeftColor: '#e5e7eb',
        borderRightColor: '#e5e7eb',
        borderBottomColor: '#e5e7eb'
      }}
      className={`bg-white rounded-lg p-3 shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'hover:shadow-md'
      } transition-all duration-300 flex items-center justify-between`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="flex-shrink-0 text-base text-gray-500" />}
        <div className="text-sm font-medium text-gray-700">{displayLabel}</div>
      </div>
      <div className="text-sm font-bold text-gray-900">
        {prefix}
        {isCurrency ? "₹" : ""}
        {isStringValue ? (
          value
        ) : (
          <CountUp
            end={parsedValue}
            duration={2}
            decimals={(isPercentage || isCurrency) && parsedValue % 1 !== 0 ? 2 : 0}
            separator=","
          />
        )}
        {isPercentage ? "%" : ""}
      </div>
    </div>
  );
};

export default StatCard;