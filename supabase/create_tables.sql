-- Crea la tabella immobili
CREATE TABLE IF NOT EXISTS app.immobili (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codice TEXT NOT NULL UNIQUE,
    mandato TEXT NOT NULL
);

