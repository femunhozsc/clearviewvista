# 🚀 Instruções de Deploy - Clearview Vista

## 📋 Pré-requisitos

- Conta no Vercel (para frontend)
- Conta no Render (para backend)
- Repositório Git (GitHub, GitLab ou Bitbucket)

## 🌐 Deploy do Frontend (Vercel)

### Passo 1: Preparar o Repositório

1. **Crie um repositório Git** e faça upload dos arquivos:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Clearview Vista Multi-Page"
   git remote add origin https://github.com/seu-usuario/clearview-vista.git
   git push -u origin main
   ```

### Passo 2: Configurar no Vercel

1. **Acesse** [vercel.com](https://vercel.com) e faça login
2. **Clique em "New Project"**
3. **Conecte seu repositório Git**
4. **Configure o projeto**:
   - Framework Preset: `Other`
   - Root Directory: `./` (ou onde estão os arquivos)
   - Build Command: (deixe vazio)
   - Output Directory: `./`
   - Install Command: `npm install`

### Passo 3: Variáveis de Ambiente (se necessário)

No painel do Vercel, vá em Settings > Environment Variables e adicione:
```
API_URL=https://seu-backend.onrender.com
```

### Passo 4: Deploy

1. **Clique em "Deploy"**
2. **Aguarde o build** (geralmente 1-2 minutos)
3. **Teste a URL gerada** pelo Vercel

## 🔧 Deploy do Backend (Render)

### Passo 1: Preparar o Backend

1. **Certifique-se que o arquivo `requirements.txt` está atualizado**:
   ```txt
   Flask==2.3.3
   Flask-CORS==4.0.0
   yfinance==0.2.18
   requests==2.31.0
   pandas==2.0.3
   numpy==1.24.3
   ```

2. **Verifique se `app.py` está configurado para produção**:
   ```python
   if __name__ == '__main__':
       port = int(os.environ.get('PORT', 5000))
       app.run(host='0.0.0.0', port=port, debug=False)
   ```

### Passo 2: Configurar no Render

1. **Acesse** [render.com](https://render.com) e faça login
2. **Clique em "New +" > "Web Service"**
3. **Conecte seu repositório Git**
4. **Configure o serviço**:
   - Name: `clearview-vista-api`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
   - Instance Type: `Free` (ou conforme necessário)

### Passo 3: Variáveis de Ambiente

No painel do Render, adicione as variáveis necessárias:
```
PORT=5000
FLASK_ENV=production
```

### Passo 4: Deploy

1. **Clique em "Create Web Service"**
2. **Aguarde o build** (pode levar 5-10 minutos)
3. **Teste a URL da API** gerada pelo Render

## 🔗 Conectar Frontend e Backend

### Atualizar URL da API no Frontend

1. **Edite o arquivo `data_loader.js`** ou onde a API é chamada
2. **Substitua a URL local** pela URL do Render:
   ```javascript
   // Antes
   const apiUrl = 'http://localhost:5000';
   
   // Depois
   const apiUrl = 'https://seu-app.onrender.com';
   ```

3. **Faça commit e push** das alterações
4. **O Vercel fará redeploy automaticamente**

## ✅ Verificação do Deploy

### Teste o Frontend
1. Acesse a URL do Vercel
2. Verifique se a página inicial carrega
3. Teste a navegação entre páginas
4. Verifique se os dados carregam corretamente

### Teste o Backend
1. Acesse `https://seu-backend.onrender.com/health` (se implementado)
2. Teste endpoints específicos como `/api/ativo/PETR4`
3. Verifique logs no painel do Render

## 🐛 Solução de Problemas Comuns

### Frontend não carrega dados
- **Verifique** se a URL da API está correta
- **Confirme** se o backend está rodando
- **Verifique** configurações de CORS

### Erro 404 em rotas específicas
- **Confirme** se `vercel.json` está configurado corretamente
- **Verifique** se o roteamento client-side está funcionando

### Backend com erro 500
- **Verifique** logs no painel do Render
- **Confirme** se todas as dependências estão instaladas
- **Teste** endpoints localmente primeiro

### Problemas de CORS
- **Verifique** se Flask-CORS está instalado
- **Confirme** configuração no backend:
   ```python
   from flask_cors import CORS
   CORS(app, origins=['https://seu-frontend.vercel.app'])
   ```

## 📊 Monitoramento

### Vercel Analytics
- Ative analytics no painel do Vercel
- Monitore performance e uso

### Render Logs
- Acesse logs em tempo real no painel
- Configure alertas para erros

## 🔄 Atualizações Futuras

### Processo de Atualização
1. **Faça alterações** no código local
2. **Teste localmente** com `npm start`
3. **Commit e push** para o repositório
4. **Deploy automático** será acionado

### Rollback em Caso de Problemas
- **Vercel**: Use o painel para fazer rollback para versão anterior
- **Render**: Redeploy de commit anterior via painel

## 📞 Suporte Adicional

### Documentação Oficial
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)

### Comandos Úteis
```bash
# Testar localmente
npm start

# Verificar logs do Vercel
vercel logs

# Verificar status do deploy
vercel ls
```

---

**⚠️ Importante**: Sempre teste localmente antes de fazer deploy para produção!

