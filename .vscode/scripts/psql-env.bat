@echo off
cd /d "%~dp0..\.."

for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
  if not "%%A"=="" set "%%A=%%B"
)

psql "%DATABASE_URL%"