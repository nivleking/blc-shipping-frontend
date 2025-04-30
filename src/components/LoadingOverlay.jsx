import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiCargoShip } from "react-icons/gi";

const LoadingOverlay = ({ messages, currentMessageIndex, title }) => {
  const [fadeIn, setFadeIn] = useState(true);

  // Fade effect when message changes
  useEffect(() => {
    setFadeIn(true);
    const timer = setTimeout(() => {
      setFadeIn(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentMessageIndex]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 relative overflow-hidden">
        {/* Background effects - changed to blue tones */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-gray-200 to-gray-600 opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-r from-gray-300 to-gray-700 opacity-20"></div>

        <div className="relative z-10">
          {/* Title with icon */}
          <div className="flex items-center justify-center mb-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="mr-3">
              <GiCargoShip className="text-blue-600 text-2xl" />
            </motion.div>
            <h2 className="text-2xl font-bold text-blue-800">{title}</h2>
          </div>

          {/* BLC Logo with spinning border - replacing the previous spinner */}
          <div className="flex justify-center my-6">
            <div className="relative w-24 h-24">
              {/* Static circle behind the logo */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-opacity-30"></div>

              {/* Spinning border */}
              <motion.div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-500" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}></motion.div>

              {/* BLC Logo */}
              <img src="/blc_circle.png" alt="BLC Logo" className="w-24 h-24 relative z-10" />
            </div>
          </div>

          {/* Loading messages with fade transition */}
          <div className="h-16 flex items-center justify-center mb-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: fadeIn ? 1 : 0.7,
                  y: 0,
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-blue-700 font-medium text-center"
              >
                {messages[currentMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Animated progress bar */}
          <div className="w-full bg-blue-50 rounded-full h-1.5 mt-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5"
              initial={{ width: "0%" }}
              animate={{
                width: "100%",
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Animated dots */}
          <div className="flex justify-center mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 mx-1 rounded-full bg-blue-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingOverlay;
