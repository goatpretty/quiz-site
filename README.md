# React 题库网页系统

一个轻量级的题库练习网页，基于 **React + Vite** 构建。  
支持本地固定题库（JSON 文件）、章节分类、答题计分、查看解析、以及 **LaTeX 公式渲染**。

---

## 功能特性

- **章节划分**：按章节管理题库（`ch1.json`、`ch2.json`…），首页可自由选择。
- **自动计分**：答题后自动计算得分并本地保存，首页显示上次成绩。
- **查看解析**：提交后显示正确答案与解析。
- **本地存储**：成绩记录、答题进度保存在浏览器 LocalStorage。
- **LaTeX 支持**：题干与选项中可使用 `$...$` 或 `$$...$$` 插入数学公式。
- **响应式设计**：适配移动端与桌面端。
- **自动深色模式**：随系统主题切换。
- **完全前端运行**：无需后端环境，直接部署静态资源即可使用。

---

## 技术栈

| 模块 | 用途 |
|------|------|
| [React 18](https://react.dev/) | 前端框架 |
| [Vite](https://vitejs.dev/) | 快速构建工具 |
| [react-router-dom](https://reactrouter.com/) | 路由管理 |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown 渲染 |
| [remark-math](https://github.com/remarkjs/remark-math) + [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex) | LaTeX 数学公式支持 |
| [KaTeX](https://katex.org/) | 数学公式渲染引擎 |

---

## 项目结构

```
quiz-site/
├── public/
│   └── questions/
│       ├── ch1.json
│       ├── ch2.json
│       ├── ch3.json
│       └── meta.json      # 章节元信息
├── src/
│   ├── components/
│   │   ├── Question.jsx   # 单题组件（题干+选项+解析）
│   │   └── MathText.jsx   # Markdown + LaTeX 渲染
│   ├── pages/
│   │   ├── Home.jsx       # 首页：章节入口 + 成绩展示
│   │   └── Quiz.jsx       # 答题页：答题、提交、计分
│   ├── App.jsx            # 路由与布局
│   ├── main.jsx           # 入口，挂载到 DOM
│   └── styles.css         # 全局样式
├── package.json
└── README.md
```

---

## 本地运行

确保已安装 **Node.js ≥ 18** 和 **npm ≥ 9**。

```bash
# 克隆项目
git clone https://github.com/goatpretty/quiz-site.git
cd quiz-site

# 安装依赖
npm install

# 启动开发环境
npm run dev

# 构建生产版本
npm run build
```

然后访问命令行提示的地址，例如：

> [http://localhost:5173/](https://test.goatpretty.com/)

---

## 题库编写规范

题库位于 `public/questions/chX.json`，每个文件格式如下：

```json
[
    {
        "id": "4",
        "type": "single",
        "stem": "1921年7月，中国共产党第一次全国代表大会在上海法租界望志路106号开幕。党的一大宣告中国共产党正式成立。中国共产党的创建，是中华民族发展史上开天辟地的大事变，具有伟大而深远的意义。\n\n请简述：中国共产党成立的历史意义。",
        "answer": "",
        "explain": ""
    },
    {
        "id": "15",
        "type": "multiple",
        "stem": "下列人物中参加过中共一大的有()",
        "options": [
            "张国焘",
            "陈公博",
            "李达",
            "陈独秀"
        ],
        "answerIndices": [0, 1, 2],
        "explain": ""
    },
    {
        "id": 1,
        "type": "fill",
        "question": "计算定积分：$$\\int_0^1 x^2\\,dx=?$$",
        "choices": [
            "$$\\dfrac{1}{2}$$",
            "$$\\dfrac{1}{3}$$",
            "$$\\dfrac{1}{4}$$"
        ],
        "answerIndex": 1,
        "explanation": "由 $\\int_0^1 x^n\\,dx=\\dfrac{1}{n+1}$ 得结果为 $\\frac{1}{3}$。"
    }
]
```



>  注意事项：
>
> * JSON 不允许单反斜杠，LaTeX 中的 `\` 需写成 `\\`。
> * `answerIndex` 从 `0` 开始（第一个选项为 0）。
> * 支持 `$a^2+b^2=c^2$`（行内）和 `$$\int_0^1 x^2dx$$`（块级）。

---

## 部署方式

构建完成后，会生成 `dist/` 文件夹。
你可以将其中内容直接上传到任意静态托管平台，例如：

* [Vercel](https://vercel.com/)
* [Cloudflare Pages](https://pages.cloudflare.com/)
* [GitHub Pages](https://pages.github.com/)
* 或学校 / 本地服务器（Nginx / Apache 静态目录）

```bash
npm run build
```

部署 `dist/` 目录即可访问。

---

## 示例效果

| 页面   | 功能预览              |
| ---- | ----------------- |
| 首页   | 章节列表 + 搜索 + 成绩统计  |
| 答题页  | 支持公式渲染、计分、解析、题号导航 |
| 深色模式 | 自动切换界面主题          |
| 移动端  | 自适应布局，单列答题体验      |

---

