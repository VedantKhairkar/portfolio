export const SECTIONS = [
  { id: 'home', label: 'HOME', issue: '00' },
  { id: 'about', label: 'ABOUT', issue: '01' },
  { id: 'projects', label: 'PROJECTS', issue: '02' },
  { id: 'contact', label: 'CONTACT', issue: '03' },
];

export const PROFILE = {
  name: 'Vedant.P.Khairkar',
  shortTagline: 'Turning raw data, neural models, and pipelines into practical AI systems.',
  roles: ['Data Scientist', 'AI/ML Engineer', 'Data Engineer'],
  bio: 'I am Vedant Khairkar, a Computer Science graduate with a strong interest in software development, artificial intelligence, and emerging technologies. I have hands-on experience working on projects involving machine learning, web development, and AI-based applications. I enjoy learning new technologies, solving problems, and building practical solutions. I am a quick learner, adaptable, and always eager to improve my technical skills and grow professionally.',
  location: 'India • Open to Remote & Hybrid',
  status: 'AVAILABLE FOR AI/ML & DATA ROLES',
};

export const SKILL_GROUPS = [
  {
    id: 'ai-ml',
    title: 'AI / ML & VISION',
    sfx: 'ZAP!',
    accent: 'magenta',
    skills: [
      'Convolutional Neural Networks (CNN)',
      'Sentence-BERT (NLP)',
      'Random Forest',
      'Computer Vision Pipelines',
      'OCR Extraction',
      'scikit-learn / Deep Learning',
    ],
  },
  {
    id: 'data-backend',
    title: 'DATA & BACKEND',
    sfx: 'SYNC!',
    accent: 'cyan',
    skills: [
      'Python',
      'FastAPI',
      'Node.js & Express',
      'MongoDB',
      'ML Model Serving',
      'Data Pipelines & APIs',
    ],
  },
  {
    id: 'web-tools',
    title: 'WEB & INTERFACE',
    sfx: 'POW!',
    accent: 'yellow',
    skills: [
      'React',
      'Vite',
      'MERN Stack',
      'Three.js / R3F',
      'Geolocation Tracking',
      'REST Architecture',
    ],
  },
];

export const PROJECTS = [
  {
    id: 'mockprep',
    issue: 'ISSUE #01',
    sfx: 'EVAL!',
    accent: 'magenta',
    title: 'MockPrep',
    subtitle: 'AI-Based Interview Assessment Using Emotion, Speech, and Answer Analysis',
    description:
      'Evaluates mock interview performance across multiple modalities: facial expression tracking, vocal confidence scoring, and semantic answer relevance.',
    highlights: [
      'CNN model for real-time facial emotion recognition',
      'Random Forest classifier for speech confidence assessment',
      'Sentence-BERT + keyword matching for semantic answer scoring',
    ],
    stack: ['CNN', 'Random Forest', 'Sentence-BERT', 'Python', 'NLP', 'Computer Vision'],
  },
  {
    id: 'smart-agri',
    issue: 'ISSUE #02',
    sfx: 'GROW!',
    accent: 'cyan',
    title: 'AI-Based Smart Agriculture Assistant',
    subtitle: 'End-to-End Crop, Soil & Leaf Disease Intelligence Platform',
    description:
      'Integrates a full-stack React, Node.js, and MongoDB web application with FastAPI machine learning microservices to assist farmers with actionable insights.',
    highlights: [
      'OCR pipeline for automated soil health report parsing',
      'ML-driven crop prediction & tailored fertilizer recommendations',
      'Computer vision leaf disease detection via FastAPI endpoints',
    ],
    stack: ['React', 'Node.js', 'MongoDB', 'FastAPI', 'OCR', 'Computer Vision'],
  },
  {
    id: 'waste-platform',
    issue: 'ISSUE #03',
    sfx: 'SCAN!',
    accent: 'yellow',
    title: 'AI Community Waste Reporting Platform',
    subtitle: 'Geo-Tagged Civic Waste Verification & Classification System',
    description:
      'Empowers communities to report urban waste through a MERN stack interface with live location tracking backed by a two-stage FastAPI vision pipeline.',
    highlights: [
      'MERN stack reporting portal with geo-location tracking',
      'Stage 1 FastAPI CV model verifies genuine waste imagery',
      'Stage 2 classifier categorizes garbage types for cleanup routing',
    ],
    stack: ['MongoDB', 'Express', 'React', 'Node.js', 'FastAPI', 'Two-Stage CV'],
  },
];

// Update these placeholders with your real contact details anytime.
export const CONTACTS = [
  {
    id: 'email',
    label: 'EMAIL',
    bubbleTitle: 'PING MY INBOX!',
    value: 'vedant.khairkar@example.com',
    href: 'mailto:vedant.khairkar@example.com',
    accent: 'yellow',
    copyable: true,
    note: 'Click to copy or open mail client',
  },
  {
    id: 'github',
    label: 'GITHUB',
    bubbleTitle: 'CHECK THE REPOS!',
    value: 'github.com/vedant-khairkar',
    href: 'https://github.com/vedant-khairkar',
    accent: 'cyan',
    copyable: false,
    note: 'ML pipelines, FastAPI & MERN builds',
  },
  {
    id: 'linkedin',
    label: 'LINKEDIN',
    bubbleTitle: 'LET’S CONNECT!',
    value: 'linkedin.com/in/vedant-khairkar',
    href: 'https://www.linkedin.com/in/vedant-khairkar',
    accent: 'magenta',
    copyable: false,
    note: 'Open to Data Science & AI/ML roles',
  },
];
