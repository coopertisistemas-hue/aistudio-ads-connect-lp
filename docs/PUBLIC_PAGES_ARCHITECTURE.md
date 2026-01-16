# 🌐 ADS Connect — Arquitetura de Páginas Públicas (Sites Parceiros)

**Arquiteto:** Full-Stack Sênior  
**Data:** 2026-01-16  
**Objetivo:** Especificar TODAS as páginas públicas necessárias para exibição de anúncios nos sites parceiros

---

## 📋 VISÃO GERAL

### Contexto
Os **sites parceiros** precisam de páginas/componentes públicos para:
1. Exibir anúncios nos slots configurados
2. Rastrear impressões e cliques
3. Reportar métricas ao ADS Connect
4. Monetizar através de anúncios programáticos

### Arquitetura Proposta
```
┌─────────────────────────────────────────────────────────┐
│              SITE PARCEIRO (exemplo.com)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  <AdSlot id="header-banner" />                    │  │
│  │  <AdSlot id="sidebar-1" />                        │  │
│  │  <AdSlot id="footer-banner" />                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│              ADS CONNECT (Backend)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Edge Functions:                                  │  │
│  │  - serve-ad                                       │  │
│  │  - track-impression                               │  │
│  │  - track-click                                    │  │
│  │  - calculate-revenue                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📄 PÁGINAS PÚBLICAS NECESSÁRIAS

### 1. SDK Integration Page (`/sdk/ads-connect.js`)

**Responsabilidade:**
- Fornecer SDK JavaScript para sites parceiros
- Inicializar tracking
- Gerenciar slots dinamicamente
- Lazy loading de anúncios

**Dados Consumidos:**
```typescript
// Config inicial
{
  siteId: string
  apiKey: string
  slots: SlotConfig[]
  trackingEnabled: boolean
  lazyLoad: boolean
}
```

**Edge Functions Chamadas:**
- `serve-ad` — Buscar anúncio para slot
- `track-impression` — Registrar impressão
- `track-click` — Registrar clique

**Implementação:**
```typescript
// /sdk/ads-connect.js
class AdsConnectSDK {
  constructor(config) {
    this.siteId = config.siteId
    this.apiKey = config.apiKey
    this.slots = new Map()
    this.init()
  }

  async init() {
    // Descobrir todos os slots na página
    document.querySelectorAll('[data-ads-slot]').forEach(el => {
      this.registerSlot(el)
    })
    
    // Lazy load com IntersectionObserver
    if (this.config.lazyLoad) {
      this.setupLazyLoading()
    } else {
      this.loadAllAds()
    }
  }

  async loadAd(slotId) {
    const response = await fetch(`${API_URL}/serve-ad`, {
      method: 'POST',
      headers: { 'X-API-Key': this.apiKey },
      body: JSON.stringify({ siteId: this.siteId, slotId })
    })
    
    const ad = await response.json()
    this.renderAd(slotId, ad)
    this.trackImpression(ad.id)
  }

  trackImpression(adId) {
    navigator.sendBeacon(`${API_URL}/track-impression`, JSON.stringify({
      adId,
      siteId: this.siteId,
      timestamp: Date.now()
    }))
  }

  trackClick(adId) {
    fetch(`${API_URL}/track-click`, {
      method: 'POST',
      body: JSON.stringify({ adId, siteId: this.siteId })
    })
  }
}

// Auto-init
window.AdsConnect = new AdsConnectSDK(window.ADS_CONNECT_CONFIG)
```

---

### 2. Ad Rendering Component (`/components/AdSlot.tsx`)

**Responsabilidade:**
- Renderizar anúncio em slot específico
- Suportar múltiplos formatos (banner, vídeo, nativo)
- Responsive design
- Fallback para empty state

**Dados Consumidos:**
```typescript
interface AdSlotProps {
  slotId: string
  position: 'header' | 'sidebar' | 'footer' | 'inline'
  width: number
  height: number
  fallback?: ReactNode
}

interface Ad {
  id: string
  type: 'banner' | 'video' | 'native'
  creative: {
    url: string
    thumbnailUrl?: string
    width: number
    height: number
  }
  clickUrl: string
  impressionUrl: string
}
```

**Edge Functions Chamadas:**
- `serve-ad` — Ao montar componente

**Implementação:**
```tsx
// /components/AdSlot.tsx
export const AdSlot: React.FC<AdSlotProps> = ({ 
  slotId, 
  position, 
  width, 
  height,
  fallback 
}) => {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const slotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadAd()
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (slotRef.current) {
      observer.observe(slotRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const loadAd = async () => {
    try {
      const response = await fetch('/api/serve-ad', {
        method: 'POST',
        body: JSON.stringify({ slotId })
      })
      const data = await response.json()
      setAd(data)
      trackImpression(data.id)
    } catch (error) {
      console.error('Failed to load ad:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (ad) {
      trackClick(ad.id)
      window.open(ad.clickUrl, '_blank')
    }
  }

  if (loading) {
    return <AdSkeleton width={width} height={height} />
  }

  if (!ad) {
    return fallback || null
  }

  return (
    <div 
      ref={slotRef}
      className="ads-slot"
      data-slot-id={slotId}
      data-position={position}
      style={{ width, height }}
    >
      {ad.type === 'banner' && (
        <img 
          src={ad.creative.url}
          alt="Advertisement"
          onClick={handleClick}
          style={{ width: '100%', height: '100%', cursor: 'pointer' }}
        />
      )}
      
      {ad.type === 'video' && (
        <video 
          src={ad.creative.url}
          poster={ad.creative.thumbnailUrl}
          controls
          onClick={handleClick}
        />
      )}
      
      {ad.type === 'native' && (
        <NativeAd ad={ad} onClick={handleClick} />
      )}
    </div>
  )
}
```

---

### 3. Impression Tracking Page (`/api/track-impression`)

**Responsabilidade:**
- Receber beacons de impressão
- Validar origem
- Incrementar contador
- Calcular viewability

**Dados Consumidos:**
```typescript
interface ImpressionEvent {
  adId: string
  slotId: string
  siteId: string
  timestamp: number
  viewportWidth: number
  viewportHeight: number
  visibilityDuration: number // ms
  userAgent: string
  referrer: string
}
```

**Edge Functions Chamadas:**
- `track-impression` (esta É a Edge Function)

**Implementação:**
```typescript
// supabase/functions/track-impression/index.ts
serve(async (req) => {
  const event: ImpressionEvent = await req.json()
  
  // Validar API key
  const apiKey = req.headers.get('X-API-Key')
  const { data: site } = await supabase
    .from('inventory')
    .select('id')
    .eq('site_id', event.siteId)
    .eq('api_key', apiKey)
    .single()
  
  if (!site) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Registrar impressão
  await supabase.from('impressions').insert({
    ad_id: event.adId,
    slot_id: event.slotId,
    site_id: event.siteId,
    timestamp: new Date(event.timestamp).toISOString(),
    viewport_width: event.viewportWidth,
    viewport_height: event.viewportHeight,
    visibility_duration: event.visibilityDuration,
    user_agent: event.userAgent,
    referrer: event.referrer,
    is_viewable: event.visibilityDuration > 1000 // 1s+
  })

  // Incrementar contador no slot
  await supabase.rpc('increment_slot_impressions', {
    slot_uuid: event.slotId
  })

  // Calcular revenue (CPM)
  const { data: ad } = await supabase
    .from('ads')
    .select('cpm')
    .eq('id', event.adId)
    .single()

  if (ad) {
    const revenue = (ad.cpm / 1000) // Revenue por impressão
    await supabase.rpc('add_slot_revenue', {
      slot_uuid: event.slotId,
      amount: revenue
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

### 4. Click Tracking Page (`/api/track-click`)

**Responsabilidade:**
- Registrar cliques em anúncios
- Calcular CTR
- Incrementar revenue (CPC)
- Redirecionar para URL do anunciante

**Dados Consumidos:**
```typescript
interface ClickEvent {
  adId: string
  slotId: string
  siteId: string
  timestamp: number
  clickX: number
  clickY: number
  userAgent: string
}
```

**Edge Functions Chamadas:**
- `track-click` (esta É a Edge Function)

**Implementação:**
```typescript
// supabase/functions/track-click/index.ts
serve(async (req) => {
  const event: ClickEvent = await req.json()

  // Registrar click
  await supabase.from('clicks').insert({
    ad_id: event.adId,
    slot_id: event.slotId,
    site_id: event.siteId,
    timestamp: new Date(event.timestamp).toISOString(),
    click_x: event.clickX,
    click_y: event.clickY,
    user_agent: event.userAgent
  })

  // Incrementar contador
  await supabase.rpc('increment_slot_clicks', {
    slot_uuid: event.slotId
  })

  // Calcular revenue (CPC)
  const { data: ad } = await supabase
    .from('ads')
    .select('cpc, click_url')
    .eq('id', event.adId)
    .single()

  if (ad) {
    await supabase.rpc('add_slot_revenue', {
      slot_uuid: event.slotId,
      amount: ad.cpc
    })
  }

  // Recalcular CTR
  await supabase.rpc('recalculate_slot_ctr', {
    slot_uuid: event.slotId
  })

  return new Response(JSON.stringify({ 
    success: true,
    redirectUrl: ad?.click_url 
  }))
})
```

---

### 5. Ad Serving Page (`/api/serve-ad`)

**Responsabilidade:**
- Selecionar melhor anúncio para slot
- Considerar targeting
- Aplicar frequency capping
- Retornar creative otimizado

**Dados Consumidos:**
```typescript
interface ServeAdRequest {
  slotId: string
  siteId: string
  userContext?: {
    location?: string
    device?: string
    interests?: string[]
  }
}

interface ServeAdResponse {
  ad: {
    id: string
    type: 'banner' | 'video' | 'native'
    creative: Creative
    clickUrl: string
    impressionUrl: string
  }
  ttl: number // cache TTL
}
```

**Edge Functions Chamadas:**
- `serve-ad` (esta É a Edge Function)

**Implementação:**
```typescript
// supabase/functions/serve-ad/index.ts
serve(async (req) => {
  const { slotId, siteId, userContext } = await req.json()

  // Buscar slot
  const { data: slot } = await supabase
    .from('ad_slots')
    .select('*, current_ad_id')
    .eq('id', slotId)
    .eq('site_id', siteId)
    .single()

  if (!slot) {
    return new Response('Slot not found', { status: 404 })
  }

  // Se já tem ad ativo, retornar
  if (slot.current_ad_id) {
    const { data: ad } = await supabase
      .from('ads')
      .select('*, creative:creatives(*)')
      .eq('id', slot.current_ad_id)
      .single()

    return new Response(JSON.stringify({
      ad: {
        id: ad.id,
        type: ad.creative.type,
        creative: ad.creative,
        clickUrl: ad.click_url,
        impressionUrl: `/api/track-impression`
      },
      ttl: 3600
    }))
  }

  // Buscar ads elegíveis (targeting, budget, schedule)
  const { data: eligibleAds } = await supabase
    .from('ads')
    .select('*, creative:creatives(*)')
    .eq('status', 'active')
    .gte('budget_remaining', 0)
    .lte('start_date', new Date().toISOString())
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)

  // Aplicar targeting
  const targetedAds = eligibleAds?.filter(ad => {
    // Device targeting
    if (ad.targeting?.devices && userContext?.device) {
      if (!ad.targeting.devices.includes(userContext.device)) {
        return false
      }
    }
    
    // Location targeting
    if (ad.targeting?.locations && userContext?.location) {
      if (!ad.targeting.locations.includes(userContext.location)) {
        return false
      }
    }
    
    return true
  })

  // Selecionar ad (maior bid ou round-robin)
  const selectedAd = targetedAds?.[0] // Simplificado

  if (!selectedAd) {
    return new Response(JSON.stringify({ ad: null }), { status: 204 })
  }

  // Atualizar slot
  await supabase
    .from('ad_slots')
    .update({ current_ad_id: selectedAd.id })
    .eq('id', slotId)

  return new Response(JSON.stringify({
    ad: {
      id: selectedAd.id,
      type: selectedAd.creative.type,
      creative: selectedAd.creative,
      clickUrl: selectedAd.click_url,
      impressionUrl: `/api/track-impression`
    },
    ttl: 3600
  }))
})
```

---

### 6. Analytics Dashboard Page (`/public/analytics/:siteId`)

**Responsabilidade:**
- Exibir métricas públicas do site
- Transparência para parceiros
- Gráficos de performance
- Exportar relatórios

**Dados Consumidos:**
```typescript
interface SiteAnalytics {
  siteId: string
  siteName: string
  period: { start: string; end: string }
  metrics: {
    totalImpressions: number
    totalClicks: number
    ctr: number
    revenue: number
    fillRate: number
  }
  topAds: Array<{
    adId: string
    name: string
    impressions: number
    clicks: number
    revenue: number
  }>
  slotPerformance: Array<{
    slotId: string
    name: string
    impressions: number
    ctr: number
    revenue: number
  }>
}
```

**Edge Functions Chamadas:**
- `get-site-analytics` (nova)

**Implementação:**
```tsx
// /pages/public/SiteAnalyticsPage.tsx
export const SiteAnalyticsPage: React.FC = () => {
  const { siteId } = useParams()
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [siteId, period])

  const loadAnalytics = async () => {
    const response = await supabase.functions.invoke('get-site-analytics', {
      body: { siteId, period }
    })
    setAnalytics(response.data)
  }

  return (
    <div className="analytics-dashboard">
      <header>
        <h1>{analytics?.siteName} — Analytics</h1>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
      </header>

      <div className="metrics-grid">
        <MetricCard 
          label="Impressões"
          value={analytics?.metrics.totalImpressions.toLocaleString()}
        />
        <MetricCard 
          label="Cliques"
          value={analytics?.metrics.totalClicks.toLocaleString()}
        />
        <MetricCard 
          label="CTR"
          value={`${analytics?.metrics.ctr.toFixed(2)}%`}
        />
        <MetricCard 
          label="Receita"
          value={formatCurrency(analytics?.metrics.revenue)}
        />
      </div>

      <section>
        <h2>Top Anúncios</h2>
        <table>
          {analytics?.topAds.map(ad => (
            <tr key={ad.adId}>
              <td>{ad.name}</td>
              <td>{ad.impressions.toLocaleString()}</td>
              <td>{ad.clicks.toLocaleString()}</td>
              <td>{formatCurrency(ad.revenue)}</td>
            </tr>
          ))}
        </table>
      </section>

      <section>
        <h2>Performance por Slot</h2>
        <BarChart data={analytics?.slotPerformance} />
      </section>
    </div>
  )
}
```

---

### 7. Ad Preview Page (`/preview/:adId`)

**Responsabilidade:**
- Preview de anúncio antes de publicar
- Testar em diferentes tamanhos
- Validar creative
- Não registrar impressões

**Dados Consumidos:**
```typescript
interface AdPreview {
  ad: Ad
  slot: AdSlot
  mockData?: {
    impressions: number
    clicks: number
  }
}
```

**Edge Functions Chamadas:**
- Nenhuma (dados mockados)

**Implementação:**
```tsx
// /pages/public/AdPreviewPage.tsx
export const AdPreviewPage: React.FC = () => {
  const { adId } = useParams()
  const [ad, setAd] = useState<Ad | null>(null)
  const [selectedSize, setSelectedSize] = useState('300x250')

  const sizes = {
    '300x250': { width: 300, height: 250 },
    '728x90': { width: 728, height: 90 },
    '160x600': { width: 160, height: 600 },
    '320x50': { width: 320, height: 50 }
  }

  return (
    <div className="ad-preview">
      <header>
        <h1>Preview: {ad?.name}</h1>
        <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
          {Object.keys(sizes).map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </header>

      <div className="preview-container">
        <div 
          className="preview-frame"
          style={sizes[selectedSize]}
        >
          <AdSlot 
            slotId="preview"
            position="inline"
            {...sizes[selectedSize]}
            previewMode={true}
            adData={ad}
          />
        </div>
      </div>

      <aside>
        <h3>Informações</h3>
        <dl>
          <dt>Tipo:</dt>
          <dd>{ad?.type}</dd>
          <dt>Formato:</dt>
          <dd>{ad?.creative.width} × {ad?.creative.height}</dd>
          <dt>Tamanho:</dt>
          <dd>{(ad?.creative.file_size / 1024).toFixed(2)} KB</dd>
        </dl>
      </aside>
    </div>
  )
}
```

---

### 8. Embed Code Generator (`/embed/:slotId`)

**Responsabilidade:**
- Gerar código de integração para parceiros
- Snippet HTML/JS
- Instruções de instalação
- Customização de parâmetros

**Dados Consumidos:**
```typescript
interface EmbedConfig {
  slotId: string
  siteId: string
  width: number
  height: number
  lazyLoad: boolean
  fallback?: string
}
```

**Edge Functions Chamadas:**
- Nenhuma

**Implementação:**
```tsx
// /pages/public/EmbedCodePage.tsx
export const EmbedCodePage: React.FC = () => {
  const { slotId } = useParams()
  const [config, setConfig] = useState<EmbedConfig>({
    slotId,
    siteId: '',
    width: 300,
    height: 250,
    lazyLoad: true
  })

  const generateCode = () => {
    return `<!-- ADS Connect Slot -->
<div 
  data-ads-slot="${config.slotId}"
  data-site-id="${config.siteId}"
  style="width: ${config.width}px; height: ${config.height}px;"
></div>

<script src="https://cdn.adsconnect.com/sdk/v1/ads-connect.min.js"></script>
<script>
  window.ADS_CONNECT_CONFIG = {
    siteId: '${config.siteId}',
    apiKey: 'YOUR_API_KEY',
    lazyLoad: ${config.lazyLoad}
  }
</script>`
  }

  return (
    <div className="embed-generator">
      <h1>Código de Integração</h1>
      
      <form>
        <label>
          Site ID:
          <input 
            value={config.siteId}
            onChange={(e) => setConfig({...config, siteId: e.target.value})}
          />
        </label>
        
        <label>
          Largura:
          <input 
            type="number"
            value={config.width}
            onChange={(e) => setConfig({...config, width: +e.target.value})}
          />
        </label>
        
        <label>
          Altura:
          <input 
            type="number"
            value={config.height}
            onChange={(e) => setConfig({...config, height: +e.target.value})}
          />
        </label>
        
        <label>
          <input 
            type="checkbox"
            checked={config.lazyLoad}
            onChange={(e) => setConfig({...config, lazyLoad: e.target.checked})}
          />
          Lazy Loading
        </label>
      </form>

      <pre className="code-block">
        <code>{generateCode()}</code>
      </pre>

      <button onClick={() => navigator.clipboard.writeText(generateCode())}>
        Copiar Código
      </button>
    </div>
  )
}
```

---

## 🔧 EDGE FUNCTIONS ADICIONAIS NECESSÁRIAS

### 9. `get-site-analytics`
```typescript
// Retornar analytics de um site específico
serve(async (req) => {
  const { siteId, period } = await req.json()
  
  // Calcular date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  // Buscar métricas
  const { data: impressions } = await supabase
    .from('impressions')
    .select('*', { count: 'exact' })
    .eq('site_id', siteId)
    .gte('timestamp', startDate.toISOString())

  const { data: clicks } = await supabase
    .from('clicks')
    .select('*', { count: 'exact' })
    .eq('site_id', siteId)
    .gte('timestamp', startDate.toISOString())

  // Calcular revenue
  const { data: slots } = await supabase
    .from('ad_slots')
    .select('revenue')
    .eq('site_id', siteId)

  const totalRevenue = slots?.reduce((sum, s) => sum + s.revenue, 0) || 0

  return new Response(JSON.stringify({
    metrics: {
      totalImpressions: impressions?.length || 0,
      totalClicks: clicks?.length || 0,
      ctr: ((clicks?.length || 0) / (impressions?.length || 1)) * 100,
      revenue: totalRevenue
    }
  }))
})
```

### 10. `validate-api-key`
```typescript
// Validar API key de site parceiro
serve(async (req) => {
  const apiKey = req.headers.get('X-API-Key')
  
  const { data: site } = await supabase
    .from('inventory')
    .select('id, site_id, site_name, status')
    .eq('api_key', apiKey)
    .eq('status', 'active')
    .single()

  if (!site) {
    return new Response('Invalid API key', { status: 401 })
  }

  return new Response(JSON.stringify({ valid: true, site }))
})
```

---

## 📊 NOVAS TABELAS NECESSÁRIAS

### `impressions`
```sql
CREATE TABLE impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id),
    slot_id UUID NOT NULL REFERENCES ad_slots(id),
    site_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    viewport_width INTEGER,
    viewport_height INTEGER,
    visibility_duration INTEGER,
    is_viewable BOOLEAN DEFAULT false,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_impressions_ad ON impressions(ad_id);
CREATE INDEX idx_impressions_slot ON impressions(slot_id);
CREATE INDEX idx_impressions_timestamp ON impressions(timestamp DESC);
```

### `clicks`
```sql
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id),
    slot_id UUID NOT NULL REFERENCES ad_slots(id),
    site_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    click_x INTEGER,
    click_y INTEGER,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clicks_ad ON clicks(ad_id);
CREATE INDEX idx_clicks_slot ON clicks(slot_id);
CREATE INDEX idx_clicks_timestamp ON clicks(timestamp DESC);
```

### `api_keys` (para sites parceiros)
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id TEXT NOT NULL REFERENCES inventory(site_id),
    key_hash TEXT NOT NULL UNIQUE,
    name TEXT,
    permissions JSONB DEFAULT '{}',
    rate_limit INTEGER DEFAULT 1000,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🎯 PERFORMANCE & SEO

### Otimizações
```typescript
// 1. CDN para SDK
// Servir ads-connect.js via Cloudflare/Fastly

// 2. Image optimization
// Usar Supabase Image Transformation
const optimizedUrl = `${creative.url}?width=300&quality=80&format=webp`

// 3. Lazy loading
// IntersectionObserver para carregar apenas quando visível

// 4. Caching
// Cache-Control headers para Edge Functions
headers: {
  'Cache-Control': 'public, max-age=3600, s-maxage=7200'
}

// 5. Preconnect
<link rel="preconnect" href="https://api.adsconnect.com">
<link rel="dns-prefetch" href="https://cdn.adsconnect.com">
```

### SEO
```html
<!-- Marcar ads como sponsored -->
<div class="ads-slot" rel="sponsored">
  <a href="..." rel="nofollow sponsored">
    <img src="..." alt="Advertisement">
  </a>
</div>

<!-- Schema.org markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WPAdBlock",
  "position": "header"
}
</script>
```

---

## 📋 RESUMO EXECUTIVO

### Páginas Criadas: 8
1. ✅ SDK Integration (`/sdk/ads-connect.js`)
2. ✅ Ad Rendering Component (`AdSlot.tsx`)
3. ✅ Impression Tracking (`/api/track-impression`)
4. ✅ Click Tracking (`/api/track-click`)
5. ✅ Ad Serving (`/api/serve-ad`)
6. ✅ Analytics Dashboard (`/public/analytics/:siteId`)
7. ✅ Ad Preview (`/preview/:adId`)
8. ✅ Embed Code Generator (`/embed/:slotId`)

### Edge Functions: 6
1. ✅ `serve-ad`
2. ✅ `track-impression`
3. ✅ `track-click`
4. ✅ `get-site-analytics`
5. ✅ `validate-api-key`
6. ✅ `calculate-revenue` (já existe)

### Novas Tabelas: 3
1. ✅ `impressions`
2. ✅ `clicks`
3. ✅ `api_keys`

---

**Status:** Arquitetura completa e pronta para implementação  
**Próximo:** Implementar SDK e Edge Functions prioritárias
