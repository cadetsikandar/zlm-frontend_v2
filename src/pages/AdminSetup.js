import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, CheckCircle, Loader2, ChevronRight, Zap, BookOpen, Download
} from 'lucide-react';
import { generateChapter, downloadBook } from '../api';
import api from '../api';
import toast from 'react-hot-toast';

const PMHNP_CHAPTERS = [
  { number: 1,  title: 'History, Pioneers, and Theorists of Psychiatric Mental Health Nursing' },
  { number: 2,  title: 'Neuroscience for Advanced Psychiatric Practice' },
  { number: 3,  title: 'Advanced Psychopharmacology Across the Lifespan' },
  { number: 4,  title: 'Research and Evidence-Based Practice in Mental Health' },
  { number: 5,  title: 'Healthcare Policy and Legal Issues in Psychiatric Care' },
  { number: 6,  title: 'Psychiatric Assessment and ANCC Mental Health Illness Diagnostic Reasoning' },
  { number: 7,  title: 'Diagnosis and Management of Mental Health Disorders' },
  { number: 8,  title: 'Advanced Practice Psychiatric Nursing Across the Lifespan' },
  { number: 9,  title: 'Psychotherapeutic Modalities for Advanced Practice Nurses' },
  { number: 10, title: 'Substance Use Disorders and Addiction Medicine' },
  { number: 11, title: 'Group Therapy and Family Interventions' },
  { number: 12, title: 'Crisis Intervention and Risk Assessment' },
  { number: 13, title: 'PMHNP Clinical Practicum I' },
  { number: 14, title: 'PMHNP Clinical Practicum II' },
  { number: 15, title: 'PMHNP Clinical Practicum III' },
];

const getStatusConfig = (status) => {
  const s = (status || '').toUpperCase();
  const map = {
    'PENDING':      { bg: '#f3f4f6', color: '#6b7280', label: 'Pending' },
    'GENERATING':   { bg: '#fef3c7', color: '#d97706', label: 'Generating…' },
    'GENERATED':    { bg: '#d1fae5', color: '#059669', label: 'Generated ✓' },
    'QA_PENDING':   { bg: '#ede9fe', color: '#7c3aed', label: 'QA Pending' },
    'QA_PASSED':    { bg: '#d1fae5', color: '#059669', label: 'QA Passed ✓' },
    'QA_FAILED':    { bg: '#fee2e2', color: '#dc2626', label: 'QA Failed' },
    'DESIGN_READY': { bg: '#e0f2fe', color: '#0284c7', label: 'Design Ready' },
  };
  return map[s] || { bg: '#f9fafb', color: '#9ca3af', label: status || 'Unknown' };
};

const isDone = (status) =>
  ['GENERATED','QA_PENDING','QA_PASSED','QA_FAILED','DESIGN_READY'].includes((status||'').toUpperCase());

const isPending = (status) =>
  ['PENDING','QA_FAILED'].includes((status||'').toUpperCase());

export default function AdminSetup() {
  const [step, setStep] = useState(1);
  const [bookId, setBookId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [log, setLog] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const logRef = useRef(null);
  const abortRef = useRef(false);

  const addLog = (msg, type = 'info') => {
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  };

  const refreshChapters = useCallback(async (bid) => {
    const id = bid || bookId;
    if (!id) return [];
    try {
      const res = await api.get(`/api/books/${id}/chapters`);
      const chs = res.data?.chapters || [];
      setChapters(chs);
      return chs;
    } catch (e) {
      addLog(`Failed to load chapters: ${e.message}`, 'error');
      return [];
    }
  }, [bookId]);

  useEffect(() => {
    if (!generating || !bookId) return;
    const interval = setInterval(() => refreshChapters(bookId), 20000);
    return () => clearInterval(interval);
  }, [generating, bookId, refreshChapters]);

  // STEP 1
  const handleFindOrCreateBook = async () => {
    setLoading(true);
    addLog('Searching for PMHNP Book 1…');
    try {
      const res = await api.get('/api/books');
      // API returns array directly (not wrapped in {books:[]})
      const books = Array.isArray(res.data) ? res.data : (res.data?.books || []);
      addLog(`Found ${books.length} books in database`);

      let pmhnp = books.find(b => b.certificationTrack === 'PMHNP' && b.trackNumber === 1);

      if (pmhnp) {
        addLog(`✓ Found PMHNP Book 1 — ID: ${pmhnp.id}`, 'success');
        setBookId(pmhnp.id);
        const chs = await refreshChapters(pmhnp.id);
        if (chs.length > 0) {
          addLog(`  ${chs.length} chapters already exist`, 'success');
          setStep(3);
        } else {
          setStep(2);
        }
      } else {
        addLog('Not found — creating PMHNP Book 1…');
        const createRes = await api.post('/api/books', {
          title: 'PMHNP Certification Review: Advanced Psychiatric Mental Health Nursing',
          certificationTrack: 'PMHNP',
          trackNumber: 1,
        });
        // booksController.create returns book directly
        const newBook = createRes.data?.id ? createRes.data : createRes.data?.book;
        addLog(`✓ Created — ID: ${newBook.id}`, 'success');
        setBookId(newBook.id);
        setStep(2);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      addLog(`✗ Error: ${msg}`, 'error');
      if (err.response?.status === 409) {
        addLog('Book already exists — trying to find it again…', 'warn');
        // Re-fetch and find it
        try {
          const res2 = await api.get('/api/books');
          const books2 = Array.isArray(res2.data) ? res2.data : (res2.data?.books || []);
          const pmhnp2 = books2.find(b => b.certificationTrack === 'PMHNP' && b.trackNumber === 1);
          if (pmhnp2) {
            setBookId(pmhnp2.id);
            addLog(`✓ Found after retry — ID: ${pmhnp2.id}`, 'success');
            const chs = await refreshChapters(pmhnp2.id);
            setStep(chs.length > 0 ? 3 : 2);
          }
        } catch {}
      } else {
        toast.error('Failed — is Docker running?');
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2
  const handleSeedChapters = async () => {
    setLoading(true);
    addLog('Seeding 15 locked PMHNP chapters…');
    try {
      const res = await api.post(`/api/books/${bookId}/seed-chapters`, {
        chapters: PMHNP_CHAPTERS,
      });
      addLog(`✓ ${res.data.chapters_created} chapters created!`, 'success');
      await refreshChapters(bookId);
      setStep(3);
    } catch (err) {
      addLog(`✗ Seed failed: ${err.response?.data?.message || err.message}`, 'error');
      toast.error('Seed failed — check Docker logs');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3
  const handleGenerateAll = async () => {
    abortRef.current = false;
    setGenerating(true);
    addLog('Starting generation of all 15 chapters…', 'success');
    addLog('⚠️  Keep this tab open. ~60 minutes total.');

    let chs = await refreshChapters(bookId);
    const pending = chs
      .filter(c => isPending(c.status))
      .sort((a, b) => a.chapterNumber - b.chapterNumber);

    if (pending.length === 0) {
      addLog('✓ All chapters already generated!', 'success');
      setGenerating(false);
      setStep(4);
      return;
    }

    addLog(`${pending.length} chapters to generate.`);

    for (let i = 0; i < pending.length; i++) {
      if (abortRef.current) { addLog('⚠️  Stopped.', 'warn'); break; }

      const ch = pending[i];
      setCurrentChapter(ch.chapterNumber);
      addLog(`[${i + 1}/${pending.length}] Ch.${ch.chapterNumber}: ${ch.title.slice(0, 45)}…`);

      try {
        await generateChapter(ch.id);
        addLog(`  ↳ Queued ✓`);
      } catch (err) {
        addLog(`  ↳ ✗ ${err.response?.data?.message || err.message}`, 'error');
      }

      if (i < pending.length - 1 && !abortRef.current) {
        let secs = 240;
        setCountdown(secs);
        await new Promise(resolve => {
          const interval = setInterval(() => {
            secs--;
            setCountdown(secs);
            if (secs <= 0 || abortRef.current) { clearInterval(interval); resolve(); }
          }, 1000);
        });
        setCountdown(0);
      }

      await refreshChapters(bookId);
    }

    setCurrentChapter(null);
    setCountdown(0);
    const final = await refreshChapters(bookId);
    const doneCount = final.filter(c => isDone(c.status)).length;
    addLog(`\n✅ Done! ${doneCount}/${final.length} chapters generated.`, 'success');
    if (doneCount === final.length) setStep(4);
    setGenerating(false);
  };

  const generatedCount = chapters.filter(c => isDone(c.status)).length;
  const totalWords = chapters.reduce((s, c) => s + (c.wordCount || 0), 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
        Phase 2 — PMHNP Book 1 Setup
      </h1>
      <p style={{ color: '#6b7280', margin: '0 0 32px' }}>
        Complete Phase 2 from this panel — no terminal needed.
      </p>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {['Find/Create Book', 'Seed 15 Chapters', 'Generate Content', 'Complete!'].map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#059669' : active ? '#7c3aed' : '#e5e7eb', color: done || active ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                  {done ? <CheckCircle size={16} /> : n}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#7c3aed' : done ? '#059669' : '#9ca3af', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < 3 && <ChevronRight size={16} color="#d1d5db" />}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>

        {/* Step 1 */}
        <div style={{ background: 'white', border: `2px solid ${step === 1 ? '#7c3aed' : step > 1 ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#111827' }}>Step 1: Find or Create PMHNP Book 1</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Checks the database. Creates the book if it doesn't exist.</p>
              {bookId && <p style={{ margin: '8px 0 0', fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>ID: {bookId}</p>}
            </div>
            {step > 1
              ? <CheckCircle size={28} color="#059669" />
              : <button onClick={handleFindOrCreateBook} disabled={loading}
                  style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <BookOpen size={16} />}
                  Find / Create
                </button>
            }
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ background: 'white', border: `2px solid ${step === 2 ? '#7c3aed' : step > 2 ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 12, padding: 24, opacity: step < 2 ? 0.45 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#111827' }}>Step 2: Seed 15 Locked Chapter Titles</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Inserts all 15 confirmed chapter titles. GPT will not change them.</p>
            </div>
            {step > 2
              ? <CheckCircle size={28} color="#059669" />
              : <button onClick={handleSeedChapters} disabled={loading || step !== 2}
                  style={{ background: step === 2 ? '#7c3aed' : '#e5e7eb', color: step === 2 ? 'white' : '#9ca3af', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: step === 2 ? 'pointer' : 'not-allowed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {loading && step === 2 ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={16} />}
                  Seed Chapters
                </button>
            }
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ background: 'white', border: `2px solid ${step === 3 ? '#7c3aed' : step > 3 ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 12, padding: 24, opacity: step < 3 ? 0.45 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: chapters.length > 0 ? 20 : 0 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#111827' }}>Step 3: Generate All 15 Chapters</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>
                GPT-4 writes each chapter (~4 min each, ~60 min total).
                {generating && currentChapter && <span style={{ color: '#7c3aed', fontWeight: 600 }}> Now writing Ch.{currentChapter}</span>}
              </p>
            </div>
            {generating
              ? <button onClick={() => { abortRef.current = true; setGenerating(false); setCountdown(0); }}
                  style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 700 }}>
                  Stop
                </button>
              : <button onClick={handleGenerateAll} disabled={step < 3}
                  style={{ background: step >= 3 ? '#7c3aed' : '#e5e7eb', color: step >= 3 ? 'white' : '#9ca3af', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: step >= 3 ? 'pointer' : 'not-allowed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Play size={16} /> Generate All 15
                </button>
            }
          </div>

          {chapters.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber).map(ch => {
                const cfg = getStatusConfig(ch.status);
                const isActive = currentChapter === ch.chapterNumber;
                return (
                  <div key={ch.id} style={{ background: cfg.bg, borderRadius: 8, padding: '10px 12px', border: isActive ? '2px solid #7c3aed' : '1px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>Ch.{ch.chapterNumber}</span>
                      {isActive && <Loader2 size={11} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />}
                    </div>
                    <p style={{ fontSize: 11, color: '#4b5563', margin: '3px 0 6px', lineHeight: 1.3 }}>
                      {ch.title.slice(0, 38)}{ch.title.length > 38 ? '…' : ''}
                    </p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, background: 'white', color: cfg.color, borderRadius: 4, padding: '2px 6px', fontWeight: 600 }}>{cfg.label}</span>
                      {ch.wordCount > 0 && <span style={{ fontSize: 10, color: '#9ca3af' }}>{ch.wordCount.toLocaleString()}w</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {countdown > 0 && (
            <div style={{ marginTop: 16, background: '#fef3c7', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Loader2 size={18} color="#d97706" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#92400e', fontSize: 14 }}>
                  Generating… next chapter in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#92400e' }}>Keep this tab open.</p>
              </div>
            </div>
          )}

          {chapters.length > 0 && (
            <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
              <div><span style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{generatedCount}</span><span style={{ fontSize: 13, color: '#6b7280' }}> / {chapters.length} done</span></div>
              <div><span style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>{(totalWords / 1000).toFixed(0)}K</span><span style={{ fontSize: 13, color: '#6b7280' }}> words</span></div>
            </div>
          )}
        </div>

        {/* Step 4 */}
        {step === 4 && (
          <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 12, padding: 32, textAlign: 'center' }}>
            <CheckCircle size={52} color="#059669" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#059669', margin: '0 0 8px', fontSize: 22 }}>Phase 2 Complete! 🎉</h3>
            <p style={{ color: '#374151', margin: '0 0 24px' }}>
              All 15 PMHNP chapters generated — {totalWords.toLocaleString()} words written.
            </p>
            <button onClick={() => downloadBook(bookId, 'PMHNP-Book1').catch(() => toast.error('Download failed'))}
              style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '12px 28px', cursor: 'pointer', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Download size={18} /> Download All 15 Chapters (.zip)
            </button>
          </div>
        )}
      </div>

      {/* Log */}
      <div style={{ background: '#0d1117', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8b949e', fontFamily: 'monospace' }}>Activity Log</span>
          <button onClick={() => setLog([])} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 11 }}>Clear</button>
        </div>
        <div ref={logRef} style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, maxHeight: 200, overflowY: 'auto' }}>
          {log.length === 0
            ? <span style={{ color: '#4b5563' }}>Waiting…</span>
            : log.map((e, i) => (
              <div key={i} style={{ marginBottom: 3, color: e.type === 'error' ? '#f85149' : e.type === 'success' ? '#3fb950' : e.type === 'warn' ? '#d29922' : '#8b949e' }}>
                <span style={{ color: '#484f58' }}>[{e.time}]</span> {e.msg}
              </div>
            ))
          }
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
