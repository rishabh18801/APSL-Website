import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Fades/slides children in when they scroll into view. */
export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, text, center }: { eyebrow: string; title: ReactNode; text?: string; center?: boolean }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <span className="eyebrow">
        <span className="h-px w-6 bg-signal" /> {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-relaxed text-mist sm:text-lg">{text}</p>}
    </Reveal>
  );
}
