import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <Dialog.Portal forceMount>
            {/* Backdrop Blur overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[999]"
              />
            </Dialog.Overlay>

            {/* Modal Dialog Content */}
            <Dialog.Content asChild>
              <div className="fixed inset-0 flex items-center justify-center p-4 z-[1000] pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full ${sizeClasses[size]} bg-[#1E293B] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto max-h-[90vh]`}
                >
                  <div className="flex justify-between items-center p-5 border-b border-gray-800/80 bg-[#0F172A]">
                    <Dialog.Title className="text-lg font-bold text-white font-display">
                      {title}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white p-1 hover:bg-gray-800/60 rounded-lg transition-all"
                        aria-label="Close modal"
                      >
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-gray-300">
                    {children}
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
}
