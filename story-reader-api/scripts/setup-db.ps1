# =============================================================
#  setup-db.ps1  -  Tao PostgreSQL database cho story-reader
# =============================================================
#  Cach dung:
#    .\scripts\setup-db.ps1
#    .\scripts\setup-db.ps1 -DbHost localhost -DbPort 5432 -DbUser postgres -DbPassword postgres
# =============================================================

param(
    [string]$DbHost     = "localhost",
    [string]$DbPort     = "5432",
    [string]$DbUser     = "postgres",
    [string]$DbPassword = "postgres",
    [string]$DbName     = "story_reader_db"
)

# Doc .env neu co
$envFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*DATABASE_URL\s*=\s*"?postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?"]+)') {
            $DbUser     = $Matches[1]
            $DbPassword = $Matches[2]
            $DbHost     = $Matches[3]
            $DbPort     = $Matches[4]
            $DbName     = $Matches[5]
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Story Reader - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Host     : $DbHost`:$DbPort"
Write-Host "  Database : $DbName"
Write-Host "  User     : $DbUser"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tim psql
$psqlExe = $null
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlCmd) {
    $psqlExe = $psqlCmd.Source
} else {
    $candidates = @(
        "C:\Program Files\PostgreSQL\18\bin\psql.exe",
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files\PostgreSQL\13\bin\psql.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { $psqlExe = $c; break }
    }
}

if (-not $psqlExe) {
    Write-Host "[FAIL] Khong tim thay psql. Hay cai PostgreSQL hoac them bin vao PATH." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] psql: $psqlExe" -ForegroundColor Green

# Set password env
$env:PGPASSWORD = $DbPassword

# Kiem tra ket noi
Write-Host ""
Write-Host "[...] Kiem tra ket noi PostgreSQL..." -ForegroundColor Yellow
& $psqlExe -h $DbHost -p $DbPort -U $DbUser -d postgres -c "SELECT 1;" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Khong ket noi duoc PostgreSQL." -ForegroundColor Red
    Write-Host "       Kiem tra: PostgreSQL dang chay + thong tin .env chinh xac" -ForegroundColor Yellow
    $env:PGPASSWORD = ""
    exit 1
}
Write-Host "[OK] Ket noi thanh cong!" -ForegroundColor Green

# Kiem tra DB ton tai
Write-Host ""
Write-Host "[...] Kiem tra database '$DbName'..." -ForegroundColor Yellow
$exists = & $psqlExe -h $DbHost -p $DbPort -U $DbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName';" 2>&1
if ($exists -match "1") {
    Write-Host "[OK] Database '$DbName' da ton tai, bo qua tao moi." -ForegroundColor Cyan
} else {
    Write-Host "[...] Dang tao database '$DbName'..." -ForegroundColor Yellow
    & $psqlExe -h $DbHost -p $DbPort -U $DbUser -d postgres -c "CREATE DATABASE $DbName ENCODING 'UTF8';" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] Tao database that bai." -ForegroundColor Red
        $env:PGPASSWORD = ""
        exit 1
    }
    Write-Host "[OK] Da tao database '$DbName'!" -ForegroundColor Green
}

# Chuyen ve thu muc goc
Set-Location (Join-Path $PSScriptRoot "..")

# Chay Prisma migrate
Write-Host ""
Write-Host "[...] Chay Prisma migrate..." -ForegroundColor Yellow
$migrateOut = npx prisma migrate dev --name init 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "     (Thu prisma migrate deploy...)" -ForegroundColor Gray
    $migrateOut = npx prisma migrate deploy 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] Prisma migrate that bai:" -ForegroundColor Red
        Write-Host $migrateOut
        $env:PGPASSWORD = ""
        exit 1
    }
}
Write-Host "[OK] Prisma migrate hoan tat!" -ForegroundColor Green

# Generate Prisma Client
Write-Host ""
Write-Host "[...] Generate Prisma Client..." -ForegroundColor Yellow
npx prisma generate 2>&1 | Out-Null
Write-Host "[OK] Prisma Client da duoc generate!" -ForegroundColor Green

# Xoa password
$env:PGPASSWORD = ""

# Hoan thanh
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  [DONE] Setup hoan tat!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Chay server:" -ForegroundColor Cyan
Write-Host "    npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "  Swagger docs:" -ForegroundColor Cyan
Write-Host "    http://localhost:3000/api/docs" -ForegroundColor White
Write-Host ""
