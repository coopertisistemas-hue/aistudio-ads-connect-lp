# Guia de Integração Frontend - ADS Connect

## 🎯 **Objetivo**

Integrar o SDK ADS Connect em sites parceiros para rastrear impressões e cliques de anúncios com anti-fraude.

---

## ✅ **Arquivos Criados**

### **1. SDK JavaScript** 📦
**Arquivo:** `public/ads-connect-sdk.js`

**Funcionalidades:**
- ✅ Tracking de impressões viewable (Intersection Observer)
- ✅ Tracking de cliques com debounce
- ✅ Detecção automática de device (desktop/mobile/tablet)
- ✅ Anti-fraude client-side
- ✅ Modo debug para desenvolvimento

**Tamanho:** ~10KB minificado

---

### **2. Exemplo de Integração** 📄
**Arquivo:** `public/integration-example.html`

**Demonstra:**
- Inicialização do SDK
- Busca de anúncios via API
- Renderização de anúncios
- Tracking automático de impressões viewable
- Tracking de cliques com redirecionamento

---

### **3. Scripts SQL de API Keys** 🔑
**Arquivo:** `supabase/sql/api_key_management.sql`

**Inclui:**
- Gerar API keys para sites
- Regenerar API keys (rotação)
- Revogar API keys
- Validar API keys
- Monitorar uso
- Trigger automático para novos sites

---

## 🚀 **Passo a Passo de Integração**

### **Passo 1: Criar Site Parceiro e Gerar API Key**

Execute no **Supabase Dashboard > SQL Editor**:

```sql
-- Criar site parceiro com API key automática
INSERT INTO partner_sites (
    slug, name, domain, homepage_url, category, site_type,
    country, primary_language, status, approval_status,
    revenue_share_percentage, owner_email
) VALUES (
    'meu-site',
    'Meu Site Parceiro',
    'meusite.com.br',
    'https://meusite.com.br',
    'blog',
    'blog',
    'BR',
    'pt-BR',
    'active',
    'approved',
    70.00,
    'contato@meusite.com.br'
)
RETURNING 
    id,
    name,
    api_key_hash as api_key;
```

**Copie o `id` e `api_key` retornados!**

---

### **Passo 2: Hospedar o SDK**

#### **Opção A: Servir do Próprio Projeto**

O SDK já está em `public/ads-connect-sdk.js` e será servido automaticamente pelo Vite:

```
http://localhost:5173/ads-connect-sdk.js
```

Para produção, após build:
```
https://seu-dominio.com/ads-connect-sdk.js
```

#### **Opção B: CDN (Recomendado para Produção)**

Upload para CDN (Cloudflare, AWS CloudFront, etc.) e use:

```html
<script src="https://cdn.adsconnect.com/sdk/v1/ads-connect.min.js"></script>
```

---

### **Passo 3: Integrar no Site Parceiro**

No site parceiro, adicione ao `<head>`:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- ADS Connect SDK -->
    <script src="https://seu-dominio.com/ads-connect-sdk.js"></script>
    
    <script>
        // Configurar SDK
        ADSConnect.init({
            siteId: 'id-copiado-do-passo-1',
            apiKey: 'api-key-copiada-do-passo-1',
            supabaseUrl: 'https://hwugnqevkeymqoahnwfb.supabase.co',
            debug: false, // true para desenvolvimento
        });
    </script>
</head>
<body>
    <!-- Container do anúncio -->
    <div id="ad-slot-header"></div>
    
    <script>
        // Buscar e renderizar anúncio
        async function loadAd() {
            // 1. Buscar anúncio
            const response = await fetch('https://hwugnqevkeymqoahnwfb.supabase.co/functions/v1/serve-ad-optimized', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Site-Key': 'sua-api-key',
                },
                body: JSON.stringify({
                    site_id: 'seu-site-id',
                    slot_position: 'header',
                    user_context: {
                        device: ADSConnect.detectDevice(),
                    },
                }),
            });
            
            const data = await response.json();
            
            if (data.success && data.ad) {
                const ad = data.ad;
                
                // 2. Renderizar anúncio
                const container = document.getElementById('ad-slot-header');
                const img = document.createElement('img');
                img.src = ad.creative.url;
                img.alt = 'Anúncio';
                container.appendChild(img);
                
                // 3. Tracking de impressão viewable
                const tracker = new ViewableImpressionTracker(container, {
                    adId: ad.id,
                    slotId: 'ad-slot-header',
                });
                
                // 4. Tracking de clique
                const clickTracker = new ClickTracker();
                img.addEventListener('click', (e) => {
                    clickTracker.handleClick(e, {
                        adId: ad.id,
                        impressionId: tracker.getImpressionId(),
                        slotId: 'ad-slot-header',
                        fallbackUrl: ad.click_url,
                    });
                });
            }
        }
        
        loadAd();
    </script>
</body>
</html>
```

---

## 🧪 **Testar Integração**

### **1. Testar Localmente**

Abra `public/integration-example.html` no navegador:

```bash
# No terminal do projeto
cd public
python -m http.server 8000
# ou
npx serve
```

Acesse: `http://localhost:8000/integration-example.html`

---

### **2. Verificar Tracking**

Abra **DevTools > Console** e procure por:

```
[ADS Connect] SDK inicializado
[ADS Connect] ✅ Impressão viewable registrada
[ADS Connect] ✅ Clique registrado
```

---

### **3. Verificar no Banco de Dados**

Execute no **Supabase Dashboard > SQL Editor**:

```sql
-- Verificar impressões recentes
SELECT 
    id,
    ad_id,
    site_id,
    is_viewable,
    time_visible,
    fraud_score,
    is_blocked,
    timestamp
FROM impressions
ORDER BY timestamp DESC
LIMIT 10;

-- Verificar cliques recentes
SELECT 
    id,
    ad_id,
    impression_id,
    fraud_score,
    is_blocked,
    timestamp
FROM clicks
ORDER BY timestamp DESC
LIMIT 10;
```

---

## 📊 **Monitoramento**

### **Dashboard de Métricas**

```sql
-- Métricas do site nas últimas 24h
SELECT 
    ps.name as site_name,
    COUNT(DISTINCT i.id) as impressions,
    COUNT(DISTINCT c.id) as clicks,
    CASE 
        WHEN COUNT(DISTINCT i.id) > 0 
        THEN ROUND((COUNT(DISTINCT c.id)::DECIMAL / COUNT(DISTINCT i.id)) * 100, 2)
        ELSE 0
    END as ctr_percent,
    ROUND(AVG(i.fraud_score), 2) as avg_fraud_score,
    COUNT(*) FILTER (WHERE i.is_blocked) as blocked_impressions
FROM partner_sites ps
LEFT JOIN impressions i ON i.site_id = ps.id AND i.timestamp > NOW() - INTERVAL '24 hours'
LEFT JOIN clicks c ON c.site_id = ps.id AND c.timestamp > NOW() - INTERVAL '24 hours'
WHERE ps.id = 'seu-site-id'
GROUP BY ps.id, ps.name;
```

---

## 🔒 **Segurança**

### **Boas Práticas:**

1. ✅ **Nunca exponha API keys no código frontend**
   - Use variáveis de ambiente no servidor
   - Busque anúncios via backend próprio

2. ✅ **Rotacione API keys periodicamente**
   ```sql
   -- A cada 90 dias
   UPDATE partner_sites
   SET api_key_hash = encode(gen_random_bytes(32), 'hex')
   WHERE id = 'seu-site-id';
   ```

3. ✅ **Monitore uso suspeito**
   ```sql
   -- Detectar tráfego anormal
   SELECT * FROM partner_sites
   WHERE id IN (
       SELECT site_id FROM impressions
       WHERE timestamp > NOW() - INTERVAL '1 hour'
       GROUP BY site_id
       HAVING COUNT(*) > 1000
   );
   ```

4. ✅ **Use HTTPS sempre**
   - Todas as requisições devem ser HTTPS
   - Configure SSL/TLS no site parceiro

---

## 🎯 **Próximos Passos**

### **1. Criar Slots de Anúncios**

```sql
-- Criar slots para o site
INSERT INTO ad_slots (
    site_id, site_name, name, position, width, height, type, status
) VALUES 
    ('seu-site-id', 'Meu Site', 'Header Banner', 'header', 728, 90, 'banner', 'active'),
    ('seu-site-id', 'Meu Site', 'Sidebar Ad', 'sidebar', 300, 250, 'banner', 'active'),
    ('seu-site-id', 'Meu Site', 'Footer Ad', 'footer', 970, 90, 'banner', 'active');
```

---

### **2. Criar Anúncios**

```sql
-- Criar anúncio de exemplo
INSERT INTO ads (
    name, type, status, click_url, cpm, cpc, 
    budget_total, budget_remaining, start_date
) VALUES (
    'Anúncio Exemplo',
    'banner',
    'active',
    'https://anunciante.com/produto',
    5.00,  -- R$ 5,00 CPM
    0.50,  -- R$ 0,50 CPC
    1000.00,
    1000.00,
    NOW()
)
RETURNING id;
```

---

### **3. Upload de Criativos**

Use o **Supabase Storage** bucket `creatives`:

```javascript
// Upload de imagem
const { data, error } = await supabase.storage
    .from('creatives')
    .upload('banners/exemplo.jpg', file);

// URL pública
const url = supabase.storage
    .from('creatives')
    .getPublicUrl('banners/exemplo.jpg').data.publicUrl;
```

---

## 📚 **Recursos Adicionais**

- 📄 **SDK Completo:** `public/ads-connect-sdk.js`
- 📄 **Exemplo HTML:** `public/integration-example.html`
- 📄 **API Keys SQL:** `supabase/sql/api_key_management.sql`
- 📄 **Guia Frontend:** `FRONTEND_TRACKING_GUIDE.md`
- 📄 **Tracking README:** `supabase/functions/TRACKING_README.md`

---

## ✅ **Checklist de Integração**

- [ ] Site parceiro criado no banco
- [ ] API key gerada
- [ ] SDK incluído no site parceiro
- [ ] SDK inicializado com credenciais
- [ ] Slots de anúncios criados
- [ ] Anúncios criados e ativos
- [ ] Criativos uploadados
- [ ] Tracking de impressões testado
- [ ] Tracking de cliques testado
- [ ] Métricas verificadas no banco
- [ ] Monitoramento configurado

---

**Status:** ✅ **PRONTO PARA INTEGRAÇÃO**

Tudo configurado para começar a rastrear impressões e cliques em sites parceiros! 🚀
