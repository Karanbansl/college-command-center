// Data for the College Resource Command Center

export interface Resource {
  id: string
  title: string
  description: string
  type: 'pdf' | 'link' | 'video' | 'doc'
  subject: string
  tags: string[]
  url: string
  size?: string
  date?: string
  icon?: string
}

export interface UniversityLink {
  id: string
  title: string
  description: string
  url: string
  icon: string
  color: string
  glowColor: string
}

export const resources: Resource[] = [
  // Computer Science
  {
    id: '1',
    title: 'Data Structures & Algorithms - Complete Notes',
    description: 'Comprehensive notes covering arrays, trees, graphs, sorting, and complexity analysis.',
    type: 'pdf',
    subject: 'Computer Science',
    tags: ['DSA', 'Arrays', 'Trees', 'Algorithms'],
    url: '#',
    size: '4.2 MB',
    date: '2024-02-10',
  },
  {
    id: '2',
    title: 'Operating Systems - Process Management',
    description: 'Detailed lecture notes on processes, threads, scheduling, and synchronization.',
    type: 'pdf',
    subject: 'Computer Science',
    tags: ['OS', 'Processes', 'Scheduling'],
    url: '#',
    size: '2.8 MB',
    date: '2024-01-22',
  },
  {
    id: '3',
    title: 'Database Management Systems',
    description: 'Full DBMS guide including SQL, normalization, transactions, and NoSQL overview.',
    type: 'pdf',
    subject: 'Computer Science',
    tags: ['DBMS', 'SQL', 'Normalization'],
    url: '#',
    size: '5.1 MB',
    date: '2024-02-15',
  },
  {
    id: '4',
    title: 'Machine Learning Crash Course',
    description: 'Introduction to ML algorithms, neural networks, and model evaluation metrics.',
    type: 'link',
    subject: 'AI/ML',
    tags: ['ML', 'Neural Networks', 'Python'],
    url: 'https://developers.google.com/machine-learning/crash-course',
    date: '2024-02-01',
  },
  {
    id: '5',
    title: 'Computer Networks - Full Syllabus',
    description: 'OSI model, TCP/IP, routing algorithms, and network security fundamentals.',
    type: 'pdf',
    subject: 'Computer Science',
    tags: ['Networks', 'TCP/IP', 'OSI'],
    url: '#',
    size: '3.5 MB',
    date: '2024-01-30',
  },
  {
    id: '6',
    title: 'Digital Electronics Handbook',
    description: 'Boolean algebra, logic gates, sequential circuits, and microprocessor basics.',
    type: 'pdf',
    subject: 'Electronics',
    tags: ['Digital', 'Logic Gates', 'Circuits'],
    url: '#',
    size: '6.0 MB',
    date: '2024-02-05',
  },
  {
    id: '7',
    title: 'React.js Official Documentation',
    description: 'The complete React docs — hooks, state management, and component patterns.',
    type: 'link',
    subject: 'Web Dev',
    tags: ['React', 'JavaScript', 'Frontend'],
    url: 'https://react.dev',
    date: '2024-02-20',
  },
  {
    id: '8',
    title: 'Cloud Computing - AWS Fundamentals',
    description: 'Introduction to cloud services, EC2, S3, Lambda, and IAM configuration.',
    type: 'pdf',
    subject: 'Cloud',
    tags: ['AWS', 'Cloud', 'DevOps'],
    url: '#',
    size: '2.3 MB',
    date: '2024-02-18',
  },
  {
    id: '9',
    title: 'Compiler Design - Aho Ulman Summary',
    description: 'Lexical analysis, parsing, semantic analysis, and code generation notes.',
    type: 'pdf',
    subject: 'Computer Science',
    tags: ['Compiler', 'Parsing', 'Theory'],
    url: '#',
    size: '3.9 MB',
    date: '2024-01-15',
  },
  {
    id: '10',
    title: 'Mathematics for Engineers - Syllabus Pack',
    description: 'Calculus, linear algebra, probability, and discrete mathematics all-in-one.',
    type: 'pdf',
    subject: 'Mathematics',
    tags: ['Calculus', 'Linear Algebra', 'Probability'],
    url: '#',
    size: '7.2 MB',
    date: '2024-02-08',
  },
  {
    id: '11',
    title: 'Python for Data Science - Jupyter Notebooks',
    description: 'Hands-on notebooks covering pandas, numpy, matplotlib, and scikit-learn.',
    type: 'link',
    subject: 'AI/ML',
    tags: ['Python', 'Data Science', 'Pandas'],
    url: 'https://github.com/jakevdp/PythonDataScienceHandbook',
    date: '2024-02-12',
  },
  {
    id: '12',
    title: 'Software Engineering - Design Patterns',
    description: 'Gang of Four patterns, SOLID principles, and system design interview prep.',
    type: 'pdf',
    subject: 'Software Eng',
    tags: ['Design Patterns', 'SOLID', 'System Design'],
    url: '#',
    size: '4.8 MB',
    date: '2024-02-17',
  },
]

export const universityLinks: UniversityLink[] = [
  {
    id: 'portal',
    title: 'Student Portal',
    description: 'Access fees, results & registrations',
    url: '#',
    icon: 'Layout',
    color: 'from-violet-500 to-purple-600',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  {
    id: 'attendance',
    title: 'Attendance Tracker',
    description: 'View subject-wise attendance',
    url: '#',
    icon: 'CalendarCheck',
    color: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'lms',
    title: 'LMS / Moodle',
    description: 'Assignments, quizzes & lectures',
    url: '#',
    icon: 'BookOpen',
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'library',
    title: 'Digital Library',
    description: 'E-books, journals & research papers',
    url: '#',
    icon: 'Library',
    color: 'from-orange-500 to-amber-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    id: 'exam',
    title: 'Exam Schedule',
    description: 'Timetable and hall tickets',
    url: '#',
    icon: 'ClipboardList',
    color: 'from-rose-500 to-pink-600',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  {
    id: 'placement',
    title: 'Placement Cell',
    description: 'Jobs, internships & placements',
    url: '#',
    icon: 'Briefcase',
    color: 'from-indigo-500 to-violet-600',
    glowColor: 'rgba(99, 102, 241, 0.4)',
  },
]

export const subjects = ['All', 'Computer Science', 'AI/ML', 'Electronics', 'Web Dev', 'Cloud', 'Mathematics', 'Software Eng']
