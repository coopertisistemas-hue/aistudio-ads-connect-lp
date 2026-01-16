# Configuração de Variáveis de Ambiente

## ❌ **Erro Atual**

```
Failed to load resource: the server responded with a status of 500
lib/supabase.ts:1
```

**Causa:** Variáveis de ambiente do Supabase não configuradas.

---

## ✅ **Solução Rápida**

### **1. Obter Chaves do Supabase**

Acesse: [Supabase Dashboard](https://supabase.com/dashboard/project/hwugnqevkeymqoahnwfb/settings/api)

Copie:
- **Project URL:** `https://hwugnqevkeymqoahnwfb.supabase.co`
- **anon/public key:** (chave pública, segura para frontend)
- **service_role key:** (chave privada, apenas backend)

---

### **2. Criar Arquivo `.env`**

Na raiz do projeto, crie o arquivo `.env`:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

---

### **3. Preencher Variáveis**

Edite `.env` com suas chaves:

```env
VITE_SUPABASE_URL=https://hwugnqevkeymqoahnwfb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **IMPORTANTE:** Nunca commite o arquivo `.env` no Git!

---

### **4. Reiniciar Dev Server**

```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
pnpm dev
```

---

## 📁 **Arquivos Criados**

- ✅ `.env.example` - Template com variáveis necessárias
- ⚠️ `.env` - **VOCÊ PRECISA CRIAR** com suas chaves reais

---

## 🔒 **Segurança**

### **Arquivo `.gitignore`**

Verifique se `.env` está no `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### **Chaves Públicas vs Privadas**

| Chave | Uso | Segurança |
|-------|-----|-----------|
| `VITE_SUPABASE_ANON_KEY` | Frontend | ✅ Segura (com RLS) |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Backend/Admin | ⚠️ Nunca expor |

---

## ✅ **Verificar Configuração**

Após configurar, verifique no console do navegador:

```javascript
// Deve retornar true
console.log(isSupabaseConfigured())
```

---

**Status:** ⚠️ **AGUARDANDO CONFIGURAÇÃO**

Crie o arquivo `.env` com suas chaves do Supabase para continuar!
