import type { Exam, Paper, Question } from '@shared/schema';

export const mockExams: Exam[] = [
  {
    id: 1,
    name: 'JEE Main',
    description: 'Joint Entrance Examination for engineering admissions',
    icon: 'calculator',
    category: 'Engineering',
    isPopular: true,
    totalQuestions: 12450,
    yearsAvailable: 20,
    createdAt: new Date(),
  },
  {
    id: 2,
    name: 'NEET UG',
    description: 'National Eligibility cum Entrance Test for medical',
    icon: 'heartbeat',
    category: 'Medical',
    isPopular: true,
    totalQuestions: 8200,
    yearsAvailable: 15,
    createdAt: new Date(),
  },
  {
    id: 3,
    name: 'GATE',
    description: 'Graduate Aptitude Test in Engineering',
    icon: 'cogs',
    category: 'Engineering',
    isPopular: false,
    totalQuestions: 15600,
    yearsAvailable: 25,
    createdAt: new Date(),
  },
];

export const mockPapers: Paper[] = [
  {
    id: 1,
    examId: 1,
    year: 2023,
    title: 'JEE Main 2023 Session 1',
    totalQuestions: 90,
    duration: 180,
    isFree: true,
    createdAt: new Date(),
  },
  {
    id: 2,
    examId: 1,
    year: 2022,
    title: 'JEE Main 2022 Session 1',
    totalQuestions: 90,
    duration: 180,
    isFree: true,
    createdAt: new Date(),
  },
  {
    id: 3,
    examId: 1,
    year: 2021,
    title: 'JEE Main 2021 Session 1',
    totalQuestions: 90,
    duration: 180,
    isFree: false,
    createdAt: new Date(),
  },
];

export const mockQuestions: Question[] = [
  {
    id: 1,
    paperId: 1,
    questionNumber: 1,
    questionText: 'What is the derivative of sin(x)?',
    options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
    correctAnswer: 'cos(x)',
    explanation: 'The derivative of sin(x) with respect to x is cos(x). This is a fundamental result in calculus.',
    subject: 'Mathematics',
    topic: 'Differentiation',
    difficulty: 'Easy',
    createdAt: new Date(),
  },
  {
    id: 2,
    paperId: 1,
    questionNumber: 2,
    questionText: 'Which of the following is the correct formula for kinetic energy?',
    options: ['KE = ½mv²', 'KE = mv²', 'KE = 2mv²', 'KE = m²v'],
    correctAnswer: 'KE = ½mv²',
    explanation: 'Kinetic energy is the energy possessed by an object due to its motion. The formula is KE = ½mv², where m is mass and v is velocity.',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'Easy',
    createdAt: new Date(),
  },
  // Questions for paper ID 2
  {
    id: 3,
    paperId: 2,
    questionNumber: 1,
    questionText: 'What is the value of π (pi) to two decimal places?',
    options: ['3.14', '3.15', '3.16', '3.17'],
    correctAnswer: '3.14',
    explanation: 'The value of π (pi) is approximately 3.14159..., so to two decimal places it is 3.14.',
    subject: 'Mathematics',
    topic: 'Constants',
    difficulty: 'Easy',
    createdAt: new Date(),
  },
  {
    id: 4,
    paperId: 2,
    questionNumber: 2,
    questionText: 'Which of the following is a vector quantity?',
    options: ['Mass', 'Temperature', 'Velocity', 'Time'],
    correctAnswer: 'Velocity',
    explanation: 'Velocity is a vector quantity because it has both magnitude and direction. Mass, temperature, and time are scalar quantities.',
    subject: 'Physics',
    topic: 'Vectors',
    difficulty: 'Easy',
    createdAt: new Date(),
  },
  {
    id: 5,
    paperId: 2,
    questionNumber: 3,
    questionText: 'What is the chemical symbol for gold?',
    options: ['Ag', 'Au', 'Fe', 'Cu'],
    correctAnswer: 'Au',
    explanation: 'The chemical symbol for gold is Au, which comes from the Latin word "aurum".',
    subject: 'Chemistry',
    topic: 'Elements',
    difficulty: 'Easy',
    createdAt: new Date(),
  },
  {
    id: 6,
    paperId: 2,
    questionNumber: 4,
    questionText: 'What is the SI unit of electric current?',
    options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
    correctAnswer: 'Ampere',
    explanation: 'The SI unit of electric current is the Ampere (A), named after André-Marie Ampère.',
    subject: 'Physics',
    topic: 'Electricity',
    difficulty: 'Medium',
    createdAt: new Date(),
  },
  {
    id: 7,
    paperId: 2,
    questionNumber: 5,
    questionText: 'What is the formula for the area of a circle?',
    options: ['A = πr', 'A = πr²', 'A = 2πr', 'A = 2πr²'],
    correctAnswer: 'A = πr²',
    explanation: 'The area of a circle is given by the formula A = πr², where r is the radius of the circle.',
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'Easy',
    createdAt: new Date(),
  },
  {
    id: 8,
    paperId: 2,
    questionNumber: 6,
    questionText: 'Which gas is most abundant in Earth\'s atmosphere?',
    options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
    correctAnswer: 'Nitrogen',
    explanation: 'Nitrogen (N₂) is the most abundant gas in Earth\'s atmosphere, making up about 78% of the air.',
    subject: 'Chemistry',
    topic: 'Atmosphere',
    difficulty: 'Easy',
    createdAt: new Date(),
  },
  {
    id: 9,
    paperId: 2,
    questionNumber: 7,
    questionText: 'What is the speed of light in vacuum?',
    options: ['3 × 10⁸ m/s', '3 × 10⁷ m/s', '3 × 10⁹ m/s', '3 × 10⁶ m/s'],
    correctAnswer: '3 × 10⁸ m/s',
    explanation: 'The speed of light in vacuum is approximately 3 × 10⁸ meters per second.',
    subject: 'Physics',
    topic: 'Light',
    difficulty: 'Medium',
    createdAt: new Date(),
  },
  {
    id: 10,
    paperId: 2,
    questionNumber: 8,
    questionText: 'What is the atomic number of carbon?',
    options: ['6', '12', '14', '16'],
    correctAnswer: '6',
    explanation: 'Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus.',
    subject: 'Chemistry',
    topic: 'Atomic Structure',
    difficulty: 'Easy',
    createdAt: new Date(),
  },
];
