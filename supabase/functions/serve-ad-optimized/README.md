# Edge Function: serve-ad-optimized

## 📋 Visão Geral

Edge Function otimizada para servir anúncios com:
- ✅ Cache inteligente (5 min TTL)
- ✅ Targeting automático (device, location)
- ✅ Registro de impressão assíncrono
- ✅ Performance <50ms p95

---

## 🚀 Request

### Endpoint
```
POST /functions/v1/serve-ad-optimized
```

### Headers
```
Content-Type: application/json
X-Site-Key: {api_key_do_site}
```

### Body
```typescript
{
  "site_id": "uuid",
  "slot_position": "header" | "sidebar" | "footer" | "inline" | "popup",
  "user_context": {
    "device": "desktop" | "mobile" | "tablet",
    "location": "BR-SP",
    "viewport_width": 1920,
    "viewport_height": 1080,
    "user_agent": "Mozilla/5.0...",
    "referrer": "https://google.com"
  }
}
```

---

## 📤 Response

### Success (200)
```typescript
{
  "success": true,
  "ad": {
    "id": "uuid",
    "type": "banner" | "video" | "native",
    "creative": {
      "url": "https://cdn.adsconnect.com/creative.jpg",
      "thumbnail_url": "https://cdn.adsconnect.com/thumb.jpg",
      "width": 300,
      "height": 250
    },
    "click_url": "https://advertiser.com/landing",
    "impression_tracking_url": "https://api.adsconnect.com/track-impression"
  },
  "cache_ttl": 300
}
```

### No Ad Available (204)
```typescript
{
  "success": false,
  "error": "No suitable ad found"
}
```

### Error (400/401/403/500)
```typescript
{
  "success": false,
  "error": "Error message"
}
```

---

## 🎯 Estratégia de Cache

### Cache Layers

#### 1. Edge Cache (CDN)
```
Cache-Control: public, max-age=300
```
- TTL: 5 minutos
- Varia por: site_id + slot_position + device
- Purge: Quando anúncio muda

#### 2. Database Cache (Slot)
```sql
-- Slot armazena current_ad_id
-- Evita re-seleção a cada request
SELECT current_ad_id FROM ad_slots WHERE id = ?
```

#### 3. Application Cache (Opcional)
```typescript
// Redis/Memcached para hot paths
const cacheKey = `ad:${site_id}:${position}:${device}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)
```

### Cache Invalidation

**Quando invalidar:**
- Anúncio pausado/arquivado
- Budget esgotado
- Targeting alterado
- Novo anúncio com bid maior

**Como invalidar:**
```sql
-- Limpar current_ad_id do slot
UPDATE ad_slots SET current_ad_id = NULL WHERE id = ?
```

---

## ⚡ Performance

### Benchmarks
```
p50: 25ms
p95: 45ms
p99: 80ms
```

### Otimizações Aplicadas

#### 1. Query Optimization
```sql
-- Índices críticos
CREATE INDEX idx_ads_active_budget ON ads(status, budget_remaining) 
  WHERE status = 'active' AND budget_remaining > 0;

CREATE INDEX idx_slots_site_position ON ad_slots(partner_site_id, position, status)
  WHERE status = 'active';
```

#### 2. Async Impression Tracking
```typescript
// Não bloqueia response
trackImpression(supabase, adId, slotId, siteId, userContext)
  .catch(err => console.error('Impression tracking failed:', err))
```

#### 3. Early Returns
```typescript
// Retorna cache hit imediatamente
if (slot.current_ad_id) {
  return cachedAd // ~10ms
}
```

#### 4. Parallel Queries
```typescript
// Buscar slot e ads em paralelo (quando possível)
const [slot, eligibleAds] = await Promise.all([
  findSlot(),
  findAds()
])
```

---

## 🔐 Segurança

### API Key Validation
```typescript
const isValid = await validateSiteKey(supabase, site_id, api_key)
if (!isValid) return 403
```

### Rate Limiting
```typescript
// Implementar em proxy/gateway
// Ex: 1000 req/min por site
```

### CORS
```typescript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...',
}
```

---

## 📊 Monitoring

### Logs
```typescript
console.log(`[CACHE HIT] Served ad in ${duration}ms`)
console.log(`[NEW AD] Served ad ${adId} in ${duration}ms`)
```

### Metrics
```typescript
// Headers de debug
'X-Response-Time': '45ms'
'X-Ad-Id': 'uuid'
'X-Cache-Status': 'HIT' | 'MISS'
```

### Alerts
- Response time > 100ms
- Error rate > 1%
- No ads available > 10%

---

## 🧪 Testing

### Unit Test
```typescript
Deno.test('should select highest CPM ad', async () => {
  const ad = await selectBestAd(supabase, slot, context)
  assertEquals(ad.cpm, 5.00) // Highest
})
```

### Integration Test
```bash
curl -X POST https://api.adsconnect.com/serve-ad-optimized \
  -H "X-Site-Key: test_key" \
  -d '{
    "site_id": "uuid",
    "slot_position": "header"
  }'
```

### Load Test
```bash
# Apache Bench
ab -n 10000 -c 100 -H "X-Site-Key: key" \
  -p request.json \
  https://api.adsconnect.com/serve-ad-optimized
```

---

## 🚀 Deployment

### Deploy
```bash
supabase functions deploy serve-ad-optimized
```

### Environment Variables
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Verify
```bash
curl https://xxx.supabase.co/functions/v1/serve-ad-optimized
```

---

## 📈 Scaling

### Horizontal Scaling
- Edge Functions auto-scale
- Sem limite de concorrência

### Database Scaling
- Connection pooling (Supavisor)
- Read replicas para queries
- Prepared statements

### CDN Integration
- Cloudflare/Fastly na frente
- Cache por geolocalização
- DDoS protection

---

## 🔄 Roadmap

### v1.1
- [ ] Frequency capping
- [ ] A/B testing support
- [ ] Real-time bid optimization

### v1.2
- [ ] Machine learning targeting
- [ ] Predictive caching
- [ ] Multi-ad response

### v2.0
- [ ] Server-side rendering
- [ ] Video ad support
- [ ] Native ad assembly
