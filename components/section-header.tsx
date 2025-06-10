"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  badge: string;
  badgeColor: "blue" | "red" | "green";
  title: string;
  description: string;
}

export function SectionHeader({
  badge,
  badgeColor,
  title,
  description,
}: SectionHeaderProps) {
  const badgeColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="text-center mb-16">
      <motion.span
        className={`inline-block px-4 py-1 rounded-full ${badgeColorClasses[badgeColor]} text-sm font-medium mb-4`}
        initial={{ opacity: 0 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1 }}
      >
        {badge}
      </motion.span>
      <motion.h2
        className="text-4xl font-bold text-gray-900 mb-4"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {title}
      </motion.h2>
      <motion.p
        className="text-gray-600 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {description}
      </motion.p>
    </div>
  );
}
