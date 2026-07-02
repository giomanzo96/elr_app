import pandas as pd
import os
import psycopg
import logging
from dotenv import load_dotenv

# LOAD ENVIRONMENT VARIABLES
load_dotenv()
SUPABASE_URL = os.environ["SUPABASE_URL"]
TABLE_NAME = "immobili"

# LOGGIN CONFIGURATION
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# DATA EXTRACTION AND TRANSFORMATION
try:
    immobili = pd.read_csv("upload_immobili\\immobili.csv", usecols=['Agente', 'Nome', 'Incarico', 'Scadenza'])
    immobili = immobili.rename(columns={
        'Agente': 'agente',
        'Nome': 'codice',
        'Incarico': 'incarico',
        'Scadenza': 'scadenza'
    })
    immobili["scadenza"] = pd.to_datetime(
        immobili["scadenza"],
        format="%d/%m/%Y",
        errors="coerce"
    ).dt.date

    logger.info(f"Data extracted and transformed. Number of rows: {len(immobili)}")
except Exception:
    logger.exception("Data extraction/transformation failed.")
    raise

# DATA LOADING TO DATABASE
try:
    with psycopg.connect(SUPABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(f"TRUNCATE TABLE {TABLE_NAME} RESTART IDENTITY;")

            columns = list(immobili.columns)

            placeholders = ", ".join(["%s"] * len(columns)) # Create a string of psycopg placeholders for the SQL query
            column_names = ", ".join(columns)

            insert_sql = f"""
                INSERT INTO {TABLE_NAME} ({column_names})
                VALUES ({placeholders})
            """

            rows = [
                tuple(row)
                for row in immobili.itertuples(index=False, name=None)
            ]

            cur.executemany(insert_sql, rows)

        conn.commit()
        logger.info(f"Data correctly uploaded to Supabase table '{TABLE_NAME}'.")
except Exception:
    logger.exception(f"Data upload to Supabase failed.")
    raise