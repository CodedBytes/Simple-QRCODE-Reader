const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();

// Carregando a chave privada e o certificado
const privateKey = fs.readFileSync('code.key');
const certificate = fs.readFileSync('code.crt');
const credentials = { key: privateKey, cert: certificate };

// Configurando o servidor HTTPS
const httpsServer = https.createServer(credentials, app);

// Configurações de comportamento e CORS
app.use(cors());
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public/css')));

// Pagina
app.get('/', (req, res) => { res.render(path.join(__dirname + '/public/views/index.ejs')); });

// Servindo o webapp
httpsServer.listen(443, () => {
    console.log('Servidor HTTPS iniciado na porta 443');
});