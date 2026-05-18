// ===========================================================================
// 🌍 GUIA DE CONFIGURAÇÃO: APIs Externas (Clima + Imagens)
// ===========================================================================
//
// Este ficheiro explica como configurar as chaves de API para as
// integrações de OpenWeatherMap e Unsplash no "Sistema de Planeamento de Viagens"
//
// ===========================================================================
// 📋 RESUMO RÁPIDO
// ===========================================================================
//
// 1. Weather Service (OpenWeatherMap)
//    - Ficheiro: src/app/services/weather-external.service.ts
//    - Status: FUNCIONA COM DADOS SIMULADOS (sem chave)
//    - Para usar API real: registar em https://openweathermap.org
//    - Free tier: 1000 chamadas/dia
//
// 2. Unsplash Service
//    - Ficheiro: src/app/services/unsplash.service.ts
//    - Status: FUNCIONA COM ENDPOINT PÚBLICO (sem autenticação obrigatória)
//    - Para produção: registar em https://unsplash.com/oauth/applications
//    - Free tier: 50 chamadas/hora (sem auth), ilimitado (com auth)
//
// ===========================================================================
// 🔑 PASSO 1: CONFIGURAR OpenWeatherMap (OPCIONAL)
// ===========================================================================
//
// Se QUISER dados reais de clima em tempo real:
//
// A) Ir para: https://openweathermap.org/api
// B) Criar conta (gratuita)
// C) Na secção "API keys", copiar a chave padrão
// D) Abrir: frontend/src/app/services/weather-external.service.ts
// E) Encontrar a linha:
//    ```
//    private readonly apiKey = 'DEMO_KEY';
//    ```
// F) Substituir por:
//    ```
//    private readonly apiKey = 'YOUR_API_KEY_HERE';
//    ```
//    (substituir YOUR_API_KEY_HERE pela chave copiada)
//
// G) Salvar e recarregar a página
//
// ❌ SE NÃO CONFIGURAR:
//    O serviço retorna dados FAKE mas realistas (faz fallback automático)
//    PERFEITO para testes e desenvolvimento!
//
// ===========================================================================
// 🔑 PASSO 2: CONFIGURAR Unsplash (RECOMENDADO para Produção)
// ===========================================================================
//
// Status ATUAL:
// - Usa endpoint público de Unsplash: https://source.unsplash.com
// - Gera URLs automáticas baseadas no nome da cidade
// - Funciona sem autenticação (50 req/hora limit)
// - SUFICIENTE para prototipagem e MVPs
//
// Se QUISER versão com Rate Limit sem limite:
//
// A) Ir para: https://unsplash.com
// B) Fazer login (ou criar conta)
// C) Ir para: https://unsplash.com/oauth/applications
// D) Clicar "New Application"
// E) Responder às perguntas sobre uso
// F) Aceitar termos e copiar "Access Key"
// G) Abrir: frontend/src/app/services/unsplash.service.ts
// H) Encontrar a linha:
//    ```
//    private readonly accessKey = '';
//    ```
// I) Substituir por:
//    ```
//    private readonly accessKey = 'YOUR_ACCESS_KEY_HERE';
//    ```
//    (substituir YOUR_ACCESS_KEY_HERE pela chave copiada)
//
// J) Salvar e recarregar a página
//
// ℹ️  NOTA: O serviço detecta automaticamente se tem chave e muda o behavior
//
// ===========================================================================
// 🚀 COMO USAR NO COMPONENTE
// ===========================================================================
//
// O trip-detail.component.ts já tem tudo configurado:
//
// 1. Quando uma viagem carrega, o componente chama:
//    - weatherService.getWeatherByCity(trip.city, trip.country)
//    - unsplashService.searchDestinationImage(trip.city, trip.country)
//
// 2. Os dados são armazenados em:
//    - weather: WeatherWidget | null
//    - destinationImage: DestinationImage | null
//
// 3. O template renderiza no componente (HTML já incluso):
//    - Widget com temperatura, ícone, humidade
//    - Imagem do destino com crédito do fotógrafo
//
// ===========================================================================
// 🔒 BOAS PRÁTICAS DE SEGURANÇA
// ===========================================================================
//
// ⚠️  NUNCA commitar chaves reais no GitHub!
//
// Soluções:
//
// OPÇÃO A (Recomendado): Environment variables
// ─────────────────────────────────────────
// 1. Criar ficheiro: frontend/.env.local (não commitar)
// 2. Adicionar:
//    WEATHER_API_KEY=your_key_here
//    UNSPLASH_ACCESS_KEY=your_key_here
// 3. No serviço, ler de:
//    private readonly apiKey = environment.weatherApiKey;
//
// OPÇÃO B: Backend proxy (mais seguro)
// ─────────────────────────────────────
// 1. Criar endpoints PHP que chamam as APIs
// 2. Frontend chama backend (sem chaves expostas)
// 3. Backend chama APIs externas com chaves secretas
//
// OPÇÃO C: Usar chaves públicas apenas
// ──────────────────────────────────────
// 1. OpenWeatherMap: tem endpoints públicos sem autenticação?
// 2. Unsplash: endpoint público já está implementado
// 3. Implementar rate limiting no backend se necessário
//
// ===========================================================================
// 📞 TROUBLESHOOTING
// ===========================================================================
//
// ❌ "ERRO: CORS blocked"
// └─ Causa: Domínio frontend não autorizado na API
// └─ Solução: Usar backend como proxy OU registar domínio na API
//
// ❌ "Weather mostra 'Demo'/ Imagem não carrega"
// └─ Causa: Chave não configurada ou inválida
// └─ Solução: Verificar se a chave está corretamente inserida
//
// ❌ "Rate limit atingido (50 req/hora Unsplash)"
// └─ Causa: Muitas pesquisas de cidades
// └─ Solução: Usar chave de acesso OU cachear imagens
//
// ❌ "API retorna null"
// └─ Causa: Cidade não encontrada
// └─ Solução: Fallback automático retorna dados mockados ✓
//
// ===========================================================================
// 📊 COMPARAÇÃO DE CONFIGURAÇÕES
// ===========================================================================
//
// |                | Desenvolvimento | Produção (Recomendado) |
// |----------------|-----------------|------------------------|
// | Weather        | DEMO_KEY ✓      | Chave real + backend   |
// | Unsplash       | Endpoint public | Access Key + backend   |
// | Rate Limit     | Baixo           | Protegido              |
// | Exposição      | Nenhuma         | Nenhuma (chaves no PHP)|
// | Performance    | Mock (rápido)   | Real (mais lento)      |
//
// ===========================================================================
// 🎯 PRÓXIMOS PASSOS
// ===========================================================================
//
// 1. ✓ Testar com dados mockados (já funciona)
// 2. [TODO] Registar em OpenWeatherMap e Unsplash
// 3. [TODO] Adicionar chaves aos serviços
// 4. [TODO] Implementar caching de imagens
// 5. [TODO] Mover chaves para backend (produção)
// 6. [TODO] Implementar fallback de API por localização
//
// ===========================================================================
