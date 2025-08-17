// db.js
import pkg from "pg";
const { Pool } = pkg;

// Railway fournit DATABASE_URL automatiquement dans les variables d'environnement
// Exemple : postgresql://user:password@host:port/db
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // nécessaire pour Railway
    },
});

// Fonction helper pour exécuter des requêtes
export const query = (text, params) => {
    return pool.query(text, params);
};

// (optionnel) tester la connexion au démarrage
(async () => {
    try {
        await pool.query("SELECT NOW()");
        console.log("✅ Connexion PostgreSQL réussie !");
    } catch (err) {
        console.error("❌ Erreur de connexion PostgreSQL :", err);
    }
})();
