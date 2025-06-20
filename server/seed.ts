import { db } from "./db";
import { exams, papers, questions } from "@shared/schema";

// Sample exams data
const sampleExams = [
  {
    name: "JEE Main",
    description: "Joint Entrance Examination (Main) for engineering admission",
    icon: "🎓",
    category: "Engineering",
    isPopular: true,
    totalQuestions: 2000,
    yearsAvailable: 10,
  },
  {
    name: "NEET",
    description: "National Eligibility cum Entrance Test for medical admission",
    icon: "🏥",
    category: "Medical",
    isPopular: true,
    totalQuestions: 1800,
    yearsAvailable: 8,
  },
  {
    name: "GATE",
    description: "Graduate Aptitude Test in Engineering",
    icon: "⚙️",
    category: "Engineering",
    isPopular: false,
    totalQuestions: 1500,
    yearsAvailable: 12,
  },
  {
    name: "CAT",
    description: "Common Admission Test for MBA programs",
    icon: "💼",
    category: "Management",
    isPopular: false,
    totalQuestions: 1200,
    yearsAvailable: 6,
  },
];

// Sample papers data - will be inserted after exams to get proper IDs
const createSamplePapers = (examIds: number[]) => [
  // JEE Main papers
  {
    examId: examIds[0], // JEE Main
    year: 2024,
    title: "JEE Main 2024 - January Session",
    totalQuestions: 90,
    duration: 180,
    isFree: false,
  },
  {
    examId: examIds[0], // JEE Main
    year: 2023,
    title: "JEE Main 2023 - January Session",
    totalQuestions: 90,
    duration: 180,
    isFree: true,
  },
  {
    examId: examIds[0], // JEE Main
    year: 2022,
    title: "JEE Main 2022 - June Session",
    totalQuestions: 90,
    duration: 180,
    isFree: true,
  },
  // NEET papers
  {
    examId: examIds[1], // NEET
    year: 2024,
    title: "NEET 2024",
    totalQuestions: 200,
    duration: 200,
    isFree: false,
  },
  {
    examId: examIds[1], // NEET
    year: 2023,
    title: "NEET 2023",
    totalQuestions: 200,
    duration: 200,
    isFree: true,
  },
  {
    examId: examIds[1], // NEET
    year: 2022,
    title: "NEET 2022",
    totalQuestions: 200,
    duration: 200,
    isFree: true,
  },
  // GATE papers
  {
    examId: examIds[2], // GATE
    year: 2024,
    title: "GATE 2024 - Computer Science",
    totalQuestions: 65,
    duration: 180,
    isFree: false,
  },
  {
    examId: examIds[2], // GATE
    year: 2023,
    title: "GATE 2023 - Computer Science",
    totalQuestions: 65,
    duration: 180,
    isFree: true,
  },
  // CAT papers
  {
    examId: examIds[3], // CAT
    year: 2023,
    title: "CAT 2023",
    totalQuestions: 66,
    duration: 120,
    isFree: true,
  },
];

// Sample questions data - will be created after papers are inserted
const createSampleQuestions = (paperIds: number[]) => [
  // JEE Main questions
  {
    paperId: paperIds[1], // JEE Main 2023 (free paper)
    questionNumber: 1,
    questionText: "If the sum of first n terms of an AP is 4n - n², what is the first term?",
    options: ["3", "4", "5", "7"],
    correctAnswer: "A",
    explanation: "First term a₁ = S₁ = 4(1) - 1² = 4 - 1 = 3",
    subject: "Mathematics",
    topic: "Arithmetic Progression",
    difficulty: "Medium",
  },
  {
    paperId: paperIds[1], // JEE Main 2023 (free paper)
    questionNumber: 2,
    questionText: "The velocity of a particle moving along x-axis is given by v = x² - 5x + 6. The acceleration when x = 2 is:",
    options: ["-1 m/s²", "0 m/s²", "1 m/s²", "2 m/s²"],
    correctAnswer: "A",
    explanation: "a = v(dv/dx) = (x² - 5x + 6)(2x - 5). At x = 2: v = 0, so a = 0 × (-1) = 0. But using a = dv/dt = (dv/dx)(dx/dt) = (dv/dx)v, we get the correct answer.",
    subject: "Physics",
    topic: "Kinematics",
    difficulty: "Hard",
  },
  // NEET questions
  {
    paperId: paperIds[4], // NEET 2023 (free paper)
    questionNumber: 1,
    questionText: "Which of the following is not a characteristic of enzyme?",
    options: ["They are specific in their action", "They are consumed in the reaction", "They lower activation energy", "They are mostly proteins"],
    correctAnswer: "B",
    explanation: "Enzymes are biological catalysts that are not consumed in the reaction. They can be used repeatedly.",
    subject: "Biology",
    topic: "Biomolecules",
    difficulty: "Easy",
  },
  {
    paperId: paperIds[4], // NEET 2023 (free paper)
    questionNumber: 2,
    questionText: "The IUPAC name of CH₃-CH(CH₃)-CH₂-CHO is:",
    options: ["3-methylbutanal", "2-methylbutanal", "3-methylbutanoic acid", "2-methylpropanoic acid"],
    correctAnswer: "A",
    explanation: "The longest carbon chain has 4 carbons with aldehyde group. Methyl group is at position 3 from aldehyde carbon.",
    subject: "Chemistry",
    topic: "Nomenclature",
    difficulty: "Medium",
  },
  // GATE questions
  {
    paperId: paperIds[7], // GATE 2023 (free paper)
    questionNumber: 1,
    questionText: "The time complexity of binary search algorithm is:",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
    correctAnswer: "B",
    explanation: "Binary search divides the search space in half at each step, leading to O(log n) time complexity.",
    subject: "Computer Science",
    topic: "Algorithms",
    difficulty: "Easy",
  },
  // CAT questions
  {
    paperId: paperIds[8], // CAT 2023 (free paper)
    questionNumber: 1,
    questionText: "If 'REASONING' is coded as 'SDZRPOJOH', then 'FORMULA' would be coded as:",
    options: ["GPSNVMB", "GPSNUMB", "HPSNVMB", "GPSNVMC"],
    correctAnswer: "A",
    explanation: "Each letter is replaced by the next letter in the alphabet. F→G, O→P, R→S, M→N, U→V, L→M, A→B",
    subject: "Verbal Ability",
    topic: "Coding-Decoding",
    difficulty: "Medium",
  },
];

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Insert exams and get their IDs
    await db.insert(exams).values(sampleExams);
    console.log("✓ Exams seeded");
    
    // Fetch exams (since .returning() is not supported in MySQL)
    const existingExams = await db.select().from(exams).limit(4);
    let examIds: number[] = existingExams.map((exam: any) => exam.id);
    
    // Insert papers with proper exam IDs
    const papersData = createSamplePapers(examIds);
    await db.insert(papers).values(papersData);
    console.log("✓ Papers seeded");
    
    // Fetch papers (since .returning() is not supported in MySQL)
    const existingPapers = await db.select().from(papers).limit(10);
    let paperIds: number[] = existingPapers.map((paper: any) => paper.id);
    
    // Insert questions with proper paper IDs
    if (paperIds.length > 0) {
      const questionsData = createSampleQuestions(paperIds);
      await db.insert(questions).values(questionsData);
      console.log("✓ Questions seeded");
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export { seedDatabase };