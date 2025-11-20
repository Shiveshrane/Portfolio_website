

import { ExperienceItem, Project, Skill, SocialLink } from './types';

export const BIO = {
  name: import.meta.env.VITE_NAME || "Portfolio Owner",
  role: "CS STUDENT / AI RESEARCHER",
  summary: "Final year CSE student who also loves gaslighting machines. Specialising in NLP and language modelling. Currently exploring CUDA and Text Diffusion.",
  location: import.meta.env.VITE_LOCATION || "Location",
  email: import.meta.env.VITE_EMAIL || "email@example.com"
};

export const SKILLS: Skill[] = [
  { name: "Natural Language Processing", level: 90, category: "Core" },
  { name: "Computer Vision", level: 70, category: "Core" },
  { name: "PyTorch", level: 90, category: "Frameworks" },
  { name: "TensorFlow", level: 80, category: "Frameworks" },
  { name: "Sci-kit Learn", level: 85, category: "Frameworks" },
  { name: "Transformers (HF)", level: 88, category: "Frameworks" },
  { name: "Flask", level: 75, category: "Frameworks" },
  { name: "Python", level: 98, category: "Languages" },
  { name: "C++", level: 80, category: "Languages" },
  { name: "SQL", level: 75, category: "Languages" },
  { name: "NumPy/Pandas", level: 90, category: "Frameworks" },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    role: "Research Intern",
    company: "IIT Goa",
    duration: "July 2025 - Sept 2025",
    description: [
      "Working on language-based object tracking using CLIP and YOLO architectures.",
      "Explored the possibilities of Vision langage models for Object detection pipelines."
    ],
    tech: ["CLIP", "YOLO", "PyTorch", "Computer Vision"]
  }
];

export const EDUCATION: ExperienceItem[] = [
  {
    role: "Bachelor of Engineering (Computer Engineering)",
    company: "Goa College of Engineering",
    duration: "Sep 2022 - Present",
    description: [
      "CGPA: 8.2 (Sem VI)",
      "Coursework: Data Structures, Algorithms, AI, Machine Learning"
    ]
  },
  {
    role: "Pre-University Course (PUC)",
    company: "Rosary Higher Secondary School, Navelim",
    duration: "Sep 2020 - Mar 2022",
    description: ["Grade: 84%"]
  }
];

export const PROJECTS: Project[] = [
  {
    title: "Research Paper Implementations",
    description: "Implemented multiple research papers from scratch in Tensorflow and Pytorch to understand their various concepts and architecture.",
    tech: ["PyTorch", "Tensorflow", "Model Architecture", "Research", "Deep Learning"],
    link: import.meta.env.VITE_GITHUB_URL || "https://github.com",
    type: "Implementation"
  },
  {
    title: "SkimLit",
    description: "Implemented the Skim-Lit paper on PubMed 200k RCT dataset achieving ~83% validation accuracy. Developed a multi-modal text input method with word token and character token embedding inputs.",
    tech: ["TensorFlow", "NLP", "Embeddings", "Research"],
    link: import.meta.env.VITE_GITHUB_URL || "https://github.com", 
    type: "Project"
  },
  {
    title: "YOLO Cricket Ball Speed Estimator",
    description: "Fine-tuned YOLO-V5 model to track cricket balls and pitch. Applied perspective transformation to provide a standardized view of the ball's path and calculated physical displacement over time for speed estimation.",
    tech: ["YOLO-V5", "OpenCV", "PyTorch", "Perspective Transform"],
    link: import.meta.env.VITE_GITHUB_URL || "https://github.com",
    type: "Application"
  }
];

export const SOCIALS: SocialLink[] = [
  { platform: "GitHub", url: import.meta.env.VITE_GITHUB_URL || "https://github.com", icon: "github" },
  { platform: "LinkedIn", url: import.meta.env.VITE_LINKEDIN_URL || "https://linkedin.com", icon: "linkedin" },
  { platform: "Email", url: `mailto:${BIO.email}`, icon: "mail" }
];