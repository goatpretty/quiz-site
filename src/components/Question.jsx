// @ts-nocheck
export default function Question({ q, index, selected, onSelect, showResult }) {
  const isSingle = q.type === 'single' || typeof q.answerIndex === 'number'
  const isMultiple = q.type === 'multiple' || Array.isArray(q.answerIndices)
  const isFill = q.type === 'fill' && !isSingle && !isMultiple

  const correctIndex = q.answerIndex
  const correctSet = new Set(q.answerIndices || [])

  // 选中态判断
  const isChecked = (i) => {
    if (isMultiple) return Array.isArray(selected) && selected.includes(i)
    return selected === i
  }

  // 提交后锁定：不允许点击或编辑
  const locked = !!showResult

  /** 单选：逐项决定 class
   *  - 选对：正确项标绿，其余默认
   *  - 选错：选错项标红 + 正确项标绿
   */
  const classForSingle = (i) => {
    if (!showResult) return 'choice'
    const checked = selected === i
    const isCorrect = i === correctIndex
    if (isCorrect) return 'choice correct'
    if (checked && !isCorrect) return 'choice incorrect'
    return 'choice'
  }

  /** 多选：逐项决定 class
   *  - 选中且正确：绿
   *  - 选中且错误：红
   *  - 未选且正确：黄（漏选提示）
   *  - 其他未选错误项：默认
   */
  const classForMultiple = (i) => {
    if (!showResult) return 'choice'
    const sel = new Set(Array.isArray(selected) ? selected : [])
    const isSelected = sel.has(i)
    const isCorrect = correctSet.has(i)
    if (isSelected && isCorrect) return 'choice correct'
    if (isSelected && !isCorrect) return 'choice incorrect'
    if (!isSelected && isCorrect) return 'choice partial' // 黄色
    return 'choice'
  }

  return (
    <section className="card" aria-label={`第 ${index + 1} 题`} style={{ marginBottom: 12 }}>
      <div className="section-title">
        第 {index + 1} 题 {isMultiple ? '（多选）' : isFill ? '（填空）' : '（单选）'}
      </div>

      <div style={{ margin: '6px 0 10px' }}>
        <div className="question-stem">{q.stem || q.title || ''}</div>
        {q.image ? (
          <div style={{ marginTop: 8 }}>
            <img src={q.image} alt="" />
          </div>
        ) : null}
      </div>

      {/* 选项 / 输入区 */}
      {!isFill ? (
        <div>
          {(q.options || []).map((opt, i) => {
            const lineClass = isSingle ? classForSingle(i) : classForMultiple(i)
            return (
              <label
                key={i}
                className={lineClass}
                onClick={(e) => {
                  e.preventDefault()
                  if (locked) return
                  if (isSingle) onSelect(i)
                  else onSelect(i) // 多选 toggle
                }}
                style={{ cursor: locked ? 'default' : 'pointer' }}
              >
                <input
                  type={isSingle ? 'radio' : 'checkbox'}
                  name={`q-${q.id}`}
                  checked={!!isChecked(i)}
                  onChange={() => {}}
                  disabled={locked}
                  style={{ pointerEvents: 'none' }}
                  aria-label={isSingle ? '单选' : '多选'}
                />
                <div>
                  <div>{opt?.text ?? String(opt)}</div>
                  {opt?.img ? <img src={opt.img} alt="" style={{ marginTop: 6 }} /> : null}
                </div>
              </label>
            )
          })}
          {isMultiple && !showResult && (
            <div className="note">提示：本题为多选题，可选择多个选项。</div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            className="input"
            rows={4}
            placeholder="在此输入你的解题过程/答案（本题不参与自动批改）"
            value={typeof selected === 'string' ? selected : ''}
            onChange={(e) => !locked && onSelect(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
            disabled={locked}
          />
          <div className="note" style={{ marginTop: 8 }}>
            本题为填空/主观题，不参与自动批改。
          </div>
        </div>
      )}

      {/* 解析：提交后显示；填空题也显示解析 */}
      {showResult && q.explain && (
        <>
          <div className="hr"></div>
          <div className="note">解析：{q.explain}</div>
        </>
      )}
    </section>
  )
}
