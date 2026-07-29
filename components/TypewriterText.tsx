'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursorClassName?: string;
}

export function TypewriterText({
  text,
  speed = 80,
  delay = 600,
  className = '',
  cursorClassName = '',
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let charIndex = 0;
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      const intervalId = setInterval(() => {
        if (charIndex <= text.length) {
          setDisplayedText(text.slice(0, charIndex));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(intervalId);
        }
      }, speed);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay]);

  return (
    <span className={`inline ${className}`}>
      {displayedText}
      <span
        className={`inline-block w-[3px] h-[1.1em] align-sub bg-blue-600 ml-0.5 rounded-full animate-blink ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
}
