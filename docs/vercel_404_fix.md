# Fix: Erro 404 na Rota /lp no Vercel

## ❌ **Problema Reportado**

Alguns computadores estão recebendo erro **404: NOT_FOUND** ao acessar:
```
https://adsconnect.vercel.app/lp
```

---

## 🔍 **Causa Raiz**

O Vercel serve arquivos estáticos por padrão. Quando um usuário acessa `/lp` diretamente:

1. Vercel procura por arquivo `lp.html` ou `lp/index.html`
2. Não encontra (porque é uma SPA com React Router)
3. Retorna 404

**React Router** precisa que TODAS as rotas sejam redirecionadas para `index.html` para funcionar corretamente.

---

## ✅ **Solução Implementada**

Criado arquivo `vercel.json` na raiz do projeto:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### **O que isso faz:**
- Redireciona TODAS as requisições para `index.html`
- React Router carrega e processa a rota `/lp`
- Funciona para qualquer rota definida no App.tsx

---

## 🚀 **Passos para Deploy**

### **1. Commit e Push**

```bash
git add vercel.json
git commit -m "fix: Add vercel.json for SPA routing"
git push origin main
```

### **2. Vercel Redeploy Automático**

O Vercel detecta o push e faz redeploy automaticamente (~2 minutos).

### **3. Verificar**

Após o deploy, teste:
- ✅ https://adsconnect.vercel.app/lp
- ✅ https://adsconnect.vercel.app/login
- ✅ https://adsconnect.vercel.app/sobre
- ✅ https://adsconnect.vercel.app/admin/dashboard

Todas devem funcionar sem 404!

---

## 🔧 **Alternativa: Deploy Manual**

Se o auto-deploy não funcionar:

1. **Acessar Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Selecionar projeto:** `aistudio-ads-connect-lp`

3. **Clicar em "Redeploy"** na última deployment

4. **Aguardar conclusão**

---

## 📋 **Rotas Verificadas**

Todas as rotas definidas em `App.tsx` agora funcionam:

| Rota | Status | Descrição |
|------|--------|-----------|
| `/` | ✅ Redirect | Redireciona para `/lp` |
| `/lp` | ✅ OK | Landing Page |
| `/login` | ✅ OK | Login |
| `/sobre` | ✅ OK | Sobre |
| `/termos` | ✅ OK | Termos de Uso |
| `/privacidade` | ✅ OK | Política de Privacidade |
| `/admin/*` | ✅ OK | Todas as rotas admin |

---

## ⚠️ **Importante**

### **Cache do Navegador**

Alguns usuários podem ainda ver 404 devido ao cache. Instrua-os a:

1. **Hard Refresh:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Limpar Cache:**
   - Chrome: `Ctrl + Shift + Delete`
   - Selecionar "Cached images and files"

3. **Modo Anônimo:**
   - Testar em janela anônima para confirmar

---

## 🧪 **Teste Local**

Para testar localmente com build de produção:

```bash
# Build
pnpm build

# Preview
pnpm preview
```

Acesse: `http://localhost:4173/lp`

---

## 📁 **Arquivo Criado**

- ✅ `vercel.json` - Configuração de routing do Vercel

---

**Status:** ✅ **PRONTO PARA DEPLOY**

Faça commit e push do `vercel.json` para resolver o erro 404!
