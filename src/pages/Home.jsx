// @ts-nocheck
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

function getLastResult(id) {
  try {
    const raw = localStorage.getItem(`chapter-${id}-last`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function Home() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  // 加载章节元数据（meta.json 或默认）
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const r = await fetch(`/questions/meta.json?_=${Date.now()}`)
        if (!r.ok) throw new Error('meta not found')
        const data = await r.json()
        if (!cancelled) setList(data)
      } catch {
        if (!cancelled) {
          // 没有 meta.json 时使用默认三章
          setList([
            { id: '1', title: '第一章', desc: '固定题库（本地 JSON）' },
            { id: '2', title: '第二章', desc: '固定题库（本地 JSON）' },
            { id: '3', title: '第三章', desc: '固定题库（本地 JSON）' }
          ])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // 搜索过滤章节
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    if (!kw) return list
    return list.filter(ch =>
      (ch.title + ' ' + (ch.desc || '')).toLowerCase().includes(kw)
    )
  }, [list, q])

  return (
    <div>
      {/* 顶部标题 + 搜索框 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h3 style={{ marginTop: 6 }}>选择章节开始练习</h3>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索章节…"
          aria-label="搜索章节"
        />
      </div>

      {/* 加载中 */}
      {loading && <p className="note">章节加载中…</p>}

      {/* 章节卡片 */}
      {!loading && (
        <div className="grid" style={{ marginTop: 12 }}>
          {filtered.map((ch) => {
            const last = getLastResult(ch.id)
            const hasRecord = !!last
            const total = ch.total ?? (last?.total ?? undefined)
            const pct = total ? Math.round(((last?.score || 0) / total) * 100) : 0

            return (
              <div className="card" key={ch.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    alignItems: 'baseline',
                  }}
                >
                  <h3 style={{ margin: 0 }}>{ch.title}</h3>
                  {total ? <span className="badge">共 {total} 题</span> : null}
                </div>

                <p className="note" style={{ marginTop: 6 }}>
                  {ch.desc || '—'}
                </p>

                {/* 最近成绩 */}
                <div>
                  {hasRecord ? (
                    <>
                      <div className="note">
                        最近：{last.score}/{total ?? last.total ?? '?'}（
                        {total ? Math.round((last.score / total) * 100) : '?'}%）·{' '}
                        {new Date(last.time).toLocaleString()}
                      </div>
                      {total ? (
                        <div className="progressbar" style={{ marginTop: 6 }}>
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <span className="note">尚无记录</span>
                  )}
                </div>

                <div style={{ height: 10 }} />
                <div className="actions">
                  {/* 只保留一个按钮：进入 */}
                  <Link className="button primary" to={`/chapter/${ch.id}`}>
                    进入
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <hr />
      <p className="note">提示：成绩不保存。</p>
    </div>
  )
}
