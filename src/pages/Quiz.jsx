// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Question from '../components/Question.jsx'

export default function Quiz() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})    // 单选: number；多选: number[]；填空: string
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const itemRefs = useRef([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setSubmitted(false)
    setAnswers({})
    setActiveIndex(0)

    fetch(`/questions/ch${id}.json?_=${Date.now()}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (cancelled) return
        const arr = Array.isArray(data) ? data : []
        // 兼容：若没显式 type，按是否有 answerIndices / answerIndex 推断
        const normalized = arr.map(q => {
          const type =
            q.type ||
            (Array.isArray(q.answerIndices) ? 'multiple'
              : typeof q.answerIndex === 'number' ? 'single'
              : 'fill')
          return { ...q, type }
        })
        setQuestions(normalized)
        itemRefs.current = new Array(normalized.length)
      })
      .catch(e => { if (!cancelled) setError(e.message || '加载失败') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  const total = questions.length
  const gradableCount = useMemo(
    () => questions.filter(q => q.type !== 'fill').length,
    [questions]
  )

  // 评分逻辑：单选=1/0；多选=1/0.5/0；填空=跳过
  const perQuestionScore = (q) => {
    if (q.type === 'fill') return null // 不参与评分
    const userAns = answers[q.id]
    if (q.type === 'single') {
      return Number(userAns === q.answerIndex)
    }
    // multiple
    const correctSet = new Set(q.answerIndices || [])
    const userSet = new Set(Array.isArray(userAns) ? userAns : [])

    if (userSet.size === 0) return 0 // 没选 -> 错
    // 有任何“错误选项”被选中 -> 0 分
    for (const idx of userSet) {
      if (!correctSet.has(idx)) return 0
    }
    // 到这里说明没有选错
    const allCorrectSelected = q.answerIndices?.every(idx => userSet.has(idx))
    if (allCorrectSelected) return 1
    // 少选但全都正确 -> 半分
    return 0.5
  }

  const score = useMemo(() => {
    if (!submitted) return 0
    let s = 0
    for (const q of questions) {
      const v = perQuestionScore(q)
      if (v != null) s += v
    }
    return s
  }, [submitted, questions, answers])

  const percent = useMemo(() => {
    if (!submitted) return 0
    if (gradableCount === 0) return 0
    return Math.round((score / gradableCount) * 100)
  }, [submitted, score, gradableCount])

  function onSelect(q, payload) {
    // payload：单选 number；多选 number（切换）；填空 string
    setAnswers(prev => {
      if (q.type === 'multiple') {
        const prevArr = Array.isArray(prev[q.id]) ? prev[q.id] : []
        const exists = prevArr.includes(payload)
        const nextArr = exists
          ? prevArr.filter(i => i !== payload)
          : [...prevArr, payload]
        return { ...prev, [q.id]: nextArr.sort((a,b)=>a-b) }
      }
      return { ...prev, [q.id]: payload }
    })
  }

  function onSubmit() {
    if (!total) return
    setSubmitted(true)
    try {
      localStorage.setItem(
        `chapter-${id}-last`,
        JSON.stringify({ score, total, time: Date.now(), answers })
      )
    } catch {}
  }

  // 顶部题号导航的点击定位
  function goto(index) {
    if (index < 0 || index >= total) return
    setActiveIndex(index)
    const el = itemRefs.current[index]
    if (!el) return
    const header = document.querySelector('.header')
    const headerH = header ? header.offsetHeight : 0
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - 8
    try { window.scrollTo({ top, behavior: 'smooth' }) } catch { window.scrollTo(0, top) }
  }

  return (
    <div>
      {/* 顶部：标题 + 返回 */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <h3 style={{ margin:0 }}>章节：第{id}章</h3>
        <Link className="button" to="/">返回首页</Link>
      </div>

      {/* 顶部题号导航条 */}
      {!loading && total > 0 && (
        <div className="navbar" style={{ margin:'8px 0 12px' }}>
          {questions.map((q, i) => {
            const classes = ['navbtn']
            if (i === activeIndex) classes.push('active')
            if (submitted && q.type !== 'fill') {
              const v = perQuestionScore(q)
              if (v === 1) classes.push('ok')
              else if (v === 0.5) classes.push('active') // 半对就给轻微高亮
              else classes.push('err')
            }
            return (
              <button
                key={q.id}
                className={classes.join(' ')}
                onClick={() => goto(i)}
                title={`第 ${i + 1} 题`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      )}

      {/* 加载/错误/空状态 */}
      {loading && <p className="note">题目加载中…</p>}
      {!loading && error && (
        <div className="state" style={{ marginTop:8 }}>
          <div className="title">加载失败</div>
          <div className="desc">{String(error)}</div>
          <button className="button sm" onClick={() => location.reload()}>重试</button>
        </div>
      )}
      {!loading && !error && total === 0 && (
        <div className="state" style={{ marginTop:8 }}>
          <div className="title">暂无题目</div>
          <div className="desc">请检查 <code>public/questions/ch{id}.json</code>。</div>
        </div>
      )}

      {/* 题目列表 */}
      {!loading && !error && total > 0 && (
        <>
          <p className="note">
            共 {total} 题；自动批改题：{gradableCount} 题。
            {submitted ? ' 已提交，展示结果；填空题不参与自动批改。' : ' 作答后点击底部“提交并计分”。'}
          </p>

          {questions.map((q, idx) => (
            <div
              key={q.id}
              ref={(el) => { itemRefs.current[idx] = el }}
              onClick={() => setActiveIndex(idx)}
              style={{ scrollMarginTop: 90 }}
            >
              <Question
                q={q}
                index={idx}
                selected={answers[q.id]}
                onSelect={(payload) => onSelect(q, payload)}
                showResult={submitted}
              />
            </div>
          ))}

          {/* 底部粘性操作区（去掉上一题/下一题） */}
          <div className="sticky-actions">
            <div className="actions" style={{ justifyContent:'space-between', width:'100%' }}>
              <span className="note">
                {submitted
                  ? `得分：${score} / ${gradableCount}（${percent}%）`
                  : `已作答：${Object.keys(answers).length} / ${total}`}
              </span>

              {!submitted ? (
                <button
                  className="button primary"
                  onClick={onSubmit}
                  // 至少需要自动批改题全部作答才允许提交（填空不做强制）
                  disabled={questions.some(q => q.type !== 'fill' && !(q.id in answers))}
                  title="完成所有自动批改题后可提交"
                >
                  提交并计分
                </button>
              ) : (
                <button className="button" onClick={() => setSubmitted(false)}>返回修改</button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
