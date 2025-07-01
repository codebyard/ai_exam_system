import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, Attempt } from '@shared/schema';

interface QuestionState {
  questionId: number;
  selectedAnswer: string | null;
  isMarkedForReview: boolean;
  isAnswered: boolean;
  timeSpent: number;
}

interface ExamSession {
  paperId: number;
  mode: 'exam' | 'browse' | 'instant';
  questions: Question[];
  currentQuestionIndex: number;
  questionStates: Record<number, QuestionState>;
  timeRemaining: number; // in seconds
  isTimerRunning: boolean;
  isPaused: boolean;
  attemptId?: number;
}

interface ExamStore {
  session: ExamSession | null;
  
  // Session management
  startSession: (paperId: number, questions: Question[], mode: 'exam' | 'browse' | 'instant', duration?: number) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  
  // Navigation
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  
  // Question interaction
  selectAnswer: (questionId: number, answer: string) => void;
  clearAnswer: (questionId: number) => void;
  toggleMarkForReview: (questionId: number) => void;
  
  // Timer
  updateTimer: () => void;
  
  // State getters
  getCurrentQuestion: () => Question | null;
  getQuestionState: (questionId: number) => QuestionState;
  getSessionSummary: () => {
    answered: number;
    marked: number;
    unanswered: number;
    total: number;
  };
}

const initialQuestionState = (questionId: number): QuestionState => ({
  questionId,
  selectedAnswer: null,
  isMarkedForReview: false,
  isAnswered: false,
  timeSpent: 0,
});

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      session: null,

      startSession: (paperId, questions, mode, duration = 0) => {
        const questionStates: Record<number, QuestionState> = {};
        questions.forEach(q => {
          questionStates[q.id] = initialQuestionState(q.id);
        });

        const sessionData = {
          paperId,
          mode,
          questions,
          currentQuestionIndex: 0,
          questionStates,
          timeRemaining: duration * 60, // convert minutes to seconds
          isTimerRunning: mode === 'exam' || mode === 'instant',
          isPaused: false,
        };

        set({
          session: sessionData
        });
      },

      endSession: () => set({ session: null }),

      pauseSession: () => {
        const { session } = get();
        if (session) {
          set({
            session: { ...session, isPaused: true, isTimerRunning: false }
          });
        }
      },

      resumeSession: () => {
        const { session } = get();
        if (session) {
          set({
            session: { ...session, isPaused: false, isTimerRunning: session.mode === 'exam' || session.mode === 'instant' }
          });
        }
      },

      goToQuestion: (index) => {
        const { session } = get();
        if (session && index >= 0 && index < session.questions.length) {
          set({
            session: { ...session, currentQuestionIndex: index }
          });
        }
      },

      nextQuestion: () => {
        const { session } = get();
        if (session && session.currentQuestionIndex < session.questions.length - 1) {
          set({
            session: { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 }
          });
        }
      },

      previousQuestion: () => {
        const { session } = get();
        if (session && session.currentQuestionIndex > 0) {
          set({
            session: { ...session, currentQuestionIndex: session.currentQuestionIndex - 1 }
          });
        }
      },

      selectAnswer: (questionId, answer) => {
        const { session } = get();
        if (session) {
          const updatedStates = {
            ...session.questionStates,
            [questionId]: {
              ...session.questionStates[questionId],
              selectedAnswer: answer,
              isAnswered: true,
            }
          };
          set({
            session: { ...session, questionStates: updatedStates }
          });
        }
      },

      clearAnswer: (questionId) => {
        const { session } = get();
        if (session) {
          const updatedStates = {
            ...session.questionStates,
            [questionId]: {
              ...session.questionStates[questionId],
              selectedAnswer: null,
              isAnswered: false,
            }
          };
          set({
            session: { ...session, questionStates: updatedStates }
          });
        }
      },

      toggleMarkForReview: (questionId) => {
        const { session } = get();
        if (session) {
          const currentState = session.questionStates[questionId];
          const updatedStates = {
            ...session.questionStates,
            [questionId]: {
              ...currentState,
              isMarkedForReview: !currentState.isMarkedForReview,
            }
          };
          set({
            session: { ...session, questionStates: updatedStates }
          });
        }
      },

      updateTimer: () => {
        const { session } = get();
        if (session && session.isTimerRunning && session.timeRemaining > 0) {
          set({
            session: { ...session, timeRemaining: session.timeRemaining - 1 }
          });
        }
      },

      getCurrentQuestion: () => {
        const { session } = get();
        if (!session || session.questions.length === 0) return null;
        return session.questions[session.currentQuestionIndex];
      },

      getQuestionState: (questionId) => {
        const { session } = get();
        if (!session) return initialQuestionState(questionId);
        return session.questionStates[questionId] || initialQuestionState(questionId);
      },

      getSessionSummary: () => {
        const { session } = get();
        if (!session) {
          return { answered: 0, marked: 0, unanswered: 0, total: 0 };
        }

        let answered = 0;
        let marked = 0;
        let unanswered = 0;

        Object.values(session.questionStates).forEach(state => {
          if (state.isAnswered) {
            answered++;
          } else {
            unanswered++;
          }
          if (state.isMarkedForReview) {
            marked++;
          }
        });

        return {
          answered,
          marked,
          unanswered,
          total: session.questions.length,
        };
      },
    }),
    {
      name: 'exam-session-storage',
      partialize: (state) => ({ session: state.session }),
    }
  )
);
