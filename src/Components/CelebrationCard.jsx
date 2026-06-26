import React from 'react';
import { FaBirthdayCake, FaAward, FaWalking, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CelebrationCard = ({ type, name, detail, onAction, isPersonal = false }) => {
  const configs = {
    birthday: {
      icon: <FaBirthdayCake className="text-sm" />,
      title: isPersonal ? "Happy Birthday" : "Birthday Celebration",
      gradient: "from-rose-500 to-pink-500",
      lightBg: "bg-rose-50",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
      badgeBg: "bg-rose-500",
      buttonText: "Send Wish",
      message: isPersonal
        ? `Wishing you a wonderful day, ${name}.`
        : `${name} ${name.endsWith('s') ? 'are' : 'is'} celebrating today.`
    },
    anniversary: {
      icon: <FaAward className="text-sm" />,
      title: isPersonal ? "Work Anniversary" : "Work Anniversary",
      gradient: "from-emerald-500 to-teal-500",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      badgeBg: "bg-emerald-500",
      buttonText: "Congratulate",
      message: isPersonal
        ? `Happy ${detail} with the company.`
        : `${name} completed ${detail} at the company.`
    },
    leave: {
      icon: <FaWalking className="text-sm" />,
      title: "Employees on Leave",
      gradient: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
      badgeBg: "bg-amber-500",
      buttonText: "View Details",
      message: `${name} ${name.endsWith('s') ? 'are' : 'is'} on ${detail || 'leave'} today.`
    },
    shift: {
      icon: <FaClock className="text-xs" />,
      title: "Upcoming Shift",
      gradient: "from-violet-500 to-purple-600",
      lightBg: "bg-violet-50",
      textColor: "text-violet-600",
      borderColor: "border-violet-100",
      badgeBg: "bg-violet-500",
      buttonText: "Details",
      message: isPersonal
        ? `Changing to ${name} · ${detail}`
        : `${name} changes on ${detail}`
    }
  };

  const config = configs[type] || configs.birthday;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`relative overflow-hidden rounded-xl bg-white border ${config.borderColor} shadow-sm hover:shadow-md transition-all cursor-pointer group`}
    >
      {/* Thin color accent bar on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.gradient}`} />

      {/* Subtle decorative circle */}
      <div className={`absolute -right-3 -top-3 w-14 h-14 bg-gradient-to-br ${config.gradient} opacity-[0.06] rounded-full group-hover:scale-150 transition-transform duration-500`} />

      <div className="flex flex-col gap-2 px-3 py-2.5 relative z-10 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
        {/* Icon */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:gap-3">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${config.gradient} shadow-sm flex-shrink-0`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">{config.title}</h4>
              {isPersonal && (
                <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${config.badgeBg} text-white animate-pulse`}>
                  YOU
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-gray-500 leading-tight line-clamp-2 sm:truncate">
              {config.message}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {onAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className={`w-full sm:w-auto flex-shrink-0 px-2.5 py-1.5 sm:py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${config.borderColor} ${config.textColor} ${config.lightBg} hover:shadow-sm active:scale-95 whitespace-nowrap text-center`}
          >
            {config.buttonText}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CelebrationCard;
