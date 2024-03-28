const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const path = require('path');
const app = express();
const conn = require('./exports/postgresql');

// Carregando a chave privada e o certificado
const privateKey = fs.readFileSync('code.key');
const certificate = fs.readFileSync('code.crt');
const credentials = { key: privateKey, cert: certificate };

// Configurando o servidor HTTPS
const httpsServer = https.createServer(credentials, app);

// Sessão
app.use(cookieSession({
    name: 'session',
    keys: ['asjdkh1o2ho.3838389y9ajs.hdhh81h2hd', 'asdd1j92y93y7bb.hdhbdiuhd91h.9h27gbjm.xmc9'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Configurações de comportamento e CORS
app.use(cors());
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public/css')));
app.use(express.static(path.join(__dirname, '/public/imgs')));
app.use(express.static(path.join(__dirname, '/public/imgs/icons')));

//Logout
app.get('/logout', (req, res) => {
    // Destroi a session
    req.session = null;
    res.redirect('/');
});

//verificando rotas de acesso
app.get("/",(req,res) => { (req.session.loggedin) ? res.redirect("/home") : res.redirect("/login"); });

// login
app.get('/login', (req, res) => { (!req.session.loggedin) ? res.render(path.join(__dirname + '/public/views/login.ejs')) : res.redirect("/"); });

// home
app.get('/home', (req, res) => { (req.session.loggedin) ? res.render(path.join(__dirname + '/public/views/home.ejs'), { perm: req.session.permission_level }) : res.redirect("/"); });

// Pagina registro de etiqueta
app.get('/register', (req, res) => { (req.session.loggedin) ? res.render(path.join(__dirname + '/public/views/register.ejs')) : res.redirect("/"); });

// Pagina status de etiqueta
app.get('/status', (req, res) => { (req.session.loggedin) ? res.render(path.join(__dirname + '/public/views/status.ejs')) : res.redirect("/"); });

// Pagina Banco de dados de etiqueta
app.get('/database', (req, res) => { (req.session.loggedin) ? res.render(path.join(__dirname + '/public/views/database.ejs')) : res.redirect("/"); });

// Pagina gerenciamento de usuarios
app.get('/users', (req, res) => { (req.session.loggedin) ? res.render(path.join(__dirname + '/public/views/users.ejs')) : res.redirect("/"); });

////////////////////////////////////////////////// API ///////////////////////////////////////////////
// REST API (GET) -> Gets internal assets data based on the qrcode
app.get('/restapi_v1/assets/internal/:id', (req, res) => {
    // Pegando o body para verificação no banco de dados
    const id = req.params.id;
    console.log(id);

    // Puxando informações, vou fazer de forma ficticia apenas para demonstrar
    const jsonObj = {
        name: 'Nome de testes',
        localization: 'Rua De testes, 877 - Bairro de testes - Cidade - SP',
        loc_internal: 'Empresa X - 01/1',
        code: 'NA02013001',
        depart: 'RH',
        being_used: true
    }

    // Mandano a resposta
    try {
        res.status(200).json(jsonObj);
    } catch (error) {
        console.log('Erro : ' + error);
        res.status(400).json( {message: 'Erro ao puxar informações da API'} );
    }
});

// REST API (POST) -> Auth the user.
app.post('/restapi_v1/auth', async (req, res) => {
    // Pegando o body para verificação no banco de dados
    const user = req.body.user;
    const password = req.body.pass;

    // Validando na DB
    if((user.length >= 4 && password.length >= 6) && (user.length < 16 && password.length < 18))
    {  
        // Login Query
        const userExists = await conn.query(`SELECT * FROM users WHERE "user" = '${user}';`);

        // Verificando se o banco de dados retornou alguma informação.
        if (userExists.rows.length > 0)
        {
            // Crypt encripta a senha bruta, e compara a hash com o do banco.
            if (await bcrypt.compare(password, userExists.rows[0].pass))
            {
                // Cookies
                req.session.loggedin = true;
                req.session.user = userExists.rows[0].user;
                req.session.userid = userExists.rows[0].id;
                req.session.permission_level = userExists.rows[0].permission;
                
                // Redirect to home page
                return res.redirect("/");
            } 
            else
            {
                //warning = "A senha digitada não corresponde com a senha cadastrada.";
                return res.redirect("/");
            } 
        } 
        else
        {
            //warning = "Não existe uma conta cadastrada com este usuario.";
            return res.redirect("/");
        }
    } 
    else
    {
        //warning = "Usuario ou senha invalidos.";
        return res.redirect("/");
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

// Servindo o webapp
httpsServer.listen(443, () => {
    console.log('Servidor HTTPS iniciado na porta 443');
});