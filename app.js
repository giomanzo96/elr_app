require('dotenv').config(); // carica le variabili d'ambiente dal file .env

const express = require('express');
const path = require('path'); // importa il modulo path per gestire i percorsi dei file
const ejsMate = require('ejs-mate');
const { Pool } = require('pg'); // importa il modulo pg per interagire con il database PostgreSQL. Pool è una classe che gestisce un pool di connessioni al database, consentendo di eseguire query in modo efficiente e scalabile.

const pool = new Pool({  // crea un nuovo pool di connessioni al database utilizzando le variabili d'ambiente per la configurazione
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL non configurata. Aggiungila tra le variabili d ambiente di Vercel.');
}


app.engine('ejs', ejsMate); // imposta ejs-mate come motore di rendering per i file .ejs
app.set('view engine', 'ejs'); // imposta ejs come motore di rendering predefinito
app.set('views', path.join(__dirname, 'views')); // imposta la cartella 'views' come directory per i file di visualizzazione


app.use(express.urlencoded({ extended: true })); // middleware per parsare i dati del corpo delle richieste POST
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/operations/index', (req, res) => {
    res.render('operations/index');
});

app.get('/operations/visita', (req, res) => {
    res.render('operations/visita');
});

app.get('/operations/cliente', (req, res) => {
    res.render('operations/cliente');
});

app.post('/operations/cliente', async (req, res) => {
    try {
        const { nome, cognome, telefono, email, note } = req.body;

        const sql = `
            INSERT INTO clienti_acquisizione 
            (nome, cognome, telefono, email, note)
            VALUES ($1, $2, $3, $4, $5)
        `;

        const values = [nome, cognome, telefono, email, note];

        await pool.query(sql, values);

        res.redirect('/');
    } catch (err) {
        console.error('Errore inserimento cliente:', err);
        res.status(500).send('Errore durante il salvataggio del cliente.');
    }

});

app.get('/fine_demo', (req, res) => {
    res.render('operations/fine_demo');
});


if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server in ascolto sulla porta ${PORT}`);
    });
}

module.exports = app;
