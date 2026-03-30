
const StatCard = ({
  title,
  value,
  icon: Icon,
  borderColor = "border-blue-500",
}) => {
  return (
    <div
      className={`bg-white rounded-xl px-4 py-2 flex items-center justify-between shadow-sm border-t-4 ${borderColor}`}
    >
      {/* Left */}
      <div className="flex items-center gap-2 text-gray-600">
        {Icon && <Icon className="text-lg text-gray-400" />}
        <span className="text-sm font-medium">{title}</span>
      </div>

      {/* Right */}
      <div className="text-sm font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
};

export default StatCard;