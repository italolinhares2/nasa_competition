@echo off
setlocal
title Around the World in 80 Days - Space Mission

rem ============================================================
rem  Verifica se o Node.js existe; se nao existir, instala.
rem  Depois instala as dependencias (se preciso) e abre o site.
rem ============================================================

rem Trabalha sempre na pasta onde este script esta.
cd /d "%~dp0"

echo.
echo [1/3] Verificando o Node.js...
where node >nul 2>nul
if not errorlevel 1 goto node_ok

echo       Node.js nao encontrado. Instalando a versao LTS...
where winget >nul 2>nul
if errorlevel 1 goto no_winget

winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto install_failed

rem O PATH desta janela nao e atualizado pelo instalador: adiciona a pasta padrao.
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
where node >nul 2>nul
if errorlevel 1 goto reopen_needed

:node_ok
for /f "delims=" %%v in ('node -v') do echo       Node.js %%v encontrado.

echo.
echo [2/3] Verificando as dependencias do projeto...
if exist "node_modules\.bin\vite.cmd" goto deps_ok
echo       Instalando dependencias (pode levar alguns minutos)...
call npm install
if errorlevel 1 goto npm_failed

:deps_ok
echo       Dependencias prontas.

echo.
echo [3/3] Iniciando o site. O navegador abrira sozinho.
echo       Para encerrar, pressione Ctrl+C nesta janela.
echo.
call npm run dev -- --open
goto end

:no_winget
echo.
echo ERRO: o instalador "winget" nao esta disponivel neste Windows.
echo Instale o Node.js LTS manualmente em https://nodejs.org e rode este script de novo.
goto fail

:install_failed
echo.
echo ERRO: a instalacao do Node.js falhou.
echo Instale manualmente em https://nodejs.org e rode este script de novo.
goto fail

:reopen_needed
echo.
echo O Node.js foi instalado, mas esta janela ainda nao o enxerga.
echo Feche esta janela e rode o script novamente.
goto fail

:npm_failed
echo.
echo ERRO: nao foi possivel instalar as dependencias (npm install).
echo Verifique sua conexao com a internet e tente de novo.
goto fail

:fail
echo.
pause
endlocal
exit /b 1

:end
endlocal
