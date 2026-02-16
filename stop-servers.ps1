# Stop servers script for HomeTown Hub

Write-Host "Stopping servers on ports 3000 and 5000..." -ForegroundColor Yellow

# Find and kill process on port 5000 (Backend)
$port5000 = netstat -ano | findstr ":5000" | findstr "LISTENING"
if ($port5000) {
    $pid = ($port5000 -split '\s+')[-1]
    Write-Host "Stopping backend server (PID: $pid)..." -ForegroundColor Cyan
    taskkill /PID $pid /F 2>$null
    Write-Host "Backend server stopped." -ForegroundColor Green
} else {
    Write-Host "No process found on port 5000." -ForegroundColor Gray
}

# Find and kill process on port 3000 (Frontend)
$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
if ($port3000) {
    $pid = ($port3000 -split '\s+')[-1]
    Write-Host "Stopping frontend server (PID: $pid)..." -ForegroundColor Cyan
    taskkill /PID $pid /F 2>$null
    Write-Host "Frontend server stopped." -ForegroundColor Green
} else {
    Write-Host "No process found on port 3000." -ForegroundColor Gray
}

Write-Host "`nDone!" -ForegroundColor Green






