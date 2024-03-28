const { Pool } = require('pg');

const conn = new Pool({ connectionString: 'postgres://openpg:openpgpwd@127.0.0.1:5432/qrscanner', });

// Conecta com a DB
conn.connect((error)=>{
    if(error) throw error;
    else console.log('Database conectada !');
});

// Exportando modulo.
module.exports = conn;