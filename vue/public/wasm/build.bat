@echo off
REM 设置 TINYGOROOT
for /f "tokens=*" %%i in ('tinygo env TINYGOROOT') do set TINYGOROOT=%%i

REM 复制 wasm_exec.js
copy "%TINYGOROOT%\targets\wasm_exec.js" .

REM 设置环境变量并构建 WASM 文件
set GO111MODULE=auto
set GOOS=js
set GOARCH=wasm
tinygo build -o main.wasm -target wasm main.go

echo Build completed.
