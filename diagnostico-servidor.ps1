# Script de diagnostico del servidor
Write-Host "=== DIAGNOSTICO DEL SERVIDOR ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar PM2
Write-Host "[1/6] Verificando PM2..." -ForegroundColor Yellow
pm2 list
Write-Host ""

# 2. Verificar logs de PM2
Write-Host "[2/6] Verificando logs de PM2 (ultimas 20 lineas)..." -ForegroundColor Yellow
pm2 logs --lines 20 --nostream
Write-Host ""

# 3. Verificar Redis
Write-Host "[3/6] Verificando Redis..." -ForegroundColor Yellow
redis-cli ping
Write-Host ""

# 4. Verificar si el puerto 3000 esta en uso
Write-Host "[4/6] Verificando puerto 3000..." -ForegroundColor Yellow
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "OK: Puerto 3000 esta en uso" -ForegroundColor Green
    Write-Host "   Estado: $($port.State)" -ForegroundColor Gray
    Write-Host "   Proceso: $($port.OwningProcess)" -ForegroundColor Gray
} else {
    Write-Host "ERROR: Puerto 3000 NO esta en uso" -ForegroundColor Red
}
Write-Host ""

# 5. Probar conexion local
Write-Host "[5/6] Probando conexion local (localhost:3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "OK: Conexion local exitosa" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Conexion local fallo" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. Probar conexion externa (VM)
Write-Host "[6/6] Probando conexion externa..." -ForegroundColor Yellow
$vmUrl = "http://163.192.223.30:3000/api/health"
try {
    $response = Invoke-WebRequest -Uri $vmUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "OK: Conexion externa exitosa" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Conexion externa fallo" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Nota: Esto es normal si estas probando desde fuera de la VM" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== FIN DEL DIAGNOSTICO ===" -ForegroundColor Cyan
