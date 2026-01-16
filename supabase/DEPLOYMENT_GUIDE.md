# Supabase Deployment Guide — ADS Connect Admin

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Supabase CLI instalado: `npm install -g supabase`
3. Projeto Supabase criado

---

## 🚀 Passo 1: Inicializar Supabase

```bash
# Login no Supabase
supabase login

# Link ao projeto (substitua com seu project-id)
supabase link --project-ref YOUR_PROJECT_ID

# Verificar conexão
supabase status
```

---

## 🗄️ Passo 2: Aplicar Migration

```bash
# Aplicar migration ao banco de dados
supabase db push

# Ou aplicar migration específica
supabase migration up
```

**Verificação:**
- Acesse o Supabase Dashboard → Database → Tables
- Confirme que todas as 15 tabelas foram criadas
- Verifique RLS policies em cada tabela

---

## ⚡ Passo 3: Deploy Edge Functions

```bash
# Deploy todas as functions
supabase functions deploy calculate-subscription-mrr
supabase functions deploy process-invoice-payment
supabase functions deploy sync-inventory-stats
supabase functions deploy generate-audit-report

# Ou deploy todas de uma vez
supabase functions deploy
```

**Verificação:**
- Acesse Supabase Dashboard → Edge Functions
- Confirme que as 4 functions estão ativas
- Teste cada function via dashboard

---

## 🔑 Passo 4: Configurar Environment Variables

### No Supabase Dashboard:
1. Vá em Settings → API
2. Copie:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

### No projeto local:

Crie `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ IMPORTANTE:** Nunca commite o `service_role` key no código!

---

## 📦 Passo 5: Configurar Storage Buckets

```bash
# Via Supabase Dashboard → Storage → New Bucket

# Ou via SQL:
```

```sql
-- Bucket para criativos (público)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('creatives', 'creatives', true);

-- Bucket para contratos (privado)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contracts', 'contracts', false);

-- Bucket para avatars (público)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- RLS para storage
CREATE POLICY "Admins can upload creatives"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'creatives');

CREATE POLICY "Public can view creatives"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'creatives');

CREATE POLICY "Admins can upload contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Admins can view contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');
```

---

## 🔧 Passo 6: Atualizar Services

### Criar Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Exemplo: Migrar creativesService

**Antes (localStorage):**
```typescript
const data = JSON.parse(localStorage.getItem('creatives') || '[]')
```

**Depois (Supabase):**
```typescript
const { data, error } = await supabase
  .from('creatives')
  .select('*')
  .order('created_at', { ascending: false })
```

---

## 🧪 Passo 7: Testar

### Teste 1: CRUD Operations
```typescript
// Create
const { data, error } = await supabase
  .from('creatives')
  .insert({ name: 'Test', type: 'image' })

// Read
const { data } = await supabase
  .from('creatives')
  .select('*')

// Update
await supabase
  .from('creatives')
  .update({ name: 'Updated' })
  .eq('id', id)

// Delete
await supabase
  .from('creatives')
  .delete()
  .eq('id', id)
```

### Teste 2: RLS Policies
```typescript
// Deve funcionar apenas se autenticado
const { data, error } = await supabase
  .from('clients')
  .select('*')
```

### Teste 3: Edge Functions
```typescript
const { data, error } = await supabase.functions.invoke(
  'calculate-subscription-mrr'
)
console.log('MRR:', data.mrr)
```

---

## 📊 Passo 8: Migrar Dados do localStorage

```typescript
// scripts/migrate-to-supabase.ts
import { supabase } from './lib/supabase'

async function migrateCreatives() {
  // 1. Exportar do localStorage
  const localData = JSON.parse(localStorage.getItem('creatives') || '[]')
  
  // 2. Transformar dados
  const transformed = localData.map(item => ({
    name: item.name,
    type: item.type,
    url: item.url,
    // ... outros campos
  }))
  
  // 3. Importar para Supabase
  const { data, error } = await supabase
    .from('creatives')
    .insert(transformed)
  
  if (error) {
    console.error('Migration error:', error)
  } else {
    console.log(`Migrated ${data.length} creatives`)
  }
}

// Executar para cada módulo
migrateCreatives()
// migrateClients()
// migratePlans()
// etc...
```

---

## 🔄 Passo 9: Configurar Realtime (Opcional)

```typescript
// Subscrever a mudanças em tempo real
const subscription = supabase
  .channel('creatives-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'creatives'
    },
    (payload) => {
      console.log('Change received!', payload)
      // Atualizar UI
    }
  )
  .subscribe()
```

---

## ✅ Checklist de Deployment

- [ ] Migration aplicada (15 tabelas criadas)
- [ ] RLS policies ativas
- [ ] Edge Functions deployed (4)
- [ ] Storage buckets criados (3)
- [ ] Environment variables configuradas
- [ ] Supabase client configurado
- [ ] Services migrados de localStorage
- [ ] Dados migrados
- [ ] Testes de CRUD passando
- [ ] RLS policies testadas
- [ ] Edge Functions testadas
- [ ] Realtime configurado (opcional)

---

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- Verifique se a migration foi aplicada: `supabase db push`

### Erro: "new row violates row-level security"
- Verifique se o usuário está autenticado
- Confirme que as RLS policies estão corretas

### Erro: "Function not found"
- Verifique se a function foi deployed: `supabase functions list`
- Redeploy: `supabase functions deploy FUNCTION_NAME`

### Erro: "Invalid API key"
- Verifique se as env vars estão corretas
- Confirme que está usando `anon` key no client

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status:** Pronto para deployment  
**Próximo:** Migrar services e testar
