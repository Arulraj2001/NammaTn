'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles, 
  Upload, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Search, 
  RefreshCw,
  ExternalLink,
  Power,
  Zap,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  TNPSC_EXAMS,
  TNPSC_SUBJECTS, 
  TNPSC_TOPICS,
  TNPSC_PYQ_PAPERS,
  fetchTnpscQuestions, 
  saveTnpscQuestionsCatalog,
  fetchAutoFeederConfig,
  saveAutoFeederConfig,
  fetchTnpscTopics,
  fetchTnpscPyqPapers,
  saveTnpscTopic,
  saveTnpscPyqPaper
} from '@/services/tnpscService';

// High-contrast input styling constant guaranteed visible in any browser/theme mode
const INPUT_STYLE = {
  backgroundColor: '#ffffff',
  color: '#0f172a',
  borderColor: '#cbd5e1',
};

const INPUT_CLASSES = "w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium text-xs sm:text-sm focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-xs transition-colors";
const SELECT_CLASSES = "w-full p-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-xs transition-colors";

export default function AdminTnpsc() {
  const { toast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // default to 'single' as user was working there

  // Search & filter
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Generator state
  const [aiSubject, setAiSubject] = useState('general-tamil');
  const [aiCount, setAiCount] = useState(10);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Markdown / JSON Paste state
  const [pasteContent, setPasteContent] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);

  // Autonomous Daily Feeder State
  const [autoFeederConfig, setAutoFeederConfig] = useState({
    enabled: true,
    questions_per_subject: 10,
    last_run: null,
    total_generated: 0,
  });
  const [updatingToggle, setUpdatingToggle] = useState(false);

  // Single Question Form state
  const [singleForm, setSingleForm] = useState({
    subject_slug: 'general-tamil',
    question_ta: '',
    question_en: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_key: 'A',
    book_citation: '',
    pyq_reference: '',
    explanation_ta: '',
    is_daily_challenge: true,
  });

  // Topics Editor State
  const [topics, setTopics] = useState([]);
  const [selectedTopicSlug, setSelectedTopicSlug] = useState('new');
  const [savingTopic, setSavingTopic] = useState(false);
  const [topicForm, setTopicForm] = useState({
    slug: '',
    subject_slug: 'general-tamil',
    title_ta: '',
    title_en: '',
    samacheer_book_ref: '',
    pyq_frequency_count: 5,
    summary_overview_ta: '',
    key_facts_text: '',
    exam_slugs: ['group-4'],
    is_featured: true,
  });

  // PYQ Papers State
  const [pyqPapers, setPyqPapers] = useState([]);
  const [selectedPaperSlug, setSelectedPaperSlug] = useState('new');
  const [savingPaper, setSavingPaper] = useState(false);
  const [pyqPasteQuestions, setPyqPasteQuestions] = useState('');
  const [paperForm, setPaperForm] = useState({
    slug: '',
    exam_slug: 'group-4',
    year: 2024,
    title_ta: '',
    title_en: '',
    official_pdf_url: '',
    total_questions: 200,
    is_hot: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, feederCfg, topicsList, pyqList] = await Promise.all([
        fetchTnpscQuestions('all'),
        fetchAutoFeederConfig(),
        fetchTnpscTopics(),
        fetchTnpscPyqPapers(),
      ]);
      setQuestions(data);
      if (feederCfg) setAutoFeederConfig(feederCfg);
      if (topicsList) setTopics(topicsList);
      if (pyqList) setPyqPapers(pyqList);
    } catch (err) {
      toast({ description: 'Failed to load TNPSC questions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoFeeder = async () => {
    setUpdatingToggle(true);
    try {
      const nextState = !autoFeederConfig.enabled;
      const updated = {
        ...autoFeederConfig,
        enabled: nextState,
        updated_at: new Date().toISOString(),
      };
      await saveAutoFeederConfig(updated);
      setAutoFeederConfig(updated);
      toast({
        description: nextState
          ? '✓ Autonomous Daily Feeder ENABLED (70 Qs/day at 6:00 AM IST)'
          : '⏸ Autonomous Daily Feeder PAUSED (Manual upload mode)',
      });
    } catch (err) {
      toast({ description: `Failed to update toggle: ${err.message}`, variant: 'destructive' });
    } finally {
      setUpdatingToggle(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save full catalog
  const handleSaveCatalog = async (updatedList) => {
    setSaving(true);
    try {
      await saveTnpscQuestionsCatalog(updatedList);
      setQuestions(updatedList);
      toast({ description: '✓ TNPSC Questions saved successfully!' });
    } catch (err) {
      toast({ description: `Failed to save: ${err.message}`, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Delete question
  const handleDelete = (id) => {
    if (!window.confirm('Delete this question from catalog?')) return;
    const updated = questions.filter((q) => q.id !== id);
    handleSaveCatalog(updated);
  };

  // Toggle daily challenge
  const handleToggleDaily = (id) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, is_daily_challenge: !q.is_daily_challenge } : q
    );
    handleSaveCatalog(updated);
  };

  // AI Generator Action
  const handleGenerateAi = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/admin/tnpsc/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: aiSubject, count: Number(aiCount) }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        const combined = [...data.questions, ...questions];
        await handleSaveCatalog(combined);
        setActiveTab('list');
        toast({ description: `✓ Generated and added ${data.questions.length} questions!` });
      } else {
        throw new Error(data.error || 'No questions returned');
      }
    } catch (err) {
      toast({ description: `AI generation error: ${err.message}`, variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  // Parse Markdown or JSON paste
  const handleParsePaste = () => {
    const raw = pasteContent.trim();
    if (!raw) return;

    try {
      // 1. Try JSON Array first
      if (raw.startsWith('[') && raw.endsWith(']')) {
        const parsed = JSON.parse(raw);
        setParsedPreview(parsed);
        toast({ description: `Parsed ${parsed.length} JSON questions.` });
        return;
      }

      // 2. Try Markdown / Plain text parsing
      const chunks = raw.split(/(?:^|\n)(?=Q:|\d+\.|\#\#\#)/i).filter(Boolean);
      const parsedList = [];

      for (let chunk of chunks) {
        const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
        const qLine = lines.find((l) => /^(?:Q:|\d+\.|\#\#\#)\s*/i.test(l)) || lines[0];
        const question_ta = qLine ? qLine.replace(/^(?:Q:|\d+\.|\#\#\#)\s*/i, '').trim() : '';

        const optA = lines.find((l) => /^[-*]?\s*A\)/i.test(l))?.replace(/^[-*]?\s*A\)\s*/i, '') || '';
        const optB = lines.find((l) => /^[-*]?\s*B\)/i.test(l))?.replace(/^[-*]?\s*B\)\s*/i, '') || '';
        const optC = lines.find((l) => /^[-*]?\s*C\)/i.test(l))?.replace(/^[-*]?\s*C\)\s*/i, '') || '';
        const optD = lines.find((l) => /^[-*]?\s*D\)/i.test(l))?.replace(/^[-*]?\s*D\)\s*/i, '') || '';

        const ansLine = lines.find((l) => /^(?:Ans|Correct|Answer):/i.test(l));
        const correct_key = ansLine?.match(/[ABCD]/i)?.[0]?.toUpperCase() || 'A';

        const citLine = lines.find((l) => /^(?:Citation|Book):/i.test(l));
        const book_citation = citLine ? citLine.replace(/^(?:Citation|Book):\s*/i, '').trim() : 'சமச்சீர் பாடப்புத்தகம்';

        const pyqLine = lines.find((l) => /^(?:PYQ|Exam):/i.test(l));
        const pyq_reference = pyqLine ? pyqLine.replace(/^(?:PYQ|Exam):\s*/i, '').trim() : 'TNPSC Group 4';

        if (question_ta && optA && optB) {
          parsedList.push({
            id: `tnpsc-import-${Date.now()}-${parsedList.length + 1}`,
            subject_slug: 'general-tamil',
            question_ta,
            options: [
              { key: 'A', text: optA },
              { key: 'B', text: optB },
              { key: 'C', text: optC || 'இவற்றில் எதுவுமில்லை' },
              { key: 'D', text: optD || 'மேற்கண்ட அனைத்தும்' },
            ],
            correct_key,
            explanation_ta: 'சமச்சீர் புத்தகக் குறிப்புப்படி சரியான விடை.',
            book_citation,
            pyq_reference,
            difficulty: 'medium',
            is_daily_challenge: true,
          });
        }
      }

      setParsedPreview(parsedList);
      toast({ description: `Successfully parsed ${parsedList.length} questions from text!` });
    } catch (err) {
      toast({ description: `Parsing error: ${err.message}`, variant: 'destructive' });
    }
  };

  const handleSaveParsedPreview = async () => {
    if (parsedPreview.length === 0) return;
    const combined = [...parsedPreview, ...questions];
    await handleSaveCatalog(combined);
    setParsedPreview([]);
    setPasteContent('');
    setActiveTab('list');
  };

  // Add Single Question Form Submit
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!singleForm.question_ta || !singleForm.optionA || !singleForm.optionB) {
      toast({ description: 'Question and at least Options A & B are required', variant: 'destructive' });
      return;
    }

    const newQ = {
      id: `tnpsc-manual-${Date.now()}`,
      subject_slug: singleForm.subject_slug,
      question_ta: singleForm.question_ta.trim(),
      question_en: singleForm.question_en.trim(),
      options: [
        { key: 'A', text: singleForm.optionA.trim() },
        { key: 'B', text: singleForm.optionB.trim() },
        { key: 'C', text: singleForm.optionC.trim() || 'இவற்றில் எதுவுமில்லை' },
        { key: 'D', text: singleForm.optionD.trim() || 'மேற்கண்ட அனைத்தும்' },
      ],
      correct_key: singleForm.correct_key,
      book_citation: singleForm.book_citation.trim() || 'சமச்சீர் பாடப்புத்தகம்',
      pyq_reference: singleForm.pyq_reference.trim() || 'TNPSC மாதிரி வினா',
      explanation_ta: singleForm.explanation_ta.trim() || 'சமச்சீர் புத்தகக் குறிப்புப்படி சரியான விடை.',
      difficulty: 'medium',
      is_daily_challenge: singleForm.is_daily_challenge,
    };

    const combined = [newQ, ...questions];
    await handleSaveCatalog(combined);
    setActiveTab('list');
    setSingleForm({
      subject_slug: 'general-tamil',
      question_ta: '',
      question_en: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correct_key: 'A',
      book_citation: '',
      pyq_reference: '',
      explanation_ta: '',
      is_daily_challenge: true,
    });
  };

  // Filtered view
  const handleSelectTopic = (slug) => {
    setSelectedTopicSlug(slug);
    if (slug === 'new') {
      setTopicForm({
        slug: '',
        subject_slug: 'general-tamil',
        title_ta: '',
        title_en: '',
        samacheer_book_ref: '',
        pyq_frequency_count: 5,
        summary_overview_ta: '',
        key_facts_text: '',
        exam_slugs: ['group-4'],
        is_featured: true,
      });
      return;
    }
    const found = topics.find((t) => t.slug === slug);
    if (found) {
      setTopicForm({
        slug: found.slug,
        subject_slug: found.subject_slug || 'general-tamil',
        title_ta: found.title_ta || '',
        title_en: found.title_en || '',
        samacheer_book_ref: found.samacheer_book_ref || '',
        pyq_frequency_count: found.pyq_frequency_count || 5,
        summary_overview_ta: found.summary_overview_ta || '',
        key_facts_text: Array.isArray(found.key_facts_bullet_points)
          ? found.key_facts_bullet_points.join('\n')
          : '',
        exam_slugs: found.exam_slugs || ['group-4'],
        is_featured: Boolean(found.is_featured),
      });
    }
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.slug || !topicForm.title_ta) {
      toast({ description: 'Please provide Topic Slug and Tamil Title', variant: 'destructive' });
      return;
    }
    setSavingTopic(true);
    try {
      const payload = {
        ...topicForm,
        key_facts_bullet_points: topicForm.key_facts_text
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await saveTnpscTopic(payload);
      const updatedTopics = await fetchTnpscTopics();
      setTopics(updatedTopics);
      toast({ description: `✓ Topic "${topicForm.title_ta}" saved successfully!` });
    } catch (err) {
      toast({ description: `Failed to save topic: ${err.message}`, variant: 'destructive' });
    } finally {
      setSavingTopic(false);
    }
  };

  const handleSelectPaper = (slug) => {
    setSelectedPaperSlug(slug);
    if (slug === 'new') {
      setPaperForm({
        slug: '',
        exam_slug: 'group-4',
        year: 2024,
        title_ta: '',
        title_en: '',
        official_pdf_url: '',
        total_questions: 200,
        is_hot: true,
      });
      return;
    }
    const found = pyqPapers.find((p) => p.slug === slug);
    if (found) {
      setPaperForm({
        slug: found.slug,
        exam_slug: found.exam_slug || 'group-4',
        year: found.year || 2024,
        title_ta: found.title_ta || '',
        title_en: found.title_en || '',
        official_pdf_url: found.official_pdf_url || '',
        total_questions: found.total_questions || 200,
        is_hot: Boolean(found.is_hot),
      });
    }
  };

  const handleSavePaper = async (e) => {
    e.preventDefault();
    if (!paperForm.slug || !paperForm.title_ta) {
      toast({ description: 'Please provide Paper Slug and Tamil Title', variant: 'destructive' });
      return;
    }
    setSavingPaper(true);
    try {
      await saveTnpscPyqPaper(paperForm);
      const updatedPapers = await fetchTnpscPyqPapers();
      setPyqPapers(updatedPapers);
      toast({ description: `✓ PYQ Paper "${paperForm.title_ta}" saved successfully!` });
    } catch (err) {
      toast({ description: `Failed to save paper: ${err.message}`, variant: 'destructive' });
    } finally {
      setSavingPaper(false);
    }
  };

  // Filtered view
  const filtered = questions.filter((q) => {
    const matchSubject = filterSubject === 'all' || q.subject_slug === filterSubject;
    const matchSearch =
      !searchQuery ||
      q.question_ta?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.book_citation?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                TNPSC Exam & One-Mark Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Manage daily interactive questions, import question papers, and auto-feed Samacheer Kalvi test series.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/tnpsc"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
          >
            <span>View Public /tnpsc</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Autonomous AI Daily Feeder Control Banner */}
      <div className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        autoFeederConfig.enabled 
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-300' 
          : 'bg-gradient-to-r from-slate-100 via-slate-50 to-white border-slate-300'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            autoFeederConfig.enabled 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-400 text-white'
          }`}>
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Daily Autonomous AI Feeder (70 Questions/Day)
              </h2>
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                autoFeederConfig.enabled
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-300 text-slate-700'
              }`}>
                {autoFeederConfig.enabled ? '● Active (6:00 AM IST)' : '⏸ Paused (Manual Mode)'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium max-w-2xl">
              When <strong>ENABLED</strong>, the background bot automatically generates 10 Samacheer Kalvi verified MCQs for all 7 subjects every morning at 6:00 AM IST, verifies book citations, and notifies search engines via IndexNow.
              Turn <strong>OFF</strong> whenever you wish to upload manually.
            </p>
            {autoFeederConfig.last_run && (
              <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 pt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last auto-generation completed: {new Date(autoFeederConfig.last_run).toLocaleString('en-IN')}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={handleToggleAutoFeeder}
            disabled={updatingToggle}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 ${
              autoFeederConfig.enabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{autoFeederConfig.enabled ? 'Pause Auto-Feeder' : 'Enable Auto-Feeder'}</span>
          </button>
        </div>
      </div>

      {/* High-Contrast Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border-2 border-slate-300 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow-md border-2 border-blue-700'
              : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catalog ({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'ai'
              ? 'bg-purple-600 text-white shadow-md border-2 border-purple-700'
              : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Gemini AI Auto-Feeder (10 Qs)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'paste'
              ? 'bg-emerald-600 text-white shadow-md border-2 border-emerald-700'
              : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs'
          }`}
        >
          <Upload className="w-4 h-4 text-emerald-600" />
          <span>Import PDF / Markdown / JSON</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'single'
              ? 'bg-amber-600 text-white shadow-md border-2 border-amber-700'
              : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs'
          }`}
        >
          <Plus className="w-4 h-4 text-amber-600" />
          <span>+ Add Single Question</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('topics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'topics'
              ? 'bg-indigo-600 text-white shadow-md border-2 border-indigo-700'
              : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Topic Summaries Editor ({topics.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pyq')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'pyq'
              ? 'bg-rose-600 text-white shadow-md border-2 border-rose-700'
              : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-2xs'
          }`}
        >
          <FileText className="w-4 h-4 text-rose-600" />
          <span>PYQ Papers Uploader ({pyqPapers.length})</span>
        </button>
      </div>

      {/* TAB 1: LIST / CATALOG VIEW */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                style={INPUT_STYLE}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 border-2 border-slate-300 shadow-2xs"
              >
                {TNPSC_SUBJECTS.map((s) => (
                  <option key={s.slug} value={s.slug} style={INPUT_STYLE}>
                    {s.name_ta} ({s.name_en})
                  </option>
                ))}
              </select>

              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or citations..."
                  style={INPUT_STYLE}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-900 border-2 border-slate-300 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Catalog</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-black border-b-2 border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Daily</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Question (Tamil)</th>
                    <th className="py-3 px-4">Correct Key</th>
                    <th className="py-3 px-4">Samacheer Citation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-bold text-sm">
                        No questions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleDaily(q.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              q.is_daily_challenge
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-500 border border-slate-300'
                            }`}
                          >
                            {q.is_daily_challenge ? '★ Live' : 'Off'}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-black text-slate-800">
                          {q.subject_slug}
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          <p className="font-bold text-slate-900 leading-snug line-clamp-2">
                            {q.question_ta}
                          </p>
                          {q.pyq_reference && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                              🎯 {q.pyq_reference}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-sm text-blue-700">
                          {q.correct_key}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium max-w-xs truncate">
                          {q.book_citation}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEMINI AI AUTO-FEEDER */}
      {activeTab === 'ai' && (
        <div className="bg-white border-2 border-purple-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md max-w-3xl">
          <div className="space-y-1 pb-3 border-b-2 border-slate-100">
            <h2 className="text-xl font-black text-purple-950 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span>Generate 10 Verified Samacheer Questions via Gemini</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Uses Gemini 2.5/Flash and the official Samacheer syllabus to construct 10 authentic MCQs with citations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Select Exam Subject:
              </label>
              <select
                value={aiSubject}
                onChange={(e) => setAiSubject(e.target.value)}
                style={INPUT_STYLE}
                className={SELECT_CLASSES}
              >
                {TNPSC_SUBJECTS.filter((s) => s.slug !== 'all').map((s) => (
                  <option key={s.slug} value={s.slug} style={INPUT_STYLE}>
                    {s.name_ta} ({s.name_en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Number of Questions:
              </label>
              <select
                value={aiCount}
                onChange={(e) => setAiCount(e.target.value)}
                style={INPUT_STYLE}
                className={SELECT_CLASSES}
              >
                <option value={5} style={INPUT_STYLE}>5 Questions</option>
                <option value={10} style={INPUT_STYLE}>10 Questions (Standard Batch)</option>
                <option value={15} style={INPUT_STYLE}>15 Questions</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateAi}
              disabled={aiGenerating}
              className="px-7 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              {aiGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Samacheer Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate & Add to Catalog Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: IMPORT PDF / MARKDOWN / JSON */}
      {activeTab === 'paste' && (
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md max-w-4xl">
          <div className="space-y-1 pb-3 border-b-2 border-slate-100">
            <h2 className="text-xl font-black text-emerald-950 flex items-center gap-2">
              <Upload className="w-6 h-6 text-emerald-600" />
              <span>Bulk Question Ingestor (Markdown, JSON, or Question Paper Text)</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Paste text from previous year question papers or JSON arrays. Auto-detects questions, choices A–D, answer keys, and book citations.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
              Paste Raw Question Text or JSON:
            </label>
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              rows={10}
              style={INPUT_STYLE}
              placeholder={`Paste here! Example formats:\n\nQ: தென்னிந்திய புரட்சி நடைபெற்ற ஆண்டு எது?\nA) 1800 - 1801\nB) 1806\nC) 1857\nD) 1799\nAns: A\nCitation: 10-ஆம் வகுப்பு சமூக அறிவியல் அலகு 6\nPYQ: Group 4 2024\n\nOr paste JSON: [{"question_ta": "...", "options": [...], "correct_key": "A"}]`}
              className="w-full p-4 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 font-mono text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleParsePaste}
              disabled={!pasteContent.trim()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>Parse & Preview Questions</span>
            </button>
          </div>

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="mt-6 pt-5 border-t-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl">
                  ✓ Ready to import {parsedPreview.length} questions
                </span>
                <button
                  type="button"
                  onClick={handleSaveParsedPreview}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md"
                >
                  {saving ? 'Saving...' : 'Confirm & Save All to Database'}
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2.5 border-2 border-slate-200 rounded-2xl p-4 bg-slate-50">
                {parsedPreview.map((p, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1 shadow-2xs">
                    <p className="font-bold text-slate-900 text-sm">
                      {idx + 1}. {p.question_ta}
                    </p>
                    <p className="text-slate-600 text-xs">
                      Ans: <strong className="text-emerald-700 font-black">{p.correct_key}</strong> | Citation: {p.book_citation} | PYQ: {p.pyq_reference}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADD SINGLE QUESTION (HIGH CONTRAST WHITE FORM) */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleSubmit} className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-8 space-y-5 shadow-md max-w-3xl">
          <div className="space-y-1 pb-3 border-b-2 border-slate-100">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-6 h-6 text-amber-600" />
              <span>Create Single TNPSC Question</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Add individual verified Samacheer Kalvi questions directly to the public live practice engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Subject
              </label>
              <select
                value={singleForm.subject_slug}
                onChange={(e) => setSingleForm({ ...singleForm, subject_slug: e.target.value })}
                style={INPUT_STYLE}
                className={SELECT_CLASSES}
              >
                {TNPSC_SUBJECTS.filter((s) => s.slug !== 'all').map((s) => (
                  <option key={s.slug} value={s.slug} style={INPUT_STYLE} className="bg-white text-slate-900 font-bold py-1">
                    {s.name_ta} ({s.name_en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Correct Option
              </label>
              <select
                value={singleForm.correct_key}
                onChange={(e) => setSingleForm({ ...singleForm, correct_key: e.target.value })}
                style={INPUT_STYLE}
                className={`${SELECT_CLASSES} text-blue-700 font-black`}
              >
                <option value="A" style={INPUT_STYLE} className="bg-white text-slate-900 font-bold">Option A</option>
                <option value="B" style={INPUT_STYLE} className="bg-white text-slate-900 font-bold">Option B</option>
                <option value="C" style={INPUT_STYLE} className="bg-white text-slate-900 font-bold">Option C</option>
                <option value="D" style={INPUT_STYLE} className="bg-white text-slate-900 font-bold">Option D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
              Question (Tamil) <span className="text-red-600">*</span>
            </label>
            <textarea
              value={singleForm.question_ta}
              onChange={(e) => setSingleForm({ ...singleForm, question_ta: e.target.value })}
              rows={3}
              required
              style={INPUT_STYLE}
              placeholder="எடுத்துக்காட்டு: உலகினில் நாகரிகம் முற்றும் அழிந்து விட்டாலும்..."
              className={INPUT_CLASSES}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Option A <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={singleForm.optionA}
                onChange={(e) => setSingleForm({ ...singleForm, optionA: e.target.value })}
                required
                style={INPUT_STYLE}
                placeholder="Option A விடை"
                className={INPUT_CLASSES}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Option B <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={singleForm.optionB}
                onChange={(e) => setSingleForm({ ...singleForm, optionB: e.target.value })}
                required
                style={INPUT_STYLE}
                placeholder="Option B விடை"
                className={INPUT_CLASSES}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Option C
              </label>
              <input
                type="text"
                value={singleForm.optionC}
                onChange={(e) => setSingleForm({ ...singleForm, optionC: e.target.value })}
                style={INPUT_STYLE}
                placeholder="Option C விடை"
                className={INPUT_CLASSES}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Option D
              </label>
              <input
                type="text"
                value={singleForm.optionD}
                onChange={(e) => setSingleForm({ ...singleForm, optionD: e.target.value })}
                style={INPUT_STYLE}
                placeholder="Option D விடை"
                className={INPUT_CLASSES}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Samacheer Book Citation
              </label>
              <input
                type="text"
                value={singleForm.book_citation}
                onChange={(e) => setSingleForm({ ...singleForm, book_citation: e.target.value })}
                placeholder="உதாரணம்: 10-ஆம் வகுப்பு தமிழ் இயல் 4, பக் 82"
                style={INPUT_STYLE}
                className={INPUT_CLASSES}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                PYQ Reference
              </label>
              <input
                type="text"
                value={singleForm.pyq_reference}
                onChange={(e) => setSingleForm({ ...singleForm, pyq_reference: e.target.value })}
                placeholder="உதாரணம்: TNPSC Group 4 2024"
                style={INPUT_STYLE}
                className={INPUT_CLASSES}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
              Explanation (Tamil)
            </label>
            <textarea
              value={singleForm.explanation_ta}
              onChange={(e) => setSingleForm({ ...singleForm, explanation_ta: e.target.value })}
              rows={2}
              style={INPUT_STYLE}
              placeholder="சமச்சீர் புத்தகக் குறிப்பு மற்றும் தேர்வுக்கான கூடுதல் விவரங்கள்..."
              className={INPUT_CLASSES}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              {saving ? 'Publishing...' : 'Publish Question to Catalog'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: TOPIC SUMMARIES EDITOR */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Topic Pre-Chapter Summaries & Samacheer Citations</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Author rich conceptual summaries, memorization bullets, and Samacheer Kalvi book citations displayed before candidates enter chapter practice.
                </p>
              </div>

              {/* Topic Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Edit Topic:</span>
                <select
                  value={selectedTopicSlug}
                  onChange={(e) => handleSelectTopic(e.target.value)}
                  style={INPUT_STYLE}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 border-2 border-slate-300"
                >
                  <option value="new">+ Create New Topic</option>
                  {topics.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.title_ta} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={topicForm.subject_slug}
                    onChange={(e) => setTopicForm({ ...topicForm, subject_slug: e.target.value })}
                    style={INPUT_STYLE}
                    className={SELECT_CLASSES}
                  >
                    {TNPSC_SUBJECTS.filter(s => s.slug !== 'all').map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name_ta} ({s.name_en})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Topic Slug (URL Path) *
                  </label>
                  <input
                    type="text"
                    required
                    value={topicForm.slug}
                    onChange={(e) => setTopicForm({ ...topicForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g. vallinam-migum-idangal"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    PYQ Frequency Count
                  </label>
                  <input
                    type="number"
                    value={topicForm.pyq_frequency_count}
                    onChange={(e) => setTopicForm({ ...topicForm, pyq_frequency_count: Number(e.target.value) })}
                    placeholder="e.g. 10 questions in last 5 years"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Title (Tamil) *
                  </label>
                  <input
                    type="text"
                    required
                    value={topicForm.title_ta}
                    onChange={(e) => setTopicForm({ ...topicForm, title_ta: e.target.value })}
                    placeholder="உதாரணம்: வல்லினம் மிகும் இடங்கள்"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={topicForm.title_en}
                    onChange={(e) => setTopicForm({ ...topicForm, title_en: e.target.value })}
                    placeholder="e.g. Places where Hard Consonants Double"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  Samacheer Kalvi Book Reference
                </label>
                <input
                  type="text"
                  value={topicForm.samacheer_book_ref}
                  onChange={(e) => setTopicForm({ ...topicForm, samacheer_book_ref: e.target.value })}
                  placeholder="உதாரணம்: 10-ஆம் வகுப்பு தமிழ் இயல் 4, பக்க எண் 82-85"
                  style={INPUT_STYLE}
                  className={INPUT_CLASSES}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  Pre-Chapter Editorial Summary (Tamil)
                </label>
                <textarea
                  rows={4}
                  value={topicForm.summary_overview_ta}
                  onChange={(e) => setTopicForm({ ...topicForm, summary_overview_ta: e.target.value })}
                  placeholder="இத்தலைப்பில் இருந்து TNPSC தேர்வுகளில் கேட்கப்படும் முக்கிய விதிகள் மற்றும் கோட்பாடுகளின் சுருக்கம்..."
                  style={INPUT_STYLE}
                  className={INPUT_CLASSES}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  Key Facts & High-Yield Bullet Points (One per line)
                </label>
                <textarea
                  rows={4}
                  value={topicForm.key_facts_text}
                  onChange={(e) => setTopicForm({ ...topicForm, key_facts_text: e.target.value })}
                  placeholder="அ, இ என்ற சுட்டெழுத்துகளுக்குப் பின் வல்லினம் மிகும். (அ+பக்கம் = அப்பக்கம்)
எ என்ற வினா எழுத்தின் பின் வல்லினம் மிகும். (எ+திசை = எத்திசை)
இரண்டாம் வேற்றுமை உருபாகிய 'ஐ' வெளிப்படும் தொடரில் வல்லினம் மிகும்."
                  style={INPUT_STYLE}
                  className={INPUT_CLASSES}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingTopic}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {savingTopic ? 'Saving Topic...' : 'Save Topic Summary'}
                </button>
                {selectedTopicSlug !== 'new' && (
                  <a
                    href={`/tnpsc/topics/${topicForm.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: PYQ PAPERS UPLOADER */}
      {activeTab === 'pyq' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-600" />
                  <span>Official PYQ Papers & Answer Keys Management</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Register official TNPSC past year examination papers (2014-2024), upload answer keys, and attach official TNPSC PDF links.
                </p>
              </div>

              {/* Paper Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Select Paper:</span>
                <select
                  value={selectedPaperSlug}
                  onChange={(e) => handleSelectPaper(e.target.value)}
                  style={INPUT_STYLE}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 border-2 border-slate-300"
                >
                  <option value="new">+ Add New PYQ Paper</option>
                  {pyqPapers.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.year} {p.title_ta} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleSavePaper} className="space-y-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Target Exam *
                  </label>
                  <select
                    value={paperForm.exam_slug}
                    onChange={(e) => setPaperForm({ ...paperForm, exam_slug: e.target.value })}
                    style={INPUT_STYLE}
                    className={SELECT_CLASSES}
                  >
                    {TNPSC_EXAMS.map((ex) => (
                      <option key={ex.slug} value={ex.slug}>
                        {ex.name_ta} ({ex.name_en})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Exam Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={paperForm.year}
                    onChange={(e) => setPaperForm({ ...paperForm, year: Number(e.target.value) })}
                    placeholder="2024"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Paper Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={paperForm.slug}
                    onChange={(e) => setPaperForm({ ...paperForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g. group-4-2024"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    value={paperForm.total_questions}
                    onChange={(e) => setPaperForm({ ...paperForm, total_questions: Number(e.target.value) })}
                    placeholder="200"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Paper Title (Tamil) *
                  </label>
                  <input
                    type="text"
                    required
                    value={paperForm.title_ta}
                    onChange={(e) => setPaperForm({ ...paperForm, title_ta: e.target.value })}
                    placeholder="உதாரணம்: குரூப் 4 அதிகாரப்பூர்வ வினாத்தாள் 2024"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    Paper Title (English)
                  </label>
                  <input
                    type="text"
                    value={paperForm.title_en}
                    onChange={(e) => setPaperForm({ ...paperForm, title_en: e.target.value })}
                    placeholder="e.g. Group 4 Official Question Paper 2024"
                    style={INPUT_STYLE}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  Official TNPSC PDF URL
                </label>
                <input
                  type="url"
                  value={paperForm.official_pdf_url}
                  onChange={(e) => setPaperForm({ ...paperForm, official_pdf_url: e.target.value })}
                  placeholder="https://www.tnpsc.gov.in/Document/QuestionPaper/..."
                  style={INPUT_STYLE}
                  className={INPUT_CLASSES}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingPaper}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {savingPaper ? 'Saving Paper...' : 'Save PYQ Paper'}
                </button>
                {selectedPaperSlug !== 'new' && (
                  <a
                    href={`/tnpsc/pyq/${paperForm.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>View Paper Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
