@echo off
setlocal ENABLEDELAYEDEXPANSION

:: ====== 自定义仓库地址（已按你的要求固定）======
set "REMOTE_HTTPS=https://github.com/goatpretty/quiz-site.git"
set "REMOTE_SSH=git@github.com:goatpretty/quiz-site.git"

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
for /f "delims=" %%i in ('git symbolic-ref --short HEAD 2^>nul') do set "BRANCH=%%i"
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

:: === 6) 检查/设置远程 origin（默认使用 HTTPS） ===
call :get_origin
if not defined ORIGIN_URL (
  echo [INFO] 未检测到远程 origin，设置为 HTTPS：%REMOTE_HTTPS%
  git remote add origin "%REMOTE_HTTPS%" || (
    echo [ERROR] 添加远程地址失败。
    pause
    exit /b 1
  )
) else (
  echo [INFO] 当前 origin：!ORIGIN_URL!
)

:: 若当前 origin 既不是 HTTPS 也不是 SSH，则统一先切到 HTTPS
call :get_origin
if /i not "!ORIGIN_URL!"=="%REMOTE_HTTPS%" if /i not "!ORIGIN_URL!"=="%REMOTE_SSH%" (
  echo [INFO] 将 origin 规范化为 HTTPS：%REMOTE_HTTPS%
  git remote set-url origin "%REMOTE_HTTPS%" || (
    echo [ERROR] 设置远程地址失败。
    pause
    exit /b 1
  )
)

:: === 7) 推送：若失败且为 HTTPS，则自动切换到 SSH 并重试 ===
call :push_with_fallback "%BRANCH%"
if errorlevel 1 (
  echo [ERROR] 推送失败（HTTPS/SSH 均未成功）。请检查网络、权限或仓库访问权。
  pause
  exit /b 1
)

echo [DONE] 已完成推送到分支：%BRANCH%
endlocal
pause
exit /b 0

:: ================= 子程序区域 =================

:push_with_fallback
setlocal ENABLEDELAYEDEXPANSION
set "TARGET_BRANCH=%~1"

:: 判断是否已设置上游
git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>&1
if errorlevel 1 (
  set "NEED_UPSTREAM=1"
) else (
  set "NEED_UPSTREAM=0"
)

call :get_origin

echo [INFO] 使用远程：!ORIGIN_URL!
if "!NEED_UPSTREAM!"=="1" (
  echo [INFO] 首次推送，设置上游：origin/%TARGET_BRANCH%
  git push -u origin "%TARGET_BRANCH%"
) else (
  echo [INFO] 正在推送到远程...
  git push
)

if errorlevel 1 (
  echo [WARN] 推送失败。
  :: 如果当前是 HTTPS，自动切换到 SSH 并重试一次
  if /i "!ORIGIN_URL!"=="%REMOTE_HTTPS%" (
    echo [INFO] 正在将 origin 切换为 SSH：%REMOTE_SSH%
    git remote set-url origin "%REMOTE_SSH%" || (
      echo [ERROR] 切换到 SSH 失败。
      endlocal & exit /b 1
    )
    call :get_origin
    echo [INFO] 重试推送到：!ORIGIN_URL!

    :: 重试时再次判断是否需设置上游（避免第一次失败导致未建立上游）
    git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>&1
    if errorlevel 1 (
      git push -u origin "%TARGET_BRANCH%"
    ) else (
      git push
    )

    if errorlevel 1 (
      echo [ERROR] SSH 推送仍失败（可能是 SSH Key 未配置或无仓库权限）。
      endlocal & exit /b 1
    )
  ) else (
    echo [ERROR] 非 HTTPS 远程下推送失败（当前已是 SSH）。请检查 SSH Key 或仓库权限。
    endlocal & exit /b 1
  )
)

endlocal & exit /b 0

:get_origin
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set "ORIGIN_URL=%%i"
exit /b 0
