export interface Project {
  title: string;
  description: string;
  tech: string[];
  link: string;
  type: 'Research' | 'Implementation' | 'Application' | 'Project';
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  description: string[];
  tech?: string[];
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: 'Core' | 'Frameworks' | 'Languages';
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}
