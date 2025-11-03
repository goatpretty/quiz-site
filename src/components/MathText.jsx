// @ts-nocheck
import React, { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

/**
 * 用法：
 * <MathText>{'这是行内 $a^2+b^2=c^2$，下面是块级：\\n\\n$$\\int_0^1 x^2\\,dx=1/3$$'}</MathText>
 */
function MathText({ children, className }) {
  return (
    <ReactMarkdown
      className={className}
      // 允许 markdown + 数学
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      // 出于安全，保持默认（不解析 HTML），只支持 markdown 文本 + math
      // 如果确实需要渲染自带 HTML，才去配置 allowedElements/unwrapDisallowed
      linkTarget="_blank"
    >
      {String(children || '')}
    </ReactMarkdown>
  )
}

export default memo(MathText)
