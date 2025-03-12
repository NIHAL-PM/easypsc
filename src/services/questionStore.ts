
import { Question, ExamType } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuestionStore {
  customQuestions: Question[];
  addQuestion: (question: Question) => void;
  updateQuestion: (questionId: string, updatedQuestion: Question) => void;
  deleteQuestion: (questionId: string) => void;
  getQuestionsByExamType: (examType: ExamType, difficulty?: string) => Question[];
}

export const useQuestionStore = create<QuestionStore>()(
  persist(
    (set, get) => ({
      customQuestions: [
        // Example Malayalam KPSC question
        {
          id: "kpsc-1",
          text: "കേരളത്തിന്റെ ആദ്യത്തെ വനിതാ മുഖ്യമന്ത്രി ആരായിരുന്നു?",
          options: [
            "കെ.ആർ. ഗൗരിയമ്മ", 
            "കമല നെഹ്‌റു", 
            "ഇന്ദിരാ ഗാന്ധി", 
            "നിർമ്മല സീതാരാമൻ"
          ],
          correctOption: 0,
          explanation: "കെ.ആർ. ഗൗരിയമ്മ കേരളത്തിന്റെ ആദ്യത്തെ വനിതാ മുഖ്യമന്ത്രിയായിരുന്നു. അവർ 1957-ലെ കേരള നിയമസഭാ തിരഞ്ഞെടുപ്പിന് ശേഷം ഇ.എം.എസ്. നമ്പൂതിരിപ്പാടിന്റെ കാബിനറ്റിൽ ഒരു മന്ത്രിയായിരുന്നു.",
          category: "കേരള ചരിത്രം",
          difficulty: "medium",
        },
        {
          id: "kpsc-2",
          text: "കേരളത്തിലെ ഏറ്റവും നീളം കൂടിയ നദി ഏതാണ്?",
          options: [
            "പമ്പ", 
            "പെരിയാർ", 
            "ഭാരതപ്പുഴ", 
            "ചാലിയാർ"
          ],
          correctOption: 1,
          explanation: "പെരിയാർ കേരളത്തിലെ ഏറ്റവും നീളം കൂടിയ നദിയാണ്, ഏകദേശം 244 കിലോമീറ്റർ നീളമുണ്ട്.",
          category: "കേരള ഭൂമിശാസ്ത്രം",
          difficulty: "easy",
        },
        {
          id: "kpsc-3",
          text: "കേരളത്തിലെ ആദ്യത്തെ സമ്പൂർണ സാക്ഷരത നേടിയ ജില്ല ഏതാണ്?",
          options: [
            "തിരുവനന്തപുരം",
            "എറണാകുളം",
            "കോഴിക്കോട്",
            "കോട്ടയം"
          ],
          correctOption: 2,
          explanation: "കോഴിക്കോട് ജില്ല 1989-ൽ ഇന്ത്യയിലെ ആദ്യത്തെ 100% സാക്ഷരതാ ജില്ലയായി പ്രഖ്യാപിക്കപ്പെട്ടു.",
          category: "കേരള ചരിത്രം",
          difficulty: "medium",
        },
        {
          id: "kpsc-4",
          text: "കേരളത്തിൽ ആദ്യമായി പ്രിന്റിംഗ് പ്രസ് സ്ഥാപിച്ചത് ആരാണ്?",
          options: [
            "ബെഞ്ചമിൻ ബെയിലി",
            "ഹെർമൻ ഗുണ്ടർട്ട്",
            "അർനോസ് പാതിരി",
            "കാൾ മെയേഴ്സ്"
          ],
          correctOption: 0,
          explanation: "ബെഞ്ചമിൻ ബെയിലി 1821-ൽ കോട്ടയത്ത് സി.എം.എസ് പ്രസ് സ്ഥാപിച്ചു, ഇതാണ് കേരളത്തിലെ ആദ്യത്തെ പ്രിന്റിംഗ് പ്രസ്.",
          category: "കേരള ചരിത്രം",
          difficulty: "hard",
        },
        {
          id: "kpsc-5",
          text: "കേരളത്തിൽ എത്ര ജില്ലകൾ ഉണ്ട്?",
          options: [
            "12",
            "14",
            "15",
            "16"
          ],
          correctOption: 1,
          explanation: "കേരളത്തിൽ 14 ജില്ലകൾ ഉണ്ട്. അവ തിരുവനന്തപുരം, കൊല്ലം, പത്തനംതിട്ട, ആലപ്പുഴ, കോട്ടയം, ഇടുക്കി, എറണാകുളം, തൃശ്ശൂർ, പാലക്കാട്, മലപ്പുറം, കോഴിക്കോട്, വയനാട്, കണ്ണൂർ, കാസർകോഡ് എന്നിവയാണ്.",
          category: "കേരള ഭൂമിശാസ്ത്രം",
          difficulty: "easy",
        }
      ],
      
      addQuestion: (question) => set((state) => ({
        customQuestions: [...state.customQuestions, question]
      })),
      
      updateQuestion: (questionId, updatedQuestion) => set((state) => ({
        customQuestions: state.customQuestions.map(q => 
          q.id === questionId ? updatedQuestion : q
        )
      })),
      
      deleteQuestion: (questionId) => set((state) => ({
        customQuestions: state.customQuestions.filter(q => q.id !== questionId)
      })),
      
      getQuestionsByExamType: (examType, difficulty) => {
        const { customQuestions } = get();
        
        // Filter questions based on exam type (using the category field for now)
        // For KPSC, specifically return Malayalam questions
        let filteredQuestions = customQuestions.filter(q => {
          if (examType === 'PSC' && q.category.includes('കേരള')) {
            // For KPSC exams, return Malayalam questions
            return difficulty ? q.difficulty === difficulty : true;
          } else {
            // For other exam types, filter based on category containing the exam type name
            const matchesExamType = q.category.includes(examType) || 
                                   q.category.toLowerCase().includes(examType.toLowerCase());
            return matchesExamType && (difficulty ? q.difficulty === difficulty : true);
          }
        });
        
        return filteredQuestions;
      }
    }),
    {
      name: 'custom-questions-storage',
    }
  )
);
