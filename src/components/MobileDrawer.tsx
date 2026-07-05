import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Bottom Sheet / Drawer for mobile viewports.
 * Supports drag-to-dismiss (drag down > 150px to close).
 * Uses framer-motion spring physics for natural feel.
 */
export default function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="drawer-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_event, info) => {
              // Close if dragged down more than 150px or with enough velocity
              if (info.offset.y > 150 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#f8f9fa] dark:bg-[#0a0a0a] border-t-4 border-black dark:border-white shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[0_-4px_0px_0px_rgba(255,255,255,1)]"
            style={{
              maxHeight: "85vh",
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-gray-400 dark:bg-neutral-600 rounded-full" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: "calc(85vh - 24px)" }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
