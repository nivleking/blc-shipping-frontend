import { motion } from "framer-motion";
import { BsGraphUp } from "react-icons/bs";

const statsVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const StatsPanel = ({ portStats, formatIDR }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center space-x-2 text-gray-800 mb-4">
      <BsGraphUp size={18} />
      <h2 className="text-base font-semibold">Port Information</h2>
    </div>
    {Object.entries(portStats).map(([port, stats], index) => (
      <motion.div key={port} variants={statsVariants} initial="hidden" animate="visible" transition={{ delay: index * 0.1 }} className="bg-gray-50 rounded-xl p-4 shadow-sm mb-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-md font-medium text-blue-600">{port}</span>
          <span className="text-sm text-gray-500">{stats.totalSalesCall} cards</span>
        </div>
        <div className="space-y-2">
          <div className="text-sm flex justify-between items-center">
            <span className="text-gray-600">Revenue</span>
            <span className="font-medium">{formatIDR(stats.totalRevenue)}</span>
          </div>
          <div className="text-sm flex justify-between items-center">
            <span className="text-gray-600">Containers</span>
            <span className="font-medium">{stats.totalQuantity}</span>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default StatsPanel;
