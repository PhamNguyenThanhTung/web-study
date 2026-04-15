import React, { useEffect, useState } from 'react';
import trietData from './data/triet_mac_lenin.json';
import kinhTeData from './data/kinh_te_chinh_tri.json';
import cnxhData from './data/cnxh_khoa_hoc.json';

const GRADES = [
  { level: 'Pass', color: 'bg-green-300', desc: 'Nắm vững kiến thức cốt lõi' },
  { level: 'C', color: 'bg-green-400', desc: 'Hiểu cơ bản các khái niệm' },
  { level: 'C+', color: 'bg-green-500', desc: 'Hiểu và ghi nhớ chi tiết' },
  { level: 'B', color: 'bg-teal-500', desc: 'Vận dụng được lý thuyết' },
  { level: 'B+', color: 'bg-teal-600', desc: 'Vận dụng tốt, ít sai sót' },
  { level: 'A', color: 'bg-emerald-600', desc: 'Phân tích & liên hệ thực tiễn' },
  { level: 'A+', color: 'bg-emerald-800', desc: 'Xuất sắc, giải quyết tình huống khó' }
];

const SUBJECTS = [
  { id: 'triet_mac_lenin', name: 'Triết học Mác - Lênin' },
  { id: 'kinh_te_chinh_tri', name: 'Kinh tế Chính trị Mác - Lênin' },
  { id: 'cnxh_khoa_hoc', name: 'Chủ nghĩa Xã hội Khoa học' }
];

const SUBJECT_QUESTION_BANK = {
  triet_mac_lenin: trietData,
  kinh_te_chinh_tri: kinhTeData,
  cnxh_khoa_hoc: cnxhData
};

export default function StudyRoadmapApp() {
  const [step, setStep] = useState(1);
  const [examDate, setExamDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id);
  const [daysLeft, setDaysLeft] = useState(0);
  const [targetGrade, setTargetGrade] = useState(0);
  const [roadmap, setRoadmap] = useState(() => {
    const savedRoadmap = localStorage.getItem('my_study_roadmap');
    return savedRoadmap ? JSON.parse(savedRoadmap) : [];
  });
  const [currentDayTask, setCurrentDayTask] = useState(null);

  useEffect(() => {
    localStorage.setItem('my_study_roadmap', JSON.stringify(roadmap));
  }, [roadmap]);

  const handleStartSetup = () => {
    if (!examDate) return alert('Vui lòng chọn ngày thi!');
    if (!selectedSubject) return alert('Vui lòng chọn môn học!');

    const today = new Date();
    const targetDate = new Date(examDate);
    const diffTime = Math.abs(targetDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return alert('Ngày thi phải ở tương lai!');
    setDaysLeft(diffDays);
    setStep(2);
  };

  const generateRoadmap = () => {
    const generatedRoadmap = Array.from({ length: daysLeft }, (_, i) => ({
      day: i + 1,
      status: i === 0 ? 'unlocked' : 'locked',
      totalQuestions: targetGrade > 4 ? 50 : 30,
      score: 0,
      completed: false
    }));
    setRoadmap(generatedRoadmap);
    setStep(3);
  };

  const startDay = (dayIndex) => {
    const selectedQuestionBank = SUBJECT_QUESTION_BANK[selectedSubject] || [];
    const fallbackQuestions = Array.from({ length: roadmap[dayIndex].totalQuestions }, (_, i) => ({
      id: i + 1,
      question: `Câu hỏi ôn tập số ${i + 1} (Độ khó: ${GRADES[targetGrade].level})`,
      options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
      correct: Math.floor(Math.random() * 4)
    }));

    const questionsPool = selectedQuestionBank.length > 0 ? selectedQuestionBank : fallbackQuestions;
    const totalQuestionsForDay = roadmap[dayIndex].totalQuestions;
    const questionsForDay = Array.from({ length: totalQuestionsForDay }, (_, i) => {
      const question = questionsPool[i % questionsPool.length];
      return {
        id: `${dayIndex + 1}-${question.id}-${i}`,
        question: question.question,
        options: question.options,
        correct: question.correct
      };
    });

    setCurrentDayTask({
      day: dayIndex + 1,
      questions: questionsForDay
    });
    setStep(4);
  };

  const progressPercent =
    roadmap.length > 0 ? Math.round((roadmap.filter((d) => d.completed).length / roadmap.length) * 100) : 0;

  const currentSubjectName = SUBJECTS.find((s) => s.id === selectedSubject)?.name;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-green-200">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold text-green-700 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            StudyFlow
          </h1>
          {step > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500 hidden md:block">Môn: {currentSubjectName}</span>
              {step > 2 && (
                <div className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  Tiến độ: {progressPercent}%
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="animate-fade-in flex flex-col items-center justify-center pt-10">
            <h2 className="text-3xl font-bold mb-4 text-center">Khởi tạo lộ trình</h2>
            <p className="text-slate-500 mb-8 text-center max-w-md">
              Chọn môn học cần ôn tập và xác định ngày thi để hệ thống phân bổ kiến thức.
            </p>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Môn học</label>
                <select
                  className="w-full text-base p-4 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all cursor-pointer bg-white"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ngày thi dự kiến</label>
                <input
                  type="date"
                  className="w-full text-base p-4 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>

              <button
                onClick={handleStartSetup}
                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in flex flex-col items-center pt-10">
            <h2 className="text-3xl font-bold mb-2">Mục tiêu của bạn là gì?</h2>
            <p className="text-slate-500 mb-10">Còn {daysLeft} ngày nữa. Độ khó sẽ được tinh chỉnh dựa trên target của bạn.</p>

            <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 w-full max-w-2xl text-center">
              <div className="text-5xl font-black mb-4 transition-colors duration-500 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-700">
                {GRADES[targetGrade].level}
              </div>
              <p className="text-lg text-slate-600 mb-12 h-8">{GRADES[targetGrade].desc}</p>

              <input
                type="range"
                min="0"
                max="6"
                value={targetGrade}
                onChange={(e) => setTargetGrade(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600 mb-12"
              />

              <div className="flex justify-between text-xs font-bold text-slate-400 px-2 mb-10">
                <span>Pass</span>
                <span>A+</span>
              </div>

              <button
                onClick={generateRoadmap}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-md"
              >
                Bắt đầu tạo lộ trình
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Lộ trình {currentSubjectName} ({daysLeft} ngày)</h2>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roadmap.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    day.status === 'unlocked'
                      ? 'bg-white border-green-500 shadow-lg cursor-pointer hover:-translate-y-1'
                      : day.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => day.status === 'unlocked' && startDay(idx)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Day {day.day}</span>
                    {day.completed && <span className="text-green-600">✓</span>}
                  </div>
                  <p className="text-sm text-slate-500">{day.totalQuestions} câu hỏi</p>

                  {day.status === 'unlocked' && (
                    <div className="mt-4 text-sm font-semibold text-green-600">Vào làm bài →</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && currentDayTask && (
          <QuizComponent
            task={currentDayTask}
            onComplete={(score) => {
              const updatedRoadmap = [...roadmap];
              const dayIndex = currentDayTask.day - 1;
              updatedRoadmap[dayIndex].completed = true;
              updatedRoadmap[dayIndex].score = score;
              updatedRoadmap[dayIndex].status = 'completed';
              if (dayIndex + 1 < updatedRoadmap.length) {
                updatedRoadmap[dayIndex + 1].status = 'unlocked';
              }
              setRoadmap(updatedRoadmap);
              setStep(3);
            }}
          />
        )}
      </main>
    </div>
  );
}

function QuizComponent({ task, onComplete }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = task.questions[currentQIndex];

  const handleSelect = (idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === question.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex + 1 < task.questions.length) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const accuracy = Math.round((score / task.questions.length) * 100);
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center pt-10">
        <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 w-full max-w-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Tổng kết Day {task.day}</h2>
          <div className="text-6xl font-black text-green-600 mb-4">{accuracy}%</div>
          <p className="text-lg text-slate-600 mb-8">
            Bạn đã trả lời đúng {score}/{task.questions.length} câu hỏi.
          </p>
          <button
            onClick={() => onComplete(score)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all"
          >
            Trở về Lộ trình
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <span className="font-bold text-slate-400">Day {task.day}</span>
        <span className="font-bold text-green-600">
          Câu {currentQIndex + 1}/{task.questions.length}
        </span>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <h3 className="text-xl font-semibold mb-6">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            let btnClass = 'border-slate-200 hover:border-green-400 hover:bg-green-50 text-slate-700';
            if (selectedAnswer !== null) {
              if (idx === question.correct) {
                btnClass = 'bg-green-500 border-green-500 text-white';
              } else if (idx === selectedAnswer) {
                btnClass = 'bg-red-500 border-red-500 text-white';
              } else {
                btnClass = 'border-slate-100 text-slate-400 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 font-medium ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {selectedAnswer !== null && (
        <button
          onClick={handleNext}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-md animate-fade-in"
        >
          {currentQIndex + 1 === task.questions.length ? 'Hoàn thành' : 'Câu tiếp theo'}
        </button>
      )}
    </div>
  );
}
