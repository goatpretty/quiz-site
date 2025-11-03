@echo off
setlocal ENABLEDELAYEDEXPANSION

:: === 0) 基础检查：Git 是否可用 ===
git --version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] 未检测到 Git，请先安装 Git 并加入 PATH。
  pause
  exit /b 1
)

:: === 1) 是否在 Git 仓库内，不是则初始化 ===
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [INFO] 当前目录不是 Git 仓库，正在初始化...
  git init || (
    echo [ERROR] git init 失败。
    pause
    exit /b 1
  )
)

:: === 2) 获取当前分支；没有则新建 main 分支 ===
for /f "delims=" %%i in ('git symbolic-ref --short HEAD 2^>nul') do set BRANCH=%%i
if not defined BRANCH (
  set "BRANCH=main"
  echo [INFO] 当前无分支，创建并切换到 "%BRANCH%" ...
  git checkout -B "%BRANCH%" || (
    echo [ERROR] 创建/切换分支失败。
    pause
    exit /b 1
  )
)

:: === 3) 全量添加变更 ===
echo [INFO] 正在暂存所有变更...
git add -A

:: === 4) 读取提交信息，留空则默认 "auto update" ===
set "MSG="
set /p MSG=请输入本次更新说明（留空则使用 "auto update"）： 
if not defined MSG set "MSG=auto update"

:: === 5) 若有已暂存变更则提交 ===
git diff --cached --quiet
if errorlevel 1 (
  echo [INFO] 正在提交：%MSG%
  git commit -m "%MSG%" || (
    echo [ERROR] 提交失败。
    pause
    exit /b 1
  )
) else (
  echo [INFO] 无需提交：没有已暂存的变更。
)

:: === 6) 检查/设置远程 origin ===
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo [INFO] 未检测到遠程 origin。
  set "REMOTE="
  set /p REMOTE=请输入遠程倉庫地址（如 git@github.com:USER/REPO.git 或 https://github.com/USER/REPO.git）： 
  if not defined REMOTE (
    echo [ERROR] 未提供遠程地址，无法推送。
    pause
    exit /b 1
  )
  git remote add origin "%REMOTE%" || (
    echo [ERROR] 添加遠程地址失败。
    pause
    exit /b 1
  )
)

:: === 7) 推送（若未跟踪上游则设置 -u） ===
git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>&1
if errorlevel 1 (
  echo [INFO] 首次推送，设置上游：origin/%BRANCH%
  git push -u origin "%BRANCH%" || (
    echo [ERROR] 推送失败，请检查网络或权限（SSH Key/Token）。
    pause
    exit /b 1
  )
) else (
  echo [INFO] 正在推送到远程...
  git push || (
    echo [ERROR] 推送失败，请检查网络或权限（SSH Key/Token）。
    pause
    exit /b 1
  )
)

echo [DONE] 已完成推送到分支：%BRANCH%
endlocal
pause
