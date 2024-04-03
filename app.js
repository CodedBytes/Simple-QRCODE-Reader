const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const path = require('path');
const app = express();
const conn = require('./exports/postgresql');
const jwt  = require('jsonwebtoken');
const bodyParser  = require('body-parser');

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
    maxAge: 24 * 60 * 60 * 1000,// 24 hours
    secure: true, // Define o cookie como seguro (só será enviado sobre HTTPS)
    httpOnly: true // Define o cookie como acessível apenas pelo servidor 
}));

// JWT SECRET
const SECRET_KEY = 'sdj8FHH82yKNJFSW9U.JHJDMjdj83yEW.9h27188';

// MiddleWare para checar o token passado.
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[0];
        req.token = bearerToken;

        // Verificar se o token é válido e não expirou
        jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
            if (err) {
                res.status(403).json({ message: 'Token inválido ou expirado' });
            } else {
                req.decodedToken = decoded;
                next();
            }
        });
    } else {
        res.status(403).json({ message: 'Token não fornecido' });
    }
}

// Configurações de comportamento e CORS
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public/css')));
app.use(express.static(path.join(__dirname, '/public/js')));
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
//  API Totalmente aberta, geralmente possui validação JWT [Em Processo de desenvolvimento]
//////////////////////////////////////////////////////////////////////////////////////////////////////

// REST API (GET) -> Gets internal assets data based on the qrcode
app.get('/restapi_v1/assets/internal/:assetcode', verifyToken, async (req, res) => {
    // Pegando o body para verificação no banco de dados
    const assetCode = req.params.assetcode;
    console.log(assetCode);

    const asset = await conn.query(`SELECT * FROM assets_internal WHERE "codigo" = '${assetCode}';`);
    if(asset.rows.length > 0)
    {
        // Pega os resultados da db e coloca dentro de um objeto.
        const APIReturn = {
            has_info: true,
            name: asset.rows[0].nome,
            localization: asset.rows[0].localizacao,
            loc_internal: asset.rows[0].loc_interna,
            code: asset.rows[0].codigo,
            depart: asset.rows[0].departamento,
            created_by: asset.rows[0].created_by,
            being_used: asset.rows[0].em_uso
        };

        // Manda o resultado para o cliente
        return res.status(200).json(APIReturn);
    }
    else
    {
        // Manda o resultado para o cliente criar um asset
        return res.status(200).json({ has_info: false });
    }
});

// REST API (GET) -> Gets all the internal assets on the database
app.get('/restapi_v1/assets/internal/', verifyToken, async (req, res) => {
    // Pegando o body para verificação no banco de dados
    const asset = await conn.query(`SELECT * FROM assets_internal ORDER BY "criado";`);
    if(asset.rows.length > 0)
    {
        // Pega os resultados da db e coloca dentro de um objeto.
        const returnArray = [];
        for (let i = 0; i < asset.rows.length; i++) {
            const APIReturn = {
                has_info: true,
                name: asset.rows[0].nome,
                localization: asset.rows[0].localizacao,
                loc_internal: asset.rows[0].loc_interna,
                code: asset.rows[0].codigo,
                depart: asset.rows[0].departamento,
                created_by: asset.rows[0].created_by,
                being_used: asset.rows[0].em_uso
            };

            // Adiciona o objeto a array.
            returnArray.push(APIReturn);
        }

        // Manda o resultado para o cliente.
        return res.status(200).json(returnArray);
    }
    else
    {
        // Manda o resultado para o cliente criar um asset.
        return res.status(200).json({ has_info: false });
    }
});

// REST API (Basic OAUTH 2.0) -> Gets the api token
app.get('/restapi_v1/auth/token', async (req, res) => {
    const username = req.session.user;

    // Login Query
    const userExists = await conn.query(`SELECT * FROM users WHERE "user" = '${username}';`);
    if (userExists.rows.length === 0) 
    { 
        return res.status(401).json({ message: 'Credenciais inválidas' }); 
    }
    else 
    {
        // Gerar token JWT
        const token = jwt.sign({ id: userExists.rows[0].id, username: userExists.rows[0].user }, SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ access_token: token });
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