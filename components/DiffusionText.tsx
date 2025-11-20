import React, { useEffect, useState, useRef } from 'react';

interface DiffusionTextProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const DiffusionText: React.FC<DiffusionTextProps> = ({ text, children, className = "", as: Tag = 'span' }) => {
  const content = text || (typeof children === 'string' ? children : '');
  const [displayText, setDisplayText] = useState(content); // Start with content to avoid layout shift, or noise?
  // If we start with content, it looks normal until JS kicks in.
  // If we start with noise, it looks glitchy immediately.
  // Let's start with noise if we can, but we need to generate it.
  // Actually, for SSR/SEO reasons, starting with content is safer, but for effect, starting with noise is better.
  // Since this is a client-side app (Vite), we can start with noise.
  
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !content) return;

    let frame = 0;
    const duration = 1000;
    const fps = 30;
    const totalFrames = (duration / 1000) * fps;
    
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      if (progress >= 1) {
        setDisplayText(content);
        clearInterval(interval);
        return;
      }
      
      setDisplayText(
        content.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (Math.random() < progress) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );
    }, 1000 / fps);
    
    return () => clearInterval(interval);
  }, [isVisible, content]);

  return (
    <Tag ref={ref} className={className}>{displayText}</Tag>
  );
};

export default DiffusionText;
