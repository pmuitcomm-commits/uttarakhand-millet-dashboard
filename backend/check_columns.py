from app.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'procurement'"))
    print('Columns in procurement table:')
    for row in result:
        print(row[0])