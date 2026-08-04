import React from 'react';
import { motion } from 'framer-motion';

interface BackdropProps {
  onClick: () => void;
}

export const Backdrop: React.FC<BackdropProps> = ({ onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
      onClick={onClick}
      aria-hidden="true"
    />
  );
};
