# Guia Rápido: Gestão de Sites Parceiros

## 🎯 **Criada Página de Admin**

**Arquivo:** `pages/admin/AdminSitesPage.tsx`

### **Funcionalidades:**
- ✅ Listar todos os sites parceiros
- ✅ Criar novo site parceiro (API key gerada automaticamente)
- ✅ Aprovar/rejeitar sites
- ✅ Regenerar API keys
- ✅ Ver detalhes e métricas
- ✅ Filtrar por status
- ✅ Buscar por nome/domínio

---

## 🚀 **Como Usar**

### **1. Aplicar SQL da Função RPC**

Execute no **Supabase Dashboard > SQL Editor**:

```sql
-- Arquivo: supabase/sql/regenerate_api_key_function.sql
CREATE OR REPLACE FUNCTION regenerate_site_api_key(site_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    new_api_key TEXT;
BEGIN
    new_api_key := encode(gen_random_bytes(32), 'hex');
    
    UPDATE partner_sites
    SET api_key_hash = new_api_key, updated_at = NOW()
    WHERE id = site_uuid;
    
    INSERT INTO audit_logs (action, entity_type, entity_id, details, created_at)
    VALUES ('update', 'partner_site', site_uuid::TEXT,
            jsonb_build_object('action', 'api_key_regenerated', 'timestamp', NOW()),
            NOW());
    
    RETURN new_api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### **2. Adicionar Rota no App**

Adicione no arquivo de rotas (App.tsx ou similar):

```tsx
import AdminSitesPage from './pages/admin/AdminSitesPage';

// Dentro das rotas admin:
<Route path="/admin/sites" element={<AdminSitesPage />} />
```

---

### **3. Acessar no Admin Console**

Navegue para: `http://localhost:5173/admin/sites`

---

## 📝 **Fluxo de Criação de Site**

1. **Clicar em "Novo Site"**
2. **Preencher formulário:**
   - Nome do Site
   - Slug (URL-friendly)
   - Domínio
   - URL Homepage
   - Categoria
   - Tipo de Site
   - Email do Proprietário
   - Revenue Share (%)

3. **Submeter** → API Key gerada automaticamente!

4. **Copiar API Key** (mostrada no toast por 10 segundos)

5. **Aprovar Site** (se status = pending)

---

## 🔑 **Usar API Key no Site Parceiro**

Após criar o site e copiar a API key:

```html
<script src="/ads-connect-sdk.js"></script>
<script>
  ADSConnect.init({
    siteId: 'id-do-site-copiado',
    apiKey: 'api-key-copiada',
    supabaseUrl: 'https://hwugnqevkeymqoahnwfb.supabase.co',
  });
</script>
```

---

## 📊 **Recursos da Página**

### **Tabela de Sites:**
- Nome e domínio
- Categoria
- Status (ativo/pendente/suspenso)
- Status de aprovação
- API Key (primeiros 12 caracteres)
- Métricas (impressões, cliques)

### **Ações:**
- **Ver Detalhes** → Drawer com informações completas
- **Aprovar** → Ativa o site (só para pendentes)
- **Regenerar API Key** → Gera nova key (revoga a antiga)

### **Filtros:**
- Busca por nome/domínio
- Filtro por status

---

## ✅ **Próximos Passos**

1. ✅ Aplicar SQL da função RPC
2. ✅ Adicionar rota no App
3. ✅ Acessar `/admin/sites`
4. ✅ Criar primeiro site parceiro
5. ✅ Copiar API key
6. ✅ Integrar no site parceiro usando SDK

---

**Tudo pronto para gerenciar sites parceiros pelo Admin Console!** 🎉
