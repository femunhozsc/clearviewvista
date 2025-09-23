const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Serve arquivos estáticos
app.use(express.static(__dirname));

// Redireciona todas as rotas para index.html (para suporte a client-side routing)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

