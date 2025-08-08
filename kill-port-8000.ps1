# Kill any processes running on port 8000
Write-Host "🔍 Checking for processes on port 8000..." -ForegroundColor Yellow

# Find processes using port 8000
$processes = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($processes) {
    Write-Host "Found processes using port 8000:" -ForegroundColor Red
    foreach ($process in $processes) {
        $proc = Get-Process -Id $process.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  - Process: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Red
            Write-Host "    Killing process..." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
            Write-Host "    ✅ Process killed" -ForegroundColor Green
        }
    }
    
    # Wait a moment for processes to fully terminate
    Start-Sleep -Seconds 2
    
    # Check again
    $stillRunning = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($stillRunning) {
        Write-Host "⚠️  Some processes may still be running. Please restart your computer if issues persist." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Port 8000 is now free!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Port 8000 is already free!" -ForegroundColor Green
}

Write-Host "`n🚀 You can now start your server!" -ForegroundColor Cyan