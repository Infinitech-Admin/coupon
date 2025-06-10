"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/loading-indicator";

interface HeroSectionProps {
  isLoading: boolean;
  progress: number;
  cardData: Array<{
    title: string;
    description: string;
    icon: string;
    color: string;
    cta: string;
  }>;
  activeCardIndex: number;
  setActiveCardIndex: (index: number) => void;
}

export function HeroSection({
  isLoading,
  progress,
  cardData,
  activeCardIndex,
  setActiveCardIndex,
}: HeroSectionProps) {
  return (
    <section
      className="w-full min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url(/section_2.jpg)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay with your specified blue color */}
      <div className="absolute inset-0 bg-[#2C2F63]/80" />

      <div className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 transition-all">
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Make Beautiful Memories
        </motion.h1>
        <motion.h2
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-2xl md:text-3xl font-semibold mb-8 max-w-2xl mx-auto drop-shadow-md"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          Take a Personalized Journey Home With Us
        </motion.h2>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl px-4"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {isLoading ? (
            <LoadingIndicator progress={progress} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cardData.map((card, index) => (
                <motion.div
                  key={index}
                  className={`p-6 rounded-xl shadow-xl flex flex-col justify-between h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-[#55526C]/70 backdrop-blur-lg ${
                    activeCardIndex === index ? "ring-4 ring-white/50" : ""
                  }`}
                  whileHover={{ y: -10 }}
                  onClick={() => setActiveCardIndex(index)}
                >
                  <div>
                    <div className="text-4xl mb-4">{card.icon}</div>
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-3">
                      {card.title}
                    </h3>
                    <p className="text-white text-sm md:text-base mb-6">
                      {card.description}
                    </p>
                  </div>
                  <Button className="mt-auto bg-white text-gray-800 hover:bg-gray-100">
                    {card.cta}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Scroll down indicator */}
        <motion.div
          animate={{ opacity: 1, y: [0, 10, 0] }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: 2,
          }}
        >
          <div className="flex flex-col items-center text-white">
            <p className="mb-2 text-sm font-light">Scroll Down</p>
            <ArrowRight className="w-6 h-6 transform rotate-90" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
