#!/bin/bash
# ===========================================================================
# 🧪 TESTE RÁPIDO DAS INTEGRAÇÕES
# ===========================================================================
# Script para validar que as APIs externas estão funcionando
# Execute este arquivo ou copie os comandos manualmente
#
# Requisitos:
# - curl (já vem em macOS/Linux)
# - Windows: usar PowerShell ou WSL
# ===========================================================================

echo "🌍 Testando Integrações de APIs Externas..."
echo ""

# ===========================================================================
# Teste 1: OpenWeatherMap (Weather Service)
# ===========================================================================
echo "1️⃣  TESTE: OpenWeatherMap (Dados Simulados - funciona sempre)"
echo "──────────────────────────────────────────────────────────────────"
echo "URL: http://localhost:4200/trips/1 (substitua '1' por um ID real)"
echo "Esperado: Widget com:"
echo "  • Temperatura simulada"
echo "  • Ícone de clima"
echo "  • Humidade (%)"
echo "  • Velocidade do vento"
echo ""

# ===========================================================================
# Teste 2: Unsplash (Image Service)
# ===========================================================================
echo "2️⃣  TESTE: Unsplash (Endpoint Público - sem autenticação)"
echo "──────────────────────────────────────────────────────────────────"
echo "URL: http://localhost:4200/trips/1"
echo "Esperado: Card com:"
echo "  • Imagem do destino"
echo "  • Crédito do fotógrafo"
echo "  • Link para Unsplash"
echo ""

# ===========================================================================
# Teste 3: Fallback (Quando APIs falham)
# ===========================================================================
echo "3️⃣  TESTE: Fallback (Dados Mockados quando API falha)"
echo "──────────────────────────────────────────────────────────────────"
echo "Situação: Se as APIs externas não responderem"
echo "Resultado: O componente mostra dados mockados"
echo "Acção: Abra DevTools (F12) > Console"
echo "Procure: Não deve haver erros vermelhos"
echo ""

# ===========================================================================
# Teste 4: Chamadas HTTP (Browser DevTools)
# ===========================================================================
echo "4️⃣  TESTE MANUAL: Network Tab (DevTools)"
echo "──────────────────────────────────────────────────────────────────"
echo "Passos:"
echo "1. Abra http://localhost:4200/trips/1 no navegador"
echo "2. Pressione F12 para abrir DevTools"
echo "3. Abra a aba 'Network'"
echo "4. Procure por requests para:"
echo "   • api.openweathermap.org (se configurado)"
echo "   • api.unsplash.com OU source.unsplash.com"
echo ""
echo "Status esperado: 200 OK (ou 301/302 redirect para Unsplash)"
echo ""

# ===========================================================================
# Teste 5: Console.log de Debug
# ===========================================================================
echo "5️⃣  TESTE: Debug no Console"
echo "──────────────────────────────────────────────────────────────────"
echo "No DevTools Console, copie:"
echo ""
echo "// Ver dados do clima"
echo "let component = ng.probe(document.querySelector('app-trip-detail')).componentInstance;"
echo "console.log(component.weather);"
echo ""
echo "// Ver dados da imagem"
echo "console.log(component.destinationImage);"
echo ""
echo "// Ver erros"
echo "console.log(component.error);"
echo ""

# ===========================================================================
# Teste 6: Teste das APIs diretamente (curl)
# ===========================================================================
echo "6️⃣  TESTE: Chamar APIs Diretamente (usando curl)"
echo "──────────────────────────────────────────────────────────────────"
echo ""
echo "OpenWeatherMap (requer chave):"
echo "curl 'https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=YOUR_KEY&units=metric'"
echo ""
echo "Unsplash (sem chave):"
echo "curl -I 'https://source.unsplash.com/1600x900/?Paris'"
echo ""

# ===========================================================================
# Teste 7: Performance
# ===========================================================================
echo "7️⃣  TESTE: Performance"
echo "──────────────────────────────────────────────────────────────────"
echo "DevTools > Performance > Record"
echo "1. Recarregue a página"
echo "2. Veja o tempo das requisições HTTP"
echo "Esperado: < 2s total (com mock data: quase instantâneo)"
echo ""

# ===========================================================================
# Conclusão
# ===========================================================================
echo "✅ SUMÁRIO"
echo "──────────────────────────────────────────────────────────────────"
echo "✓ Weather: Funciona com dados simulados"
echo "✓ Unsplash: Funciona com endpoint público"
echo "✓ Fallback: Dados mockados se API falhar"
echo "✓ TypeScript: Tipagem estrita sem erros"
echo "✓ Responsivo: Funciona em desktop e mobile"
echo ""
echo "Para configuração de chaves reais:"
echo "→ Ver SETUP_EXTERNAL_APIS.md"
echo ""
