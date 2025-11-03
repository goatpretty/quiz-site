// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 如果你文件名是 vite.config.ts，写法一样
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // 等价于 0.0.0.0，允许 LAN 访问
    port: 5173,        // 你也可以改成别的端口
    strictPort: true,  // 端口被占用就报错，避免换端口导致你找不到
    // HMR 在某些局域网环境需要显式指定
    hmr: {
      // 不填 host 时，Vite 会自动用当前机器的局域网 IP
      // 如果你的 HMR 仍然连不上，可手动写死：
      // host: '你的本机局域网IP',  // 例如 192.168.1.12
      port: 5173,
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
})
