

import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Linkedin, Mail, Terminal, Cpu, Code, Database, Zap, Layers, BookOpen } from 'lucide-react';
import NeuralBackground from './components/NeuralBackground';
import GlitchText from './components/GlitchText';
import DiffusionText from './components/DiffusionText';
import GithubActivity from './components/GithubActivity';
import TextReveal from './components/TextReveal';
import { BIO, EXPERIENCE, EDUCATION, PROJECTS, SKILLS, SOCIALS } from './constants';

// Typewriter Hook
const useTypewriter = (text: string, speed: number = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayedText;
};

const SectionTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode; subtitle?: string }> = ({ children, icon, subtitle }) => (
  <div className="flex items-end justify-between mb-8 border-b border-neutral-800 pb-4 group">
    <div className="flex items-center gap-3">
      <div className="bg-neutral-900 p-2 border border-neutral-800 group-hover:border-emerald-500/50 transition-colors">
        <span className="text-emerald-500">{icon}</span>
      </div>
      <div>
        <DiffusionText as="h2" className="text-2xl font-bold tracking-tight font-mono uppercase text-neutral-200">
          {children}
        </DiffusionText>
        {subtitle && <div className="text-xs text-neutral-500 font-mono mt-1">{subtitle}</div>}
      </div>
    </div>
    <div className="hidden md:block h-1 w-12 bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors"></div>
  </div>
);

const App: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const typedRole = useTypewriter(BIO.role, 70);

  return (
    <div className="min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      <NeuralBackground />
      
      {/* Decorative Side Borders */}
      <div className="fixed left-0 top-0 h-full w-12 border-r border-neutral-800 hidden xl:flex flex-col justify-between items-center py-12 z-40 bg-[#050505]/80 backdrop-blur-sm">
        <div className="vertical-text font-mono text-[10px] text-neutral-600 tracking-widest uppercase opacity-50 rotate-180">
          System Status: Online
        </div>
        <div className="flex flex-col gap-8">
          {SOCIALS.map((social) => (
            <a 
              key={social.platform} 
              href={social.url} 
              target={social.url.startsWith('mailto') ? undefined : "_blank"}
              rel="noreferrer"
              className="text-neutral-600 hover:text-emerald-400 transition-colors relative group"
              title={social.platform}
            >
              {social.icon === 'github' && <Github size={20} />}
              {social.icon === 'linkedin' && <Linkedin size={20} />}
              {social.icon === 'mail' && <Mail size={20} />}
              
              <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-neutral-900 text-xs text-emerald-500 border border-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {social.platform === 'Email' ? BIO.email : social.platform}
              </span>
            </a>
          ))}
        </div>
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-emerald-900 to-transparent"></div>
      </div>

      {/* Gradient Overlay for Readability */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#050505]/0 via-[#050505]/60 to-[#050505]/90"></div>
      
      {/* Main Content Wrapper - z-10 ensures it sits above background */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 xl:pl-24 relative z-10">
        
        {/* Header / Hero */}
        <header className="mb-24 md:mb-32 relative">
          <TextReveal>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-mono uppercase tracking-wider rounded-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Open for Collaboration
            </div>
          </TextReveal>
          
          <div className="relative">
            <TextReveal delay={100}>
              <DiffusionText 
                text={BIO.name} 
                as="h1" 
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tighter"
              />
            </TextReveal>
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30"></div>
          </div>

          <TextReveal delay={200}>
            <h2 className="text-xl md:text-3xl text-neutral-400 font-mono mb-8 flex items-center gap-3 h-8">
              <span className="text-emerald-500 mt-1">&gt;</span>
              <span>{typedRole}</span>
              <span className="w-3 h-6 bg-emerald-500 cursor-blink mt-1"></span>
            </h2>
          </TextReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TextReveal delay={300}>
              <div className="text-neutral-400 leading-relaxed border-l-2 border-neutral-800 pl-6 text-lg bg-gradient-to-r from-neutral-900/50 to-transparent py-2 pr-4 rounded-r-lg backdrop-blur-sm">
                <DiffusionText as="p">{BIO.summary}</DiffusionText>
              </div>
            </TextReveal>
            
            <TextReveal delay={400}>
              <div className="flex flex-col justify-center gap-3 md:items-start">
                <div className="flex items-center gap-2 text-sm font-mono text-neutral-500">
                  <Terminal size={14} />
                  <span>Location: {BIO.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono text-neutral-500">
                  <Database size={14} />
                  <span>Stack: Python, PyTorch, C++</span>
                </div>
              </div>
            </TextReveal>
          </div>
        </header>

        {/* GitHub Section */}
        <section className="mb-24">
          <TextReveal>
            <GithubActivity />
          </TextReveal>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          
          {/* Left Column: Experience & Education */}
          <div className="lg:col-span-7 space-y-24">
            
            {/* Experience */}
            <section>
              <TextReveal>
                <SectionTitle icon={<Cpu size={20} />} subtitle="PROFESSIONAL HISTORY">Experience</SectionTitle>
              </TextReveal>
              
              <div className="space-y-12 relative">
                {/* Connecting Line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-[1px] bg-neutral-800"></div>

                {EXPERIENCE.map((exp, idx) => (
                  <TextReveal key={idx} delay={idx * 100}>
                    <div className="relative pl-8 group">
                      <div className="absolute left-0 top-2 w-[19px] h-[19px] bg-[#030303] border border-neutral-600 rounded-full group-hover:border-emerald-500 group-hover:bg-emerald-500/20 transition-all z-10 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full group-hover:bg-emerald-400"></div>
                      </div>
                      
                      <div className="liquid-glass p-6 rounded-sm">
                          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Cpu size={48} />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 relative z-10">
                              <DiffusionText as="h3" className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{exp.role}</DiffusionText>
                              <span className="font-mono text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-sm border border-emerald-500/20">{exp.duration}</span>
                          </div>
                          
                          <div className="text-neutral-400 font-mono text-sm mb-4 flex items-center gap-2">
                              <span>@ {exp.company}</span>
                          </div>
                          
                          <ul className="space-y-2 mb-5 relative z-10">
                          {exp.description.map((desc, i) => (
                              <li key={i} className="text-neutral-400 text-sm leading-relaxed flex items-baseline gap-3">
                              <span className="text-emerald-500">»</span>
                              <DiffusionText as="span">{desc}</DiffusionText>
                              </li>
                          ))}
                          </ul>
                          
                          {exp.tech && (
                          <div className="flex flex-wrap gap-2 relative z-10 border-t border-neutral-800 pt-3">
                              {exp.tech.map(t => (
                              <span key={t} className="px-2 py-1 bg-black/50 border border-neutral-700 text-[10px] uppercase tracking-wider text-neutral-400 font-mono hover:text-emerald-400 hover:border-emerald-500/50 transition-colors">
                                  {t}
                              </span>
                              ))}
                          </div>
                          )}
                      </div>
                    </div>
                  </TextReveal>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <TextReveal>
                <SectionTitle icon={<Code size={20} />} subtitle="ACADEMIC BACKGROUND">Education</SectionTitle>
              </TextReveal>
              <div className="space-y-6">
                {EDUCATION.map((edu, idx) => (
                  <TextReveal key={idx} delay={idx * 100}>
                    <div className="p-6 border-l-2 border-neutral-800 liquid-glass group">
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <DiffusionText as="h3" className="text-lg font-bold text-neutral-200 group-hover:text-white transition-colors">{edu.company}</DiffusionText>
                        <span className="text-xs font-mono text-neutral-500">{edu.duration}</span>
                      </div>
                      <div className="text-neutral-400 text-sm mb-3 relative z-10">{edu.role}</div>
                      <div className="relative z-10">
                        {edu.description.map((d, i) => (
                          <div key={i} className="inline-block mr-3 text-emerald-500/80 font-mono text-xs bg-emerald-500/5 px-2 py-1 rounded-sm">
                            <DiffusionText as="span">{d}</DiffusionText>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TextReveal>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Skills & Tools */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <TextReveal>
                <SectionTitle icon={<Terminal size={20} />} subtitle="CAPABILITIES">Tech Stack</SectionTitle>
              </TextReveal>
              
              <div className="grid gap-8">
                {/* Core Proficiency */}
                <TextReveal delay={100}>
                  <div className="liquid-glass p-6">
                    
                    <h3 className="text-xs font-mono uppercase text-emerald-500 mb-6 flex items-center gap-2 relative z-10">
                      <Zap size={12} /> Core Systems
                    </h3>
                    
                    {SKILLS.filter(s => s.category === 'Core').map(skill => (
                      <div key={skill.name} className="mb-5 last:mb-0 relative z-10">
                        <div className="flex justify-between text-xs font-mono mb-2 uppercase tracking-wider">
                          <span className="text-neutral-300">{skill.name}</span>
                          <span className="text-emerald-500">{skill.level}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-900 overflow-hidden relative border border-neutral-800">
                          <div 
                            className="h-full bg-emerald-600 relative"
                            style={{ width: `${skill.level}%` }}
                          >
                              <div className="absolute right-0 top-0 h-full w-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TextReveal>

                {/* Skill Tags */}
                <TextReveal delay={200}>
                  <div className="liquid-glass p-6">
                    <h3 className="text-xs font-mono uppercase text-emerald-500 mb-4 flex items-center gap-2 relative z-10">
                      <Layers size={12} /> Libraries & Tools
                    </h3>
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {SKILLS.filter(s => s.category !== 'Core').map(skill => (
                        <span 
                          key={skill.name}
                          onMouseEnter={() => setHoveredSkill(skill.name)}
                          onMouseLeave={() => setHoveredSkill(null)}
                          className={`
                            px-3 py-1.5 font-mono text-xs border transition-all cursor-default relative overflow-hidden
                            ${hoveredSkill === skill.name 
                              ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                              : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-600'}
                          `}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </TextReveal>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <section className="mb-24">
          <TextReveal>
            <SectionTitle icon={<Database size={20} />} subtitle="CODE REPOSITORIES">Deployments</SectionTitle>
          </TextReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project, idx) => (
              <TextReveal key={idx} delay={idx * 100} className="h-full">
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="group block h-full"
                >
                  <div className="h-full p-6 liquid-glass hover:border-emerald-500/50 flex flex-col">
                    {/* Industrial Corners */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-neutral-700 group-hover:border-emerald-500 transition-colors"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-neutral-700 group-hover:border-emerald-500 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-neutral-700 group-hover:border-emerald-500 transition-colors"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-neutral-700 group-hover:border-emerald-500 transition-colors"></div>
                    
                    <div className="mb-5 flex justify-between items-start relative z-10">
                      <span className={`
                        px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm
                        ${project.type === 'Research' ? 'border-purple-500/30 text-purple-400 bg-purple-900/10' : 
                          project.type === 'Application' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-900/10' : 
                          project.type === 'Project' ? 'border-blue-500/30 text-blue-400 bg-blue-900/10' :
                          'border-blue-500/30 text-blue-400 bg-blue-900/10'}
                      `}>
                        {project.type}
                      </span>
                      <ExternalLink size={16} className="text-neutral-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-neutral-200 mb-3 group-hover:text-emerald-400 transition-colors font-mono relative z-10">
                      <DiffusionText as="span">{project.title}</DiffusionText>
                    </h3>
                    
                    <div className="text-xs text-neutral-400 mb-6 flex-grow leading-relaxed relative z-10">
                      <DiffusionText as="p">{project.description}</DiffusionText>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-neutral-800/50 relative z-10">
                      {project.tech.map(t => (
                        <span key={t} className="text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300 transition-colors">#{t}</span>
                      ))}
                    </div>
                  </div>
                </a>
              </TextReveal>
            ))}
          </div>
        </section>

        {/* Research Papers Section */}
        <section className="mb-24">
          <TextReveal>
            <SectionTitle icon={<BookOpen size={20} />} subtitle="PUBLICATIONS">Research Papers</SectionTitle>
          </TextReveal>
          <TextReveal delay={100}>
            <div className="w-full p-12 border border-neutral-800 bg-[#0d1117] flex flex-col items-center justify-center text-center relative overflow-hidden group">
               {/* Industrial Decor */}
               <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/50"></div>
               <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/50"></div>
               <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/50"></div>
               <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/50"></div>
               
               <div className="mb-4 p-4 bg-neutral-900/50 rounded-full border border-neutral-800 group-hover:border-emerald-500/30 transition-colors">
                  <BookOpen size={32} className="text-neutral-600 group-hover:text-emerald-500 transition-colors" />
               </div>
               
               <DiffusionText as="h3" className="text-xl font-bold text-neutral-300 font-mono mb-2">
                 Coming Soon...
               </DiffusionText>
               
               <p className="text-neutral-500 text-sm max-w-md mx-auto">
                 Research papers and publications will be listed here once published. Currently working on Vision-Language Models and Object Tracking.
               </p>
            </div>
          </TextReveal>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-800 pt-12 pb-8 text-center relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#030303] px-4 text-neutral-600">
             <Terminal size={16} />
           </div>
           <p className="text-neutral-500 font-mono text-xs mb-6 uppercase tracking-widest">
             Designed & Engineered by <span className="text-emerald-500">Shivesh Rane</span>
           </p>
           <div className="flex flex-col items-center gap-4">
             <div className="flex justify-center gap-8">
               {SOCIALS.filter(social => social.platform !== 'Email').map((social) => (
                  <a 
                    key={social.platform} 
                    href={social.url} 
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 hover:text-emerald-500 transition-colors"
                  >
                    {social.platform}
                  </a>
               ))}
             </div>
             <div className="text-neutral-600 font-mono text-xs select-all hover:text-emerald-500 transition-colors cursor-text">
                {BIO.email}
             </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default App;