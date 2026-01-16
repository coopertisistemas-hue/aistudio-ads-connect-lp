# Tracking Edge Functions - README

## 📋 **Visão Geral**

Duas Edge Functions para rastreamento preciso de impressões e cliques com **anti-fraude integrado**.

---

## 🎯 **Funções Criadas**

### **1. `track-impression`**
Registra impressões de anúncios com validação de viewability e anti-fraude.

**Endpoint:** `POST /functions/v1/track-impression`

**Request:**
```json
{
  "ad_id": "uuid",
  "slot_id": "uuid",
  "site_id": "uuid",
  "context": {
    "viewport_width": 1920,
    "viewport_height": 1080,
    "user_agent": "Mozilla/5.0...",
    "referrer": "https://google.com",
    "page_url": "https://site.com/page",
    "device_type": "desktop",
    "is_viewable": true,
    "time_visible": 1500
  }
}
```

**Response:**
```json
{
  "success": true,
  "impression_id": "uuid",
  "fraud_score": 15,
  "blocked": false
}
```

---

### **2. `track-click`**
Registra cliques em anúncios com validação de origem e cálculo de CTR.

**Endpoint:** `POST /functions/v1/track-click`

**Request:**
```json
{
  "ad_id": "uuid",
  "impression_id": "uuid",
  "slot_id": "uuid",
  "site_id": "uuid",
  "context": {
    "click_x": 450,
    "click_y": 320,
    "user_agent": "Mozilla/5.0...",
    "time_on_page": 5000
  }
}
```

**Response:**
```json
{
  "success": true,
  "click_id": "uuid",
  "redirect_url": "https://anunciante.com/produto",
  "fraud_score": 10,
  "blocked": false
}
```

---

## 🛡️ **Sistema Anti-Fraude**

### **Métricas Analisadas (Impressões)**

| Métrica | Threshold | Score |
|---------|-----------|-------|
| Impressões/IP/hora | >100 | +50 |
| Impressões/Anúncio/IP/dia | >10 | +40 |
| User Agent suspeito | Bot detectado | +60 |
| Tempo entre impressões | <1s | +30 |
| Não viewable | `is_viewable: false` | Bloqueio |
| Tempo visível | <500ms | Bloqueio |

### **Métricas Analisadas (Cliques)**

| Métrica | Threshold | Score |
|---------|-----------|-------|
| Cliques/IP/hora | >20 | +60 |
| Cliques/Anúncio/IP/dia | >3 | +50 |
| Clique sem impressão | N/A | +30 |
| Tempo impressão→clique | <500ms | +35 |
| Tempo impressão→clique | >1h | +25 |
| Tempo na página | <1s | +25 |
| User Agent suspeito | Bot detectado | +70 |

### **Decisão de Bloqueio**

- **Impressões:** `fraud_score >= 80` OU `!is_viewable` OU `time_visible < 500ms`
- **Cliques:** `fraud_score >= 70`

---

## 📊 **Métricas Atualizadas Automaticamente**

### **Impressões:**
1. ✅ `ad_slots.impressions` (+1)
2. ✅ `ad_slots.revenue` (+CPM/1000)
3. ✅ `ad_slots.last_served` (timestamp)
4. ✅ `ads.impressions` (+1)
5. ✅ `ads.budget_remaining` (-CPM/1000)
6. ✅ Audit log criado

### **Cliques:**
1. ✅ `ad_slots.clicks` (+1)
2. ✅ `ad_slots.revenue` (+CPC)
3. ✅ `ad_slots.ctr` (recalculado)
4. ✅ `ads.clicks` (+1)
5. ✅ `ads.ctr` (recalculado)
6. ✅ `ads.budget_remaining` (-CPC)
7. ✅ Audit log criado

---

## 🗄️ **Tabelas Criadas**

### **`impressions`**
```sql
- id (UUID, PK)
- ad_id, slot_id, site_id (FKs)
- timestamp
- ip_address, user_agent
- viewport_width, viewport_height
- referrer, page_url, device_type
- is_viewable, time_visible
- fraud_score (0-100)
- is_blocked
- revenue
```

### **`clicks`**
```sql
- id (UUID, PK)
- ad_id, impression_id, slot_id, site_id (FKs)
- timestamp
- ip_address, user_agent
- click_x, click_y
- time_on_page
- fraud_score (0-100)
- is_blocked
- revenue
- converted, conversion_value
```

---

## 🚀 **Deploy**

### **1. Aplicar Migration**
```bash
cd supabase
supabase db push
```

### **2. Deploy Edge Functions**
```bash
supabase functions deploy track-impression
supabase functions deploy track-click
```

### **3. Verificar**
```bash
# Testar track-impression
curl -X POST \
  https://seu-projeto.supabase.co/functions/v1/track-impression \
  -H "Content-Type: application/json" \
  -H "X-Site-Key: sua-api-key" \
  -d '{
    "ad_id": "uuid",
    "slot_id": "uuid",
    "site_id": "uuid",
    "context": {
      "is_viewable": true,
      "time_visible": 1000
    }
  }'

# Testar track-click
curl -X POST \
  https://seu-projeto.supabase.co/functions/v1/track-click \
  -H "Content-Type: application/json" \
  -H "X-Site-Key: sua-api-key" \
  -d '{
    "ad_id": "uuid",
    "slot_id": "uuid",
    "site_id": "uuid"
  }'
```

---

## 📈 **Performance**

### **Targets:**
- ✅ `track-impression`: <30ms p95
- ✅ `track-click`: <40ms p95

### **Otimizações:**
- ✅ Queries indexadas (ip_address, timestamp)
- ✅ RPC functions para updates atômicos
- ✅ Audit logs assíncronos (não bloqueiam)
- ✅ Early returns para casos bloqueados

---

## 🔍 **Monitoramento**

### **Views Úteis:**

```sql
-- Impressões válidas (não bloqueadas)
SELECT * FROM valid_impressions;

-- Cliques válidos
SELECT * FROM valid_clicks;

-- Estatísticas de fraude por anúncio
SELECT * FROM ad_fraud_stats;

-- CTR por anúncio
SELECT * FROM ad_ctr_stats;
```

### **Queries de Análise:**

```sql
-- Top 10 IPs com maior fraud score
SELECT 
  ip_address,
  COUNT(*) as total,
  ROUND(AVG(fraud_score), 2) as avg_fraud_score
FROM impressions
WHERE fraud_score > 50
GROUP BY ip_address
ORDER BY avg_fraud_score DESC
LIMIT 10;

-- Taxa de bloqueio por hora
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_blocked) as blocked,
  ROUND((COUNT(*) FILTER (WHERE is_blocked)::DECIMAL / COUNT(*)) * 100, 2) as block_rate
FROM impressions
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## 🔒 **Segurança**

### **Headers Obrigatórios:**
- `X-Site-Key`: API key do site parceiro (validada no backend)

### **RLS Policies:**
- ✅ Admins podem ver tudo
- ✅ Service role pode inserir (Edge Functions)
- ✅ Sites parceiros NÃO têm acesso direto

### **IP Tracking:**
- Extraído de `x-forwarded-for` ou `x-real-ip`
- Usado apenas para anti-fraude
- Não exposto em APIs públicas

---

## 📚 **Documentação Frontend**

Consulte [`FRONTEND_TRACKING_GUIDE.md`](./FRONTEND_TRACKING_GUIDE.md) para:
- SDK JavaScript completo
- Intersection Observer (viewability)
- Exemplos de integração
- Best practices

---

## ✅ **Checklist de Implementação**

- [x] Edge Function `track-impression` criada
- [x] Edge Function `track-click` criada
- [x] Migration `20260116_tracking_tables.sql` criada
- [x] Tabelas `impressions` e `clicks` definidas
- [x] Indexes de performance criados
- [x] RPC functions para métricas
- [x] Views úteis criadas
- [x] RLS policies configuradas
- [x] Anti-fraude implementado
- [x] Audit logs automáticos
- [x] Documentação frontend completa

---

**Status:** ✅ **PRONTO PARA PRODUÇÃO**
