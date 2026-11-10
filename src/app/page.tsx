'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Trash2, 
  Plus, 
  Calendar, 
  Target, 
  ListTodo, 
  Award, 
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  CalendarDays,
  Download,
  Upload,
  Database,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Task, DailyQuestionsState, ExamMilestone, MockTest, AppDatabasePayload } from '../data/jeeData';
import { INITIAL_TASKS, INITIAL_DAILY_QS, INITIAL_EXAMS, INITIAL_MOCKS } from '../data/jeeData';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'tracker' | 'calendar' | 'dates' | 'mocks'>('tasks');
  const [isSynced, setIsSynced] = useState(true);

  // --- 1. TASKS STATE ---
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'General'>('Physics');
  const [newTaskQs, setNewTaskQs] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Physics' | 'Chemistry' | 'Mathematics' | 'General'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- 2. DAILY 100 QUESTIONS TRACKER STATE ---
  const [dailyQs, setDailyQs] = useState<DailyQuestionsState>(INITIAL_DAILY_QS);
  const [customAddSubject, setCustomAddSubject] = useState<'physics' | 'chemistry' | 'mathematics'>('physics');
  const [customAddAmount, setCustomAddAmount] = useState('15');

  // --- 3. EXAM DATES STATE ---
  const [exams, setExams] = useState<ExamMilestone[]>(INITIAL_EXAMS);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  // --- 4. MOCK TEST HOLDER STATE ---
  const [mocks, setMocks] = useState<MockTest[]>(INITIAL_MOCKS);
  const [mockName, setMockName] = useState('');
  const [mockDate, setMockDate] = useState('');
  const [mockP, setMockP] = useState('');
  const [mockC, setMockC] = useState('');
  const [mockM, setMockM] = useState('');
  const [mockSilly, setMockSilly] = useState('2');
  const [mockNotes, setMockNotes] = useState('');

  // --- 5. STUDY LOG & JOURNAL STATE ---
  const [journal, setJournal] = useState<Record<string, string>>({});
  const [todayStr, setTodayStr] = useState('2026-11-10');
  const [selectedLogDate, setSelectedLogDate] = useState('2026-11-10');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState({ year: 2026, month: 10 }); // 0-indexed: 10 is Nov
  const [dayNoteInput, setDayNoteInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Data Hydration: Disk Database (/api/data) + LocalStorage Fallback
  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const nowStr = now.toISOString().split('T')[0];
    setTodayStr(nowStr);
    setSelectedLogDate(nowStr);
    setCurrentCalendarMonth({ year: now.getFullYear(), month: now.getMonth() });

    const loadData = async () => {
      let loadedFromDisk = false;

      // 1. Try loading from Server Disk Database
      try {
        const res = await fetch('/api/data');
        const json = await res.json();
        if (json.success && json.exists && json.data) {
          const d: AppDatabasePayload = json.data;
          if (Array.isArray(d.tasks)) setTasks(d.tasks);
          if (d.dailyQs) {
            if (d.dailyQs.date !== nowStr) {
              const prevTotal = (d.dailyQs.physics || 0) + (d.dailyQs.chemistry || 0) + (d.dailyQs.mathematics || 0);
              setDailyQs({
                date: nowStr,
                goal: 100,
                physics: 0,
                chemistry: 0,
                mathematics: 0,
                history: {
                  ...(d.dailyQs.history || {}),
                  [d.dailyQs.date]: {
                    physics: d.dailyQs.physics || 0,
                    chemistry: d.dailyQs.chemistry || 0,
                    mathematics: d.dailyQs.mathematics || 0,
                    total: prevTotal
                  }
                }
              });
            } else {
              setDailyQs(d.dailyQs);
            }
          }
          if (Array.isArray(d.exams)) {
            const cleanExams = d.exams
              .filter(e => !e.title.toLowerCase().includes('advanced'))
              .map(e => {
                const tl = e.title.toLowerCase();
                if (tl.includes('jan') || tl.includes('session 1')) return { ...e, title: 'JEE Main (January Session)', dateStr: '2027-01-20', isOfficial: true };
                if (tl.includes('apr') || tl.includes('session 2')) return { ...e, title: 'JEE Main (April Session)', dateStr: '2027-04-01', isOfficial: true };
                return e;
              });
            setExams(cleanExams.length ? cleanExams : INITIAL_EXAMS);
          }
          if (Array.isArray(d.mocks)) setMocks(d.mocks);
          if (d.journal) {
            setJournal(d.journal);
            setDayNoteInput(d.journal[nowStr] || '');
          }
          loadedFromDisk = true;
        }
      } catch {
        // Fallback to localStorage
      }

      // 2. If not loaded from disk, check localStorage
      if (!loadedFromDisk) {
        try {
          const savedTasks = localStorage.getItem('jee_todo_tasks');
          if (savedTasks) setTasks(JSON.parse(savedTasks));

          const savedQs = localStorage.getItem('jee_daily_questions');
          const isZeroInit = localStorage.getItem('jee_questions_zero_initialized_v2');
          if (savedQs && isZeroInit) {
            const parsed: DailyQuestionsState = JSON.parse(savedQs);
            if (parsed.date !== nowStr) {
              const prevTotal = (parsed.physics || 0) + (parsed.chemistry || 0) + (parsed.mathematics || 0);
              setDailyQs({
                date: nowStr,
                goal: 100,
                physics: 0,
                chemistry: 0,
                mathematics: 0,
                history: {
                  ...(parsed.history || {}),
                  [parsed.date]: {
                    physics: parsed.physics || 0,
                    chemistry: parsed.chemistry || 0,
                    mathematics: parsed.mathematics || 0,
                    total: prevTotal
                  }
                }
              });
            } else {
              setDailyQs(parsed);
            }
          } else {
            const freshZero: DailyQuestionsState = {
              date: nowStr,
              goal: 100,
              physics: 0,
              chemistry: 0,
              mathematics: 0,
              history: {}
            };
            setDailyQs(freshZero);
            localStorage.setItem('jee_daily_questions', JSON.stringify(freshZero));
            localStorage.setItem('jee_questions_zero_initialized_v2', 'true');
          }

          const savedExams = localStorage.getItem('jee_exam_milestones');
          if (savedExams) {
            const parsed = JSON.parse(savedExams);
            const clean = parsed.filter((e: ExamMilestone) => !e.title.toLowerCase().includes('advanced'));
            setExams(clean.length ? clean : INITIAL_EXAMS);
          }

          const savedMocks = localStorage.getItem('jee_mock_tests');
          if (savedMocks) setMocks(JSON.parse(savedMocks));

          const savedJournal = localStorage.getItem('jee_study_journal');
          if (savedJournal) {
            const parsedJ = JSON.parse(savedJournal);
            setJournal(parsedJ);
            setDayNoteInput(parsedJ[nowStr] || '');
          }
        } catch {}
      }
    };

    loadData();
  }, []);

  // Update note textarea when user selects a different date in the calendar
  useEffect(() => {
    setDayNoteInput(journal[selectedLogDate] || '');
  }, [selectedLogDate, journal]);

  // Unified Save: Disk Database (/api/data) + LocalStorage
  useEffect(() => {
    if (!mounted) return;

    setIsSynced(false);

    try {
      localStorage.setItem('jee_todo_tasks', JSON.stringify(tasks));
      localStorage.setItem('jee_daily_questions', JSON.stringify(dailyQs));
      localStorage.setItem('jee_exam_milestones', JSON.stringify(exams));
      localStorage.setItem('jee_mock_tests', JSON.stringify(mocks));
      localStorage.setItem('jee_study_journal', JSON.stringify(journal));
    } catch {}

    const timer = setTimeout(async () => {
      try {
        const payload: AppDatabasePayload = {
          tasks,
          dailyQs,
          exams,
          mocks,
          journal,
          updatedAt: new Date().toISOString()
        };
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setIsSynced(true);
      } catch {
        setIsSynced(true);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [tasks, dailyQs, exams, mocks, journal, mounted]);

  // Export Backup JSON
  const handleExportBackup = () => {
    const payload: AppDatabasePayload = {
      tasks,
      dailyQs,
      exams,
      mocks,
      journal,
      updatedAt: new Date().toISOString()
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jee_prep_backup_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && (imported.tasks || imported.dailyQs || imported.mocks)) {
          if (Array.isArray(imported.tasks)) setTasks(imported.tasks);
          if (imported.dailyQs) setDailyQs(imported.dailyQs);
          if (Array.isArray(imported.exams)) setExams(imported.exams);
          if (Array.isArray(imported.mocks)) setMocks(imported.mocks);
          if (imported.journal) setJournal(imported.journal);

          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file structure.');
        }
      } catch {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // --- TASK ACTIONS ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      targetQuestions: newTaskQs ? parseInt(newTaskQs, 10) : undefined,
      completed: false,
      createdAt: todayStr
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setNewTaskQs('');
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        if (nextCompleted && t.targetQuestions) {
          const subjKey = t.subject === 'Physics' ? 'physics' : t.subject === 'Chemistry' ? 'chemistry' : t.subject === 'Mathematics' ? 'mathematics' : null;
          if (subjKey) {
            handleIncrementQuestions(subjKey, t.targetQuestions);
          }
        }
        return { 
          ...t, 
          completed: nextCompleted,
          completedAt: nextCompleted ? todayStr : undefined 
        };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  };

  // --- DAILY QUESTIONS ACTIONS ---
  const totalQuestionsSolved = dailyQs.physics + dailyQs.chemistry + dailyQs.mathematics;
  const progressPercent = Math.min(100, Math.round((totalQuestionsSolved / (dailyQs.goal || 100)) * 100));
  const isGoalAchieved = totalQuestionsSolved >= (dailyQs.goal || 100);

  const handleIncrementQuestions = (subject: 'physics' | 'chemistry' | 'mathematics', delta: number) => {
    setDailyQs(prev => {
      const nextCount = Math.max(0, prev[subject] + delta);
      const nextTotal = (subject === 'physics' ? nextCount : prev.physics) +
                        (subject === 'chemistry' ? nextCount : prev.chemistry) +
                        (subject === 'mathematics' ? nextCount : prev.mathematics);

      if (nextTotal >= (prev.goal || 100) && (prev.physics + prev.chemistry + prev.mathematics) < (prev.goal || 100)) {
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.65 } });
        } catch {}
      }

      return {
        ...prev,
        [subject]: nextCount
      };
    });
  };

  const handleCustomAddQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(customAddAmount, 10);
    if (!isNaN(amt) && amt > 0) {
      handleIncrementQuestions(customAddSubject, amt);
      setCustomAddAmount('');
    }
  };

  const handleResetTodayQuestions = () => {
    if (confirm("Reset today's question counts to 0?")) {
      setDailyQs(prev => ({
        ...prev,
        physics: 0,
        chemistry: 0,
        mathematics: 0
      }));
    }
  };

  // --- EXAM MILESTONE ACTIONS ---
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || !newExamDate) return;

    const newEx: ExamMilestone = {
      id: `ex-${Date.now()}`,
      title: newExamTitle.trim(),
      dateStr: newExamDate,
      isOfficial: false
    };

    setExams(prev => [...prev, newEx]);
    setNewExamTitle('');
    setNewExamDate('');
  };

  const handleDeleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const formatExamDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  };

  const formatMockDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  };

  const calculateDaysLeft = (dateStr: string) => {
    if (!mounted) return 0;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
      const todayParts = todayStr.split('-');
      const today = new Date(parseInt(todayParts[0], 10), parseInt(todayParts[1], 10) - 1, parseInt(todayParts[2], 10)).getTime();
      return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // --- MOCK TEST ACTIONS ---
  const handleAddMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName.trim()) return;

    const p = Math.min(100, Math.max(0, parseInt(mockP, 10) || 0));
    const c = Math.min(100, Math.max(0, parseInt(mockC, 10) || 0));
    const m = Math.min(100, Math.max(0, parseInt(mockM, 10) || 0));
    const s = Math.max(0, parseInt(mockSilly, 10) || 0);

    const newMock: MockTest = {
      id: `mock-${Date.now()}`,
      name: mockName.trim(),
      date: mockDate || todayStr,
      physicsMarks: p,
      chemistryMarks: c,
      mathsMarks: m,
      sillyMistakes: s,
      notes: mockNotes.trim()
    };

    setMocks(prev => [newMock, ...prev]);
    setMockName('');
    setMockP('');
    setMockC('');
    setMockM('');
    setMockNotes('');
  };

  const handleDeleteMock = (id: string) => {
    setMocks(prev => prev.filter(m => m.id !== id));
  };

  const mockCount = mocks.length;
  const mockAvgScore = mockCount > 0 
    ? Math.round(mocks.reduce((acc, m) => acc + (m.physicsMarks + m.chemistryMarks + m.mathsMarks), 0) / mockCount)
    : 0;
  const mockBestScore = mockCount > 0
    ? Math.max(...mocks.map(m => m.physicsMarks + m.chemistryMarks + m.mathsMarks))
    : 0;

  // --- JOURNAL / LOG ACTIONS ---
  const handleSaveDayNote = (e: React.FormEvent) => {
    e.preventDefault();
    setJournal(prev => ({
      ...prev,
      [selectedLogDate]: dayNoteInput.trim()
    }));
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'active' && task.completed) return false;
    if (taskFilter === 'completed' && !task.completed) return false;
    if (subjectFilter !== 'all' && task.subject !== subjectFilter) return false;
    if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  // Calendar calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Calendar Day Activity Query helper
  const getDayActivity = (dateStr: string) => {
    const isToday = dateStr === todayStr;
    const dayQuestions = isToday 
      ? totalQuestionsSolved 
      : (dailyQs.history?.[dateStr]?.total || 0);

    const dayTasks = tasks.filter(t => t.completed && (t.completedAt === dateStr || (!t.completedAt && isToday)));
    const dayMocks = mocks.filter(m => m.date === dateStr);
    const hasNote = Boolean(journal[dateStr]);

    return {
      questions: dayQuestions,
      hitGoal: dayQuestions >= 100,
      tasksCount: dayTasks.length,
      mocksCount: dayMocks.length,
      hasNote
    };
  };

  // Selected date log info
  const selectedDateActivity = (() => {
    const isToday = selectedLogDate === todayStr;
    const questionsBreakdown = isToday
      ? { physics: dailyQs.physics, chemistry: dailyQs.chemistry, mathematics: dailyQs.mathematics, total: totalQuestionsSolved }
      : (dailyQs.history?.[selectedLogDate] || { physics: 0, chemistry: 0, mathematics: 0, total: 0 });

    const completedTasksOnDate = tasks.filter(t => t.completed && (t.completedAt === selectedLogDate || (!t.completedAt && isToday)));
    const mocksOnDate = mocks.filter(m => m.date === selectedLogDate);
    const noteOnDate = journal[selectedLogDate] || '';

    return {
      isToday,
      questions: questionsBreakdown,
      tasks: completedTasksOnDate,
      mocks: mocksOnDate,
      note: noteOnDate
    };
  })();

  const calendarMonthLabel = new Date(currentCalendarMonth.year, currentCalendarMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <main className="app-container">
      {/* 1. CLEAN APP HEADER WITH DATABASE SYNC & BACKUP */}
      <header className="app-header">
        <div>
          <div className="brand-title">
            <span>JEE Prep</span>
            <span className="brand-badge">Daily Focus</span>
          </div>
          <p className="brand-subtitle">
            {mounted ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : 'JEE Aspirant To-Do'}
          </p>
        </div>

        <div className="header-actions">
          <div className="sync-pill" title="Stored in local disk database database/jee_database.json">
            <Database size={13} />
            <span>{isSynced ? 'Saved to Disk' : 'Saving...'}</span>
          </div>

          <button className="btn-backup" onClick={handleExportBackup} title="Export a full JSON backup of all your data">
            <Download size={13} />
            <span>Export Backup</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json"
            onChange={handleImportBackup} 
          />
          <button className="btn-backup" onClick={() => fileInputRef.current?.click()} title="Restore from a saved JSON backup file">
            <Upload size={13} />
            <span>Restore</span>
          </button>

          <div className="header-status-badge">
            <span className="status-dot"></span>
            <span>100 Qs Goal: <strong>{totalQuestionsSolved} / 100</strong> ({progressPercent}%)</span>
          </div>
        </div>
      </header>

      {/* 2. TAB NAVIGATION */}
      <nav className="tab-bar">
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <ListTodo size={17} />
          <span>Goals & Tasks</span>
          <span className="tab-pill">{pendingTasksCount}</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          <Target size={17} />
          <span>100 Qs Tracker</span>
          <span className="tab-pill">{totalQuestionsSolved}/100</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarDays size={17} />
          <span>Study Log & Calendar</span>
          <span className="tab-pill">History</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'dates' ? 'active' : ''}`}
          onClick={() => setActiveTab('dates')}
        >
          <Calendar size={17} />
          <span>Exam Dates</span>
          <span className="tab-pill">{exams.length}</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'mocks' ? 'active' : ''}`}
          onClick={() => setActiveTab('mocks')}
        >
          <Award size={17} />
          <span>Mock Tests</span>
          <span className="tab-pill">{mockCount}</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* TAB 1: GOALS & TO-DO LIST                                      */}
      {/* ============================================================== */}
      {activeTab === 'tasks' && (
        <section>
          {/* Quick Add Bar */}
          <div className="card">
            <h2 className="card-title">Add Goal / Task</h2>
            <p className="card-desc">Keep your daily study plan concrete, actionable, and focused on problem solving.</p>
            
            <form onSubmit={handleAddTask} className="input-row">
              <input 
                type="text" 
                className="input-text"
                placeholder="What needs to be done? (e.g. HC Verma Laws of Motion Q1-25)"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
              />

              <select 
                className="input-select"
                value={newTaskSubject}
                onChange={e => setNewTaskSubject(e.target.value as any)}
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="General">General / Mock</option>
              </select>

              <input 
                type="number"
                className="input-number"
                placeholder="Qs (opt)"
                min="1"
                value={newTaskQs}
                onChange={e => setNewTaskQs(e.target.value)}
              />

              <button type="submit" className="btn-primary">
                <Plus size={16} />
                <span>Add Task</span>
              </button>
            </form>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="chips-group">
              <button 
                className={`filter-chip ${taskFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTaskFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-chip ${taskFilter === 'active' ? 'active' : ''}`}
                onClick={() => setTaskFilter('active')}
              >
                Active ({tasks.filter(t => !t.completed).length})
              </button>
              <button 
                className={`filter-chip ${taskFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setTaskFilter('completed')}
              >
                Completed ({tasks.filter(t => t.completed).length})
              </button>
            </div>

            <div className="chips-group">
              {(['all', 'Physics', 'Chemistry', 'Mathematics', 'General'] as const).map(subj => (
                <button
                  key={subj}
                  className={`filter-chip ${subjectFilter === subj ? 'active' : ''}`}
                  onClick={() => setSubjectFilter(subj)}
                >
                  {subj === 'all' ? 'All Subjects' : subj}
                </button>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="card" style={{ padding: '0.5rem 1.25rem' }}>
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={36} className="empty-state-icon" />
                <p>No tasks found. Everything is clear or all items completed!</p>
              </div>
            ) : (
              <div className="todo-list">
                {filteredTasks.map(task => (
                  <div key={task.id} className="todo-row">
                    <button 
                      className={`todo-check ${task.completed ? 'completed' : ''}`}
                      onClick={() => handleToggleTask(task.id)}
                      aria-label="Toggle task status"
                    >
                      {task.completed && <Check size={14} strokeWidth={3} />}
                    </button>

                    <div className="todo-content">
                      <div className={`todo-text ${task.completed ? 'completed' : ''}`}>
                        {task.title}
                      </div>
                      <div className="todo-meta">
                        <span className={`badge badge-${task.subject === 'Physics' ? 'physics' : task.subject === 'Chemistry' ? 'chem' : task.subject === 'Mathematics' ? 'math' : 'general'}`}>
                          {task.subject}
                        </span>
                        {task.targetQuestions && (
                          <span className="badge badge-qs">
                            {task.targetQuestions} Questions
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      className="btn-danger-ghost"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="todo-footer">
              <span>{pendingTasksCount} tasks remaining</span>
              {tasks.some(t => t.completed) && (
                <button className="btn-text-clear" onClick={handleClearCompleted}>
                  Clear completed tasks
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DAILY QUESTIONS SOLVED (100 QS GOAL)                    */}
      {/* ============================================================== */}
      {activeTab === 'tracker' && (
        <section>
          {/* Main 100 Qs Target Progress Card */}
          <div className="hero-progress-box">
            <div className="progress-header">
              <span className="progress-title">Daily Questions Target</span>
              <span className="progress-count-display">
                {totalQuestionsSolved} <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 'normal' }}>/ 100 Qs</span>
              </span>
            </div>

            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className={`progress-hint ${isGoalAchieved ? 'reached' : ''}`}>
              {isGoalAchieved ? (
                <>
                  <Sparkles size={16} />
                  <span>🎉 100 Questions Goal Reached! Outstanding dedication today!</span>
                </>
              ) : (
                <>
                  <Target size={16} />
                  <span>{100 - totalQuestionsSolved} more questions to hit your daily 100 benchmark. Keep grinding!</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Stepper Cards by Subject */}
          <div className="subjects-grid">
            {/* Physics */}
            <div className="subject-card">
              <div className="subject-card-head">
                <span className="subject-name" style={{ color: '#0284c7' }}>Physics</span>
                <span className="subject-count">{dailyQs.physics}</span>
              </div>
              <div className="stepper-actions">
                <button className="btn-step" onClick={() => handleIncrementQuestions('physics', 5)}>+5</button>
                <button className="btn-step" onClick={() => handleIncrementQuestions('physics', 10)}>+10</button>
                <button className="btn-step" onClick={() => handleIncrementQuestions('physics', 25)}>+25</button>
              </div>
            </div>

            {/* Chemistry */}
            <div className="subject-card">
              <div className="subject-card-head">
                <span className="subject-name" style={{ color: '#d97706' }}>Chemistry</span>
                <span className="subject-count">{dailyQs.chemistry}</span>
              </div>
              <div className="stepper-actions">
                <button className="btn-step" onClick={() => handleIncrementQuestions('chemistry', 5)}>+5</button>
                <button className="btn-step" onClick={() => handleIncrementQuestions('chemistry', 10)}>+10</button>
                <button className="btn-step" onClick={() => handleIncrementQuestions('chemistry', 25)}>+25</button>
              </div>
            </div>

            {/* Mathematics */}
            <div className="subject-card">
              <div className="subject-card-head">
                <span className="subject-name" style={{ color: '#059669' }}>Mathematics</span>
                <span className="subject-count">{dailyQs.mathematics}</span>
              </div>
              <div className="stepper-actions">
                <button className="btn-step" onClick={() => handleIncrementQuestions('mathematics', 5)}>+5</button>
                <button className="btn-step" onClick={() => handleIncrementQuestions('mathematics', 10)}>+10</button>
                <button className="btn-step" onClick={() => handleIncrementQuestions('mathematics', 25)}>+25</button>
              </div>
            </div>
          </div>

          {/* Custom Question Log & Daily Reset */}
          <div className="card">
            <h2 className="card-title">Quick Log Custom Questions</h2>
            <p className="card-desc">Did a numerical problem set or solved past year papers? Add the count below.</p>

            <form onSubmit={handleCustomAddQuestions} className="input-row" style={{ alignItems: 'center' }}>
              <select 
                className="input-select"
                value={customAddSubject}
                onChange={e => setCustomAddSubject(e.target.value as any)}
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Mathematics</option>
              </select>

              <input 
                type="number"
                className="input-number"
                min="1"
                placeholder="Count"
                value={customAddAmount}
                onChange={e => setCustomAddAmount(e.target.value)}
              />

              <button type="submit" className="btn-primary">
                <Plus size={16} />
                <span>Add Questions</span>
              </button>

              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleResetTodayQuestions}
                style={{ marginLeft: 'auto' }}
              >
                <RotateCcw size={15} />
                <span>Reset Today</span>
              </button>
            </form>
          </div>

          {/* 7-Day Consistency Snapshot */}
          <div className="card">
            <h2 className="card-title">Last 7 Days Consistency</h2>
            <p className="card-desc">Visual history of total problems solved per day.</p>

            <div className="history-row">
              {(() => {
                const days = [6, 5, 4, 3, 2, 1, 0].map(offset => {
                  const d = new Date();
                  d.setDate(d.getDate() - offset);
                  const dateKey = d.toISOString().split('T')[0];
                  const label = offset === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
                  const count = offset === 0 
                    ? totalQuestionsSolved 
                    : (dailyQs.history?.[dateKey]?.total || 0);
                  const heightPct = Math.min(100, Math.round((count / 100) * 100));
                  return { dateKey, label, count, heightPct };
                });

                return days.map(d => (
                  <div key={d.dateKey} className="history-col">
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: d.count >= 100 ? '#10b981' : '#94a3b8' }}>
                      {d.count}
                    </span>
                    <div className="history-bar-bg">
                      <div 
                        className="history-bar-val"
                        style={{ 
                          height: d.count === 0 ? '4px' : `${Math.max(8, d.heightPct)}%`,
                          background: d.count >= 100 ? '#10b981' : d.count > 0 ? '#2563eb' : '#cbd5e1' 
                        }}
                      ></div>
                    </div>
                    <span className="history-label">{d.label}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 3: STUDY LOG & CALENDAR (WHAT I DID BY DATE)               */}
      {/* ============================================================== */}
      {activeTab === 'calendar' && (
        <section>
          <div className="log-layout">
            {/* Left: Interactive Monthly Calendar */}
            <div className="calendar-card">
              <div className="calendar-nav">
                <button className="calendar-nav-btn" onClick={handlePrevMonth} title="Previous Month">
                  <ChevronLeft size={16} />
                </button>
                <div className="calendar-month-title">{calendarMonthLabel}</div>
                <button className="calendar-nav-btn" onClick={handleNextMonth} title="Next Month">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day Headers */}
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}

                {/* Day Cells */}
                {(() => {
                  const daysInMonth = getDaysInMonth(currentCalendarMonth.year, currentCalendarMonth.month);
                  const firstDay = getFirstDayOfWeek(currentCalendarMonth.year, currentCalendarMonth.month);
                  const cells = [];

                  // Blank padding for days from previous month
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(
                      <div key={`blank-${i}`} className="calendar-day-cell other-month" />
                    );
                  }

                  // Actual month days
                  for (let day = 1; day <= daysInMonth; day++) {
                    const monthStr = String(currentCalendarMonth.month + 1).padStart(2, '0');
                    const dayStr = String(day).padStart(2, '0');
                    const dateStr = `${currentCalendarMonth.year}-${monthStr}-${dayStr}`;

                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedLogDate;
                    const activity = getDayActivity(dateStr);

                    cells.push(
                      <button
                        key={dateStr}
                        className={`calendar-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedLogDate(dateStr)}
                      >
                        <span>{day}</span>
                        <div className="day-dots">
                          {activity.hitGoal && <span className="day-dot dot-goal" title="100 Qs Goal Achieved" />}
                          {!activity.hitGoal && activity.questions > 0 && <span className="day-dot dot-questions" title="Questions Solved" />}
                          {activity.tasksCount > 0 && <span className="day-dot dot-tasks" title="Tasks Completed" />}
                          {activity.mocksCount > 0 && <span className="day-dot dot-mock" title="Mock Test Taken" />}
                        </div>
                      </button>
                    );
                  }

                  return cells;
                })()}
              </div>

              {/* Calendar Legend */}
              <div className="legend-row">
                <div className="legend-item">
                  <span className="day-dot dot-goal" />
                  <span>100+ Qs Solved</span>
                </div>
                <div className="legend-item">
                  <span className="day-dot dot-questions" />
                  <span>Questions Solved</span>
                </div>
                <div className="legend-item">
                  <span className="day-dot dot-tasks" />
                  <span>Tasks Completed</span>
                </div>
                <div className="legend-item">
                  <span className="day-dot dot-mock" />
                  <span>Mock Test</span>
                </div>
              </div>
            </div>

            {/* Right: Selected Date Detail Activity Card */}
            <div className="activity-card">
              <div className="activity-date-heading">
                {(() => {
                  const parts = selectedLogDate.split('-');
                  if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
                  }
                  return selectedLogDate;
                })()}
                {selectedDateActivity.isToday && <span className="brand-badge" style={{ marginLeft: '0.5rem' }}>Today</span>}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Summary of study work, problem solving, and notes logged on this date.
              </p>

              {/* Questions Section */}
              <div className="activity-section">
                <div className="activity-section-title">
                  <span>Questions Solved</span>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>
                    {selectedDateActivity.questions.total} / 100 Qs
                  </span>
                </div>
                {selectedDateActivity.questions.total > 0 ? (
                  <div>
                    <div className="progress-bar-track" style={{ height: '8px', marginBottom: '0.5rem' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${Math.min(100, Math.round((selectedDateActivity.questions.total / 100) * 100))}%` }} 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <span style={{ color: '#0284c7' }}>P: <strong>{selectedDateActivity.questions.physics}</strong></span>
                      <span style={{ color: '#d97706' }}>C: <strong>{selectedDateActivity.questions.chemistry}</strong></span>
                      <span style={{ color: '#059669' }}>M: <strong>{selectedDateActivity.questions.mathematics}</strong></span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>0 questions logged on this day.</p>
                )}
              </div>

              {/* Completed Tasks Section */}
              <div className="activity-section">
                <div className="activity-section-title">
                  <span>Tasks Completed</span>
                  <span className="tab-pill">{selectedDateActivity.tasks.length}</span>
                </div>
                {selectedDateActivity.tasks.length > 0 ? (
                  <div>
                    {selectedDateActivity.tasks.map(t => (
                      <div key={t.id} className="activity-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Check size={14} style={{ color: '#10b981' }} />
                          <span style={{ fontSize: '0.88rem' }}>{t.title}</span>
                        </div>
                        <span className={`badge badge-${t.subject === 'Physics' ? 'physics' : t.subject === 'Chemistry' ? 'chem' : t.subject === 'Mathematics' ? 'math' : 'general'}`}>
                          {t.subject}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No tasks marked complete on this date.</p>
                )}
              </div>

              {/* Mock Tests Taken Section */}
              <div className="activity-section">
                <div className="activity-section-title">
                  <span>Mock Tests</span>
                  <span className="tab-pill">{selectedDateActivity.mocks.length}</span>
                </div>
                {selectedDateActivity.mocks.length > 0 ? (
                  <div>
                    {selectedDateActivity.mocks.map(m => (
                      <div key={m.id} className="activity-item">
                        <div>
                          <strong>{m.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            P: {m.physicsMarks} • C: {m.chemistryMarks} • M: {m.mathsMarks}
                          </div>
                        </div>
                        <span className="score-badge">
                          {m.physicsMarks + m.chemistryMarks + m.mathsMarks} <span className="score-total">/ 300</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No mock tests taken on this date.</p>
                )}
              </div>

              {/* Daily Study Reflection / Notes */}
              <div className="activity-section">
                <div className="activity-section-title">
                  <span>Daily Study Reflection</span>
                  <FileText size={14} style={{ color: '#64748b' }} />
                </div>
                <form onSubmit={handleSaveDayNote}>
                  <textarea 
                    className="journal-textarea"
                    placeholder="Write a quick reflection: what chapters did you revise, weak points, or what went well today?"
                    value={dayNoteInput}
                    onChange={e => setDayNoteInput(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                      Save Reflection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Quick 7-Day Timeline Glance */}
          <div className="card">
            <h2 className="card-title">Recent Days Timeline</h2>
            <p className="card-desc">Click any day below to inspect or add notes.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                const d = new Date();
                d.setDate(d.getDate() - offset);
                const dateKey = d.toISOString().split('T')[0];
                const label = offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const activity = getDayActivity(dateKey);
                const hasNote = Boolean(journal[dateKey]);

                return (
                  <div 
                    key={dateKey} 
                    className="todo-row"
                    style={{ cursor: 'pointer', padding: '0.75rem 0.5rem' }}
                    onClick={() => setSelectedLogDate(dateKey)}
                  >
                    <div style={{ width: '110px', fontWeight: 600, fontSize: '0.88rem' }}>
                      {label}
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: activity.questions >= 100 ? '#10b981' : activity.questions > 0 ? '#2563eb' : '#94a3b8', fontWeight: 600 }}>
                        {activity.questions} Qs Solved
                      </span>

                      {activity.tasksCount > 0 && (
                        <span className="badge badge-general">
                          {activity.tasksCount} Tasks Done
                        </span>
                      )}

                      {activity.mocksCount > 0 && (
                        <span className="badge badge-qs">
                          Mock Taken
                        </span>
                      )}

                      {hasNote && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{journal[dateKey]}"
                        </span>
                      )}
                    </div>

                    <button 
                      className="btn-subtle" 
                      onClick={(e) => { e.stopPropagation(); setSelectedLogDate(dateKey); }}
                    >
                      View Log
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 4: EXAM DATES & COUNTDOWNS                                 */}
      {/* ============================================================== */}
      {activeTab === 'dates' && (
        <section>
          {/* Exam Countdown Cards */}
          <div className="dates-grid">
            {exams.map(exam => {
              const daysLeft = calculateDaysLeft(exam.dateStr);
              const isUrgent = daysLeft >= 0 && daysLeft <= 90;

              return (
                <div key={exam.id} className={`date-card ${isUrgent ? 'highlight' : ''}`}>
                  <div className="date-header">
                    <div className="date-title">{exam.title}</div>
                    <div className="date-calendar">
                      {formatExamDate(exam.dateStr)}
                    </div>
                  </div>

                  <div className="days-counter">
                    <span className="days-number">{daysLeft >= 0 ? daysLeft : 0}</span>
                    <span className="days-text">{daysLeft === 1 ? 'day left' : 'days left'}</span>
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-danger-ghost"
                      onClick={() => handleDeleteExam(exam.id)}
                      title="Remove date"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Custom Milestone Form */}
          <div className="card">
            <h2 className="card-title">Add Custom Exam or Deadline</h2>
            <p className="card-desc">Track revision milestones, coaching tests, or school pre-boards.</p>

            <form onSubmit={handleAddExam} className="input-row">
              <input 
                type="text"
                className="input-text"
                placeholder="Milestone name (e.g. 11th Syllabus Completion, Allen Open Mock)"
                value={newExamTitle}
                onChange={e => setNewExamTitle(e.target.value)}
              />

              <input 
                type="date"
                className="input-select"
                value={newExamDate}
                onChange={e => setNewExamDate(e.target.value)}
              />

              <button type="submit" className="btn-primary">
                <Plus size={16} />
                <span>Add Deadline</span>
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 5: MOCK TEST HOLDER                                        */}
      {/* ============================================================== */}
      {activeTab === 'mocks' && (
        <section>
          {/* Summary Metrics */}
          <div className="mock-metrics">
            <div className="metric-card">
              <div className="metric-val">{mockCount}</div>
              <div className="metric-label">Mocks Logged</div>
            </div>
            <div className="metric-card">
              <div className="metric-val">{mockAvgScore} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 300</span></div>
              <div className="metric-label">Average Score</div>
            </div>
            <div className="metric-card">
              <div className="metric-val">{mockBestScore} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 300</span></div>
              <div className="metric-label">Highest Score</div>
            </div>
          </div>

          {/* Add New Mock Test Log */}
          <div className="card">
            <h2 className="card-title">Log New Mock Test</h2>
            <p className="card-desc">Record your 3-hour test marks, silly mistake counts, and reflections.</p>

            <form onSubmit={handleAddMock}>
              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <input 
                  type="text" 
                  className="input-text"
                  placeholder="Test Name (e.g. Allen CBT 05, MathonGo FT-03)"
                  value={mockName}
                  onChange={e => setMockName(e.target.value)}
                  required
                />

                <input 
                  type="date" 
                  className="input-select"
                  value={mockDate || todayStr}
                  onChange={e => setMockDate(e.target.value)}
                />
              </div>

              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <input 
                  type="number"
                  className="input-number"
                  style={{ flex: 1 }}
                  placeholder="Physics (/100)"
                  min="0"
                  max="100"
                  value={mockP}
                  onChange={e => setMockP(e.target.value)}
                  required
                />

                <input 
                  type="number"
                  className="input-number"
                  style={{ flex: 1 }}
                  placeholder="Chemistry (/100)"
                  min="0"
                  max="100"
                  value={mockC}
                  onChange={e => setMockC(e.target.value)}
                  required
                />

                <input 
                  type="number"
                  className="input-number"
                  style={{ flex: 1 }}
                  placeholder="Maths (/100)"
                  min="0"
                  max="100"
                  value={mockM}
                  onChange={e => setMockM(e.target.value)}
                  required
                />

                <input 
                  type="number"
                  className="input-number"
                  style={{ flex: 1 }}
                  placeholder="Silly Mistakes"
                  min="0"
                  value={mockSilly}
                  onChange={e => setMockSilly(e.target.value)}
                />
              </div>

              <div className="input-row" style={{ alignItems: 'center' }}>
                <input 
                  type="text"
                  className="input-text"
                  placeholder="Notes & Weak Areas (e.g. Lost 16 marks in organic chemistry; need better time split)"
                  value={mockNotes}
                  onChange={e => setMockNotes(e.target.value)}
                />

                <div style={{ fontWeight: 600, color: '#2563eb', whiteSpace: 'nowrap', padding: '0 0.5rem' }}>
                  Total: {((parseInt(mockP, 10) || 0) + (parseInt(mockC, 10) || 0) + (parseInt(mockM, 10) || 0))} / 300
                </div>

                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  <span>Save Test Log</span>
                </button>
              </div>
            </form>
          </div>

          {/* Mock Test Logs Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {mocks.length === 0 ? (
              <div className="empty-state">
                <Award size={36} className="empty-state-icon" />
                <p>No mock tests logged yet. Add your first test above!</p>
              </div>
            ) : (
              <div className="mock-table-wrap">
                <table className="mock-table">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Date</th>
                      <th>P / C / M</th>
                      <th>Total Score</th>
                      <th>Silly Mistakes</th>
                      <th>Notes</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mocks.map(mock => {
                      const total = mock.physicsMarks + mock.chemistryMarks + mock.mathsMarks;
                      return (
                        <tr key={mock.id}>
                          <td style={{ fontWeight: 600 }}>{mock.name}</td>
                          <td className="mock-cell-date">{formatMockDate(mock.date)}</td>
                          <td className="mock-cell-pcm">
                            <span className="pcm-tag-p">P: {mock.physicsMarks}</span>
                            <span className="pcm-dot">•</span>
                            <span className="pcm-tag-c">C: {mock.chemistryMarks}</span>
                            <span className="pcm-dot">•</span>
                            <span className="pcm-tag-m">M: {mock.mathsMarks}</span>
                          </td>
                          <td className="mock-cell-score">
                            <span className="score-badge">
                              {total} <span className="score-total">/ 300</span>
                            </span>
                          </td>
                          <td className="mock-cell-mistakes">
                            {mock.sillyMistakes > 0 ? (
                              <span className="silly-mistake-pill">
                                {mock.sillyMistakes} mistakes
                              </span>
                            ) : (
                              <span style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>0 errors</span>
                            )}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.82rem', maxWidth: '240px' }}>
                            {mock.notes || '—'}
                          </td>
                          <td>
                            <button 
                              className="btn-danger-ghost"
                              onClick={() => handleDeleteMock(mock.id)}
                              title="Delete test log"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
