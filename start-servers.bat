@echo off
echo 启动诗词鉴赏系统...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 请先安装Node.js
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 安装依赖包...
    npm install
)

echo 启动后端服务器...
start "后端服务器" cmd /k "cd /d %~dp0 && node server/server.js"

timeout /t 3 /nobreak >nul

echo 启动前端开发服务器...
start "前端服务器" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo 系统启动完成！
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3000
echo.
echo 请确保MySQL数据库已启动，并运行server/init.sql初始化数据库
pause