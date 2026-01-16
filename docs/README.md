# Documentação ADS Connect

Documentação completa do sistema ADS Connect - Plataforma de Monetização via Anúncios.

---

## 📚 **Índice**

### **🚀 Início Rápido**
1. [Configuração de Ambiente](./env_setup_guide.md) - Setup de variáveis de ambiente
2. [Prompt para Orquestrador](./orchestrator_prompt.md) - Guia para implementação com ChatGPT

### **🏗️ Arquitetura**
3. [Arquitetura de Analytics](./analytics_architecture.md) - Sistema completo de analytics
4. [Walkthrough de Analytics](./analytics_complete_walkthrough.md) - Implementação das 3 fases

### **💻 Integração Frontend**
5. [Guia de Integração Frontend](./frontend_integration_complete.md) - SDK e integração completa
6. [Guia de Tracking](./FRONTEND_TRACKING_GUIDE.md) - Tracking de impressões e cliques

### **⚙️ Administração**
7. [Guia de Sites Parceiros](./admin_sites_guide.md) - Gestão de sites no Admin Console

### **🚢 Deploy**
8. [Walkthrough de Deploy](./final_deployment_walkthrough.md) - Deploy completo no Supabase
9. [Fix 404 Vercel](./vercel_404_fix.md) - Resolver erro 404 em rotas SPA

---

## 🎯 **Fluxo de Implementação**

### **Para Desenvolvedores:**

1. **Setup Inicial**
   - Ler: [env_setup_guide.md](./env_setup_guide.md)
   - Configurar variáveis de ambiente
   - Instalar dependências

2. **Entender Arquitetura**
   - Ler: [analytics_architecture.md](./analytics_architecture.md)
   - Entender fluxo de dados
   - Revisar tabelas e triggers

3. **Implementar Frontend**
   - Ler: [frontend_integration_complete.md](./frontend_integration_complete.md)
   - Integrar SDK JavaScript
   - Configurar tracking

4. **Deploy**
   - Ler: [final_deployment_walkthrough.md](./final_deployment_walkthrough.md)
   - Aplicar migrations
   - Deployar Edge Functions

### **Para Orquestradores (ChatGPT):**

1. **Ler Prompt**
   - [orchestrator_prompt.md](./orchestrator_prompt.md)

2. **Seguir Instruções**
   - Criar site parceiro
   - Gerar API keys
   - Implementar tracking

---

## 📁 **Estrutura de Arquivos**

```
docs/
├── README.md                           # Este arquivo
├── env_setup_guide.md                  # Setup de ambiente
├── orchestrator_prompt.md              # Prompt para ChatGPT
├── analytics_architecture.md           # Arquitetura de analytics
├── analytics_complete_walkthrough.md   # Implementação completa
├── frontend_integration_complete.md    # Integração frontend
├── FRONTEND_TRACKING_GUIDE.md          # Guia de tracking
├── admin_sites_guide.md                # Admin de sites
├── final_deployment_walkthrough.md     # Deploy completo
└── vercel_404_fix.md                   # Fix de rotas SPA
```

---

## 🔑 **Conceitos Principais**

### **Edge Functions**
- `track-impression` - Rastreia impressões viewable
- `track-click` - Rastreia cliques com anti-fraude
- `analytics-api` - API de métricas
- `serve-ad-optimized` - Serve anúncios otimizados

### **Tabelas Principais**
- `partner_sites` - Sites parceiros
- `ads` - Anúncios
- `ad_slots` - Slots de anúncios
- `impressions` - Impressões rastreadas
- `clicks` - Cliques rastreados
- `metrics_hourly` - Métricas agregadas por hora
- `metrics_daily` - Métricas agregadas por dia

### **Componentes Frontend**
- `ads-connect-sdk.js` - SDK JavaScript para sites parceiros
- `AdminSitesPage.tsx` - Gestão de sites no admin
- `AdminAnalyticsPage.tsx` - Dashboard de métricas

---

## ✅ **Status do Projeto**

| Componente | Status | Documentação |
|------------|--------|--------------|
| **Database Schema** | ✅ Completo | [analytics_architecture.md](./analytics_architecture.md) |
| **Edge Functions** | ✅ Deployadas | [final_deployment_walkthrough.md](./final_deployment_walkthrough.md) |
| **SDK JavaScript** | ✅ Criado | [frontend_integration_complete.md](./frontend_integration_complete.md) |
| **Admin Console** | ✅ Implementado | [admin_sites_guide.md](./admin_sites_guide.md) |
| **Analytics Dashboard** | ✅ Implementado | [analytics_complete_walkthrough.md](./analytics_complete_walkthrough.md) |
| **Vercel Deploy** | ✅ Configurado | [vercel_404_fix.md](./vercel_404_fix.md) |

---

## 🆘 **Troubleshooting**

### **Erro 500 no Supabase**
- Verificar variáveis de ambiente
- Ler: [env_setup_guide.md](./env_setup_guide.md)

### **404 em Rotas**
- Verificar vercel.json
- Ler: [vercel_404_fix.md](./vercel_404_fix.md)

### **Tracking Não Funciona**
- Verificar API keys
- Verificar console do navegador
- Ler: [FRONTEND_TRACKING_GUIDE.md](./FRONTEND_TRACKING_GUIDE.md)

---

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Consultar documentação relevante acima
2. Verificar logs do console (DevTools)
3. Verificar Network tab (requisições)
4. Verificar banco de dados (Supabase Dashboard)

---

**Última Atualização:** 2026-01-16
**Versão:** 1.0.0
