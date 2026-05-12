import React from 'react';
import { FaBirthdayCake, FaAward, FaWalking, FaGift } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CelebrationCard = ({ type, name, detail, onAction, isPersonal = false }) => {
  const configs = {
    birthday: {
      icon: <FaBirthdayCake />,
      title: isPersonal ? "Happy Birthday!" : "Birthday Celebration",
      bgColor: "from-rose-500 to-pink-600",
      lightBg: "bg-rose-50",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
      buttonText: "Send Wish",
      message: isPersonal ? `Wishing you a fantastic day, ${name}!` : `${name} is celebrating their birthday today!`
    },
    anniversary: {
      icon: <FaAward />,
      title: isPersonal ? "Work Anniversary!" : "Work Anniversary",
      bgColor: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      buttonText: "Congratulate",
      message: isPersonal ? `Happy ${detail} Anniversary!` : `${name} completed ${detail} at the company!`
    },
    leave: {
      icon: <FaWalking />,
      title: "Out of Office",
      bgColor: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
      buttonText: "View Details",
      message: `${name} is on ${detail} today.`
    }
  };

  const config = configs[type] || configs.birthday;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden p-4 rounded-2xl bg-white border ${config.borderColor} shadow-sm hover:shadow-md transition-all group`}
    >
      {/* Decorative background element */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${config.bgColor} opacity-5 rounded-full group-hover:scale-125 transition-transform duration-500`} />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm bg-gradient-to-br ${config.bgColor} text-white`}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-bold text-gray-900 truncate">{config.title}</h4>
            {isPersonal && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-indigo-600 text-white animate-pulse">
                SPECIAL
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-500 truncate">
            {config.message}
          </p>
        </div>

        {onAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${config.borderColor} ${config.textColor} ${config.lightBg} hover:shadow-sm active:scale-95`}
          >
            {config.buttonText}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CelebrationCard;
