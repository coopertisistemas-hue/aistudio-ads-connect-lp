# Prompt para Orquestrador: Implementação de Edge Functions no Primeiro Site Parceiro

## 📋 **Contexto do Projeto**

Estamos implementando o sistema ADS Connect - uma plataforma de monetização via anúncios para sites parceiros. Já temos toda a infraestrutura backend pronta (Edge Functions, Database, Analytics) e agora precisamos integrar o primeiro site parceiro.

---

## 🎯 **Objetivo**

Implementar as Edge Functions de tracking (impressões e cliques) no primeiro site parceiro, incluindo:
1. Configuração do site no Admin Console
2. Geração de API Key
3. Integração do SDK JavaScript
4. Testes de tracking
5. Validação de métricas

---

## 📚 **Documentação Técnica Necessária**

### **1. Arquitetura Geral**
Leia: `analytics_architecture.md`
- Entenda a arquitetura completa de analytics
- Fluxo de dados: Impressão → Agregação → Métricas
- Estrutura de tabelas e triggers

### **2. Guia de Integração Frontend**
Leia: `frontend_integration_complete.md`
- SDK JavaScript completo (`ads-connect-sdk.js`)
- Exemplo de integração HTML
- Passo a passo de configuração

### **3. Guia de Tracking**
Leia: `FRONTEND_TRACKING_GUIDE.md`
- Como implementar tracking de impressões viewable
- Como implementar tracking de cliques
- Anti-fraude client-side
- Melhores práticas

### **4. Admin Sites**
Leia: `admin_sites_guide.md`
- Como criar site parceiro no Admin Console
- Geração de API Keys
- Aprovação de sites

### **5. Deployment**
Leia: `final_deployment_walkthrough.md`
- Status das Edge Functions deployadas
- Endpoints disponíveis
- Verificação de funcionamento

---

## 🔧 **Instruções Específicas**

### **Passo 1: Criar Site Parceiro**

Execute no **Supabase Dashboard > SQL Editor**:

```sql
-- Criar site parceiro de exemplo
INSERT INTO partner_sites (
    slug, name, domain, homepage_url, category, site_type,
    country, primary_language, status, approval_status,
    revenue_share_percentage, owner_email
) VALUES (
    'blog-exemplo',
    'Blog Exemplo Tech',
    'exemplo-tech.com.br',
    'https://exemplo-tech.com.br',
    'technology',
    'blog',
    'BR',
    'pt-BR',
    'active',
    'approved',
    70.00,
    'contato@exemplo-tech.com.br'
)
RETURNING 
    id,
    name,
    api_key_hash as api_key;
```

**Copie o `id` e `api_key` retornados!**

---

### **Passo 2: Criar Anúncio de Teste**

```sql
-- Criar anúncio de exemplo
INSERT INTO ads (
    name, type, status, click_url, cpm, cpc,
    budget_total, budget_remaining, start_date
) VALUES (
    'Anúncio Teste - Banner Tech',
    'banner',
    'active',
    'https://anunciante.com/produto',
    5.00,  -- R$ 5,00 CPM
    0.50,  -- R$ 0,50 CPC
    1000.00,
    1000.00,
    NOW()
)
RETURNING id, name;
```

**Copie o `id` do anúncio!**

---

### **Passo 3: Criar Slot de Anúncio**

```sql
-- Criar slot para o site
INSERT INTO ad_slots (
    site_id, site_name, name, position, 
    width, height, type, status
) VALUES (
    'id-do-site-copiado',
    'Blog Exemplo Tech',
    'Header Banner',
    'header',
    728, 90,
    'banner',
    'active'
)
RETURNING id, name;
```

**Copie o `id` do slot!**

---

### **Passo 4: Criar Página HTML de Teste**

Crie arquivo `test-integration.html` com o seguinte conteúdo:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Teste de Integração - ADS Connect</title>
    
    <!-- ADS Connect SDK -->
    <script src="https://adsconnect.vercel.app/ads-connect-sdk.js"></script>
    
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .ad-container { border: 2px dashed #ccc; padding: 20px; margin: 20px 0; text-align: center; background: #f9f9f9; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; background: #e3f2fd; }
    </style>
</head>
<body>
    <h1>Teste de Integração - ADS Connect</h1>
    
    <div class="status" id="status">Inicializando...</div>
    
    <!-- Slot de Anúncio -->
    <div id="ad-slot-header" class="ad-container">
        <p>Carregando anúncio...</p>
    </div>
    
    <h2>Conteúdo do Site</h2>
    <p>Lorem ipsum dolor sit amet...</p>
    
    <script>
        // CONFIGURAÇÃO (SUBSTITUIR COM VALORES REAIS)
        const CONFIG = {
            siteId: 'COLE-ID-DO-SITE-AQUI',
            apiKey: 'COLE-API-KEY-AQUI',
            supabaseUrl: 'https://hwugnqevkeymqoahnwfb.supabase.co',
            debug: true,
        };
        
        const AD_CONFIG = {
            adId: 'COLE-ID-DO-ANUNCIO-AQUI',
            slotId: 'COLE-ID-DO-SLOT-AQUI',
            creativeUrl: 'https://via.placeholder.com/728x90?text=Anúncio+Teste',
            clickUrl: 'https://google.com',
        };
        
        // Inicializar SDK
        ADSConnect.init(CONFIG);
        document.getElementById('status').textContent = '✅ SDK inicializado!';
        
        // Renderizar anúncio
        const container = document.getElementById('ad-slot-header');
        const img = document.createElement('img');
        img.src = AD_CONFIG.creativeUrl;
        img.alt = 'Anúncio';
        img.width = 728;
        img.height = 90;
        container.innerHTML = '';
        container.appendChild(img);
        
        // Tracking de impressão viewable
        const tracker = new ViewableImpressionTracker(container, {
            adId: AD_CONFIG.adId,
            slotId: AD_CONFIG.slotId,
        });
        
        // Tracking de clique
        const clickTracker = new ClickTracker();
        img.addEventListener('click', async (e) => {
            await clickTracker.handleClick(e, {
                adId: AD_CONFIG.adId,
                impressionId: tracker.getImpressionId(),
                slotId: AD_CONFIG.slotId,
                fallbackUrl: AD_CONFIG.clickUrl,
            });
        });
        
        document.getElementById('status').textContent = '✅ Anúncio carregado e tracking configurado!';
    </script>
</body>
</html>
```

---

### **Passo 5: Testar**

1. **Abrir `test-integration.html` no navegador**
2. **Abrir DevTools > Console**
3. **Verificar logs:**
   - `[ADS Connect] SDK inicializado`
   - `[ADS Connect] ✅ Impressão viewable registrada`
4. **Clicar no anúncio**
5. **Verificar log:** `[ADS Connect] ✅ Clique registrado`

---

### **Passo 6: Validar no Banco de Dados**

```sql
-- Verificar impressões
SELECT 
    id, ad_id, site_id, is_viewable, 
    fraud_score, revenue, timestamp
FROM impressions
ORDER BY timestamp DESC
LIMIT 5;

-- Verificar cliques
SELECT 
    id, ad_id, site_id, 
    fraud_score, revenue, timestamp
FROM clicks
ORDER BY timestamp DESC
LIMIT 5;

-- Verificar métricas agregadas
SELECT * FROM dashboard_overview;
```

---

## ✅ **Checklist de Implementação**

- [ ] Site parceiro criado no banco
- [ ] API key gerada e copiada
- [ ] Anúncio de teste criado
- [ ] Slot de anúncio criado
- [ ] Arquivo `test-integration.html` criado
- [ ] IDs substituídos no HTML
- [ ] Página aberta no navegador
- [ ] Impressão registrada (verificar console)
- [ ] Clique registrado (verificar console)
- [ ] Dados validados no banco
- [ ] Métricas aparecendo no dashboard

---

## 🎯 **Resultado Esperado**

Ao final, você deve ter:
1. ✅ Site parceiro ativo no sistema
2. ✅ Impressões sendo rastreadas
3. ✅ Cliques sendo rastreados
4. ✅ Métricas aparecendo no banco de dados
5. ✅ Dashboard mostrando dados em tempo real

---

## 📞 **Suporte**

Se encontrar problemas:
1. Verificar logs do console (DevTools)
2. Verificar Network tab (requisições para Edge Functions)
3. Verificar banco de dados (tabelas impressions/clicks)
4. Consultar `FRONTEND_TRACKING_GUIDE.md` para troubleshooting

---

**Boa sorte com a implementação! 🚀**
