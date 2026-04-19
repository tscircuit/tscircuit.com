"use client"

import React, { useState, useEffect } from "react"

import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils/index"

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation */
  words?: string[]
  /** Time in milliseconds between word transitions */
  interval?: number
  /** Additional CSS classes to apply to the container */
  className?: string
  /** Additional CSS classes to apply to the text */
  textClassName?: string
  /** Duration of the transition animation in milliseconds */
  animationDuration?: number
}

export function ContainerTextFlip({
  words = ["better", "modern", "beautiful", "awesome"],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const activeWord = words[currentWordIndex] ?? ""

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, interval)

    return () => clearInterval(intervalId)
  }, [words, interval])

  return (
    <span
      className={cn(
        "relative inline-grid align-bottom text-center leading-[1.08] text-4xl font-bold text-black md:text-7xl dark:text-white",
        "[background:linear-gradient(to_bottom,#f3f4f6,#e5e7eb)]",
        "shadow-[inset_0_-1px_#d1d5db,inset_0_0_0_1px_#d1d5db,_0_4px_8px_#d1d5db]",
        "dark:[background:linear-gradient(to_bottom,#374151,#1f2937)]",
        "dark:shadow-[inset_0_-1px_#10171e,inset_0_0_0_1px_hsla(205,89%,46%,.24),_0_4px_8px_#00000052]",
        className,
      )}
    >
      {words.map((word) => (
        <span
          key={`measure-${word}`}
          aria-hidden="true"
          className={cn(
            "invisible col-start-1 row-start-1 whitespace-nowrap leading-[1.08]",
            textClassName,
          )}
        >
          {word}
        </span>
      ))}

      <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeWord}
            initial={{
              opacity: 0,
              y: "70%",
              filter: "blur(10px)",
            }}
            animate={{
              opacity: 1,
              y: "0%",
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: "-70%",
              filter: "blur(10px)",
            }}
            transition={{
              duration: animationDuration / 1000,
              ease: "easeInOut",
            }}
            className={cn(
              "absolute inset-0 col-start-1 row-start-1 flex items-center justify-center whitespace-nowrap leading-[1.08]",
              textClassName,
            )}
          >
            <span className="inline-block">
              {activeWord.split("").map((letter, index) => (
                <motion.span
                  key={`${activeWord}-${index}`}
                  initial={{
                    opacity: 0,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    delay: index * 0.02,
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
