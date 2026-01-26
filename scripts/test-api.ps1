#!/usr/bin/env pwsh
# Script PowerShell para testar a API localmente

$API_URL = "http://localhost:3000"

Write-Host "🧪 Testando API do Sistema PDV" -ForegroundColor Cyan
Write-Host "📍 URL: $API_URL`n" -ForegroundColor Cyan

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null
    )
    
    try {
        $url = "$API_URL$Path"
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $url -Method $Method -Body $jsonBody -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method
        }
        
        Write-Host "✅ $Method $Path" -ForegroundColor Green
        Write-Host "   Resposta: $($response | ConvertTo-Json -Compress -Depth 3 | Select-Object -First 100)" -ForegroundColor Gray
        Write-Host ""
        
        return @{ Success = $true; Data = $response }
    }
    catch {
        Write-Host "❌ $Method $Path" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)`n" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

Write-Host "=== TESTE DE ENDPOINTS ===" -ForegroundColor Yellow
Write-Host ""

# Health check
Test-Endpoint -Method GET -Path "/health"

# Info
Test-Endpoint -Method GET -Path "/"

# Produtos
Write-Host "--- PRODUTOS ---" -ForegroundColor Yellow
Test-Endpoint -Method GET -Path "/api/produtos"
Test-Endpoint -Method GET -Path "/api/produtos/1"
Test-Endpoint -Method GET -Path "/api/produtos/codigo/7894900011517"

$novoProduto = Test-Endpoint -Method POST -Path "/api/produtos" -Body @{
    nome = "Produto Teste PowerShell"
    descricao = "Descrição teste"
    preco = 10.50
    codigo_barras = "9999999999999"
    estoque = 100
    categoria = "Teste"
}

if ($novoProduto.Success) {
    $produtoId = $novoProduto.Data.id
    Test-Endpoint -Method PUT -Path "/api/produtos/$produtoId" -Body @{
        nome = "Produto Atualizado"
        preco = 15.00
    }
    
    Test-Endpoint -Method PATCH -Path "/api/produtos/$produtoId/estoque" -Body @{
        quantidade = 50
    }
}

# Clientes
Write-Host "--- CLIENTES ---" -ForegroundColor Yellow
Test-Endpoint -Method GET -Path "/api/clientes"

$novoCliente = Test-Endpoint -Method POST -Path "/api/clientes" -Body @{
    nome = "Cliente Teste PowerShell"
    cpf = "98765432100"
    telefone = "11888888888"
    email = "teste@powershell.com"
}

if ($novoCliente.Success) {
    $clienteId = $novoCliente.Data.id
    Test-Endpoint -Method PUT -Path "/api/clientes/$clienteId" -Body @{
        nome = "Cliente Atualizado"
    }
}

# Vendas
Write-Host "--- VENDAS ---" -ForegroundColor Yellow
Test-Endpoint -Method GET -Path "/api/vendas"

Test-Endpoint -Method POST -Path "/api/vendas" -Body @{
    cliente_id = $null
    total = 17.98
    desconto = 0
    metodo_pagamento = "Dinheiro"
    itens = @(
        @{
            produto_id = 1
            quantidade = 2
            preco_unitario = 8.99
            subtotal = 17.98
        }
    )
}

Test-Endpoint -Method GET -Path "/api/vendas/relatorio?data_inicio=2026-01-01&data_fim=2026-12-31"

Write-Host "✅ Testes concluídos!" -ForegroundColor Green
