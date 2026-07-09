import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { useSaved } from '../contexts/SavedContext';

export default function QuizPlayer({ museum, onBack }) {
  const { lang, t } = useLang();
  const { saveQuizScore, markVisited } = useSaved();
  const loc = museum[lang] || museum.uz || museum.ru || museum.en || museum;
  const quiz = loc.quiz || [];
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => { markVisited(museum.id); }, [museum.id, markVisited]);

  const selected = answers[qi] ?? -1;
  const currentQ = quiz[qi] || { q: '', options: [] };
  const isLast = qi >= quiz.length - 1;
  const canNext = selected >= 0;

  const handleAnswer = (i) => {
    const a = [...answers];
    a[qi] = i;
    setAnswers(a);
  };

  const handleNext = () => {
    if (!canNext) return;
    if (isLast) {
      const sc = answers.reduce((s, a, idx) => s + (quiz[idx] && a === quiz[idx].a ? 1 : 0), 0);
      saveQuizScore(museum.id, sc, quiz.length);
      setDone(true);
    } else {
      setQi(qi + 1);
    }
  };

  const score = answers.reduce((s, a, idx) => s + (quiz[idx] && a === quiz[idx].a ? 1 : 0), 0);
  const pct = quiz.length ? score / quiz.length : 0;
  const resultMsg = pct >= 1 ? t.resultGreat : pct >= 0.7 ? t.resultGood : pct >= 0.4 ? t.resultSoso : t.resultLow;

  const optStyle = (isSel) => ({
    fontFamily: 'var(--font-ui)', cursor: 'pointer', textAlign: 'left', width: '100%',
    padding: '15px 18px', borderRadius: 'calc(var(--radius) + 2px)', fontSize: 15, transition: 'all .18s',
    ...(isSel
      ? { background: 'var(--accent)', color: 'var(--accent-fg)', border: '1.5px solid var(--accent)', fontWeight: 600 }
      : { background: 'var(--surface2)', color: 'var(--fg)', border: '1.5px solid var(--line)' })
  });

  if (done) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '22px 24px 90px', animation: 'fhFade .4s ease both' }}>
        <button onClick={onBack} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 14, padding: '6px 0', marginBottom: 18 }}>{t.backToMuseum}</button>
        <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 11.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>{t.quizTitle} · {loc.name}</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '48px 32px', marginTop: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18 }}>{t.yourResult}</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 68, lineHeight: 1, color: 'var(--accent)' }}>{score}<span style={{ color: 'var(--muted)', fontSize: 36 }}>/{quiz.length}</span></div>
          <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 8 }}>{t.correct}</div>
          <p style={{ fontSize: 19, color: 'var(--fg)', margin: '24px auto 32px', maxWidth: 420, lineHeight: 1.5 }}>{resultMsg}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setQi(0); setAnswers([]); setDone(false); }} className="btn-primary">{t.retry}</button>
            <button onClick={onBack} className="btn-secondary">{t.backToMuseum}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '22px 24px 90px', animation: 'fhFade .4s ease both' }}>
      <button onClick={onBack} style={{ fontFamily: 'var(--font-ui)', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 14, padding: '6px 0', marginBottom: 18 }}>{t.backToMuseum}</button>
      <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 11.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>{t.quizTitle} · {loc.name}</div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '36px 34px 30px', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{t.question} {qi + 1} {t.of} {quiz.length}</div>
          <div style={{ flex: 1, height: 5, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--accent)', width: `${Math.round(((qi + 1) / quiz.length) * 100)}%`, transition: 'width .3s' }} />
          </div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 26, lineHeight: 1.3, color: 'var(--fg)', margin: '0 0 26px' }}>{currentQ.q}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {currentQ.options.map((txt, i) => (
            <button key={i} onClick={() => handleAnswer(i)} style={optStyle(i === selected)}>{txt}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
          <button onClick={handleNext} disabled={!canNext} className="btn-primary" style={{ opacity: canNext ? 1 : 0.4, cursor: canNext ? 'pointer' : 'not-allowed' }}>
            {isLast ? t.finish : t.next}
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', marginTop: 18 }}>{t.quizIntro}</div>
    </div>
  );
}
