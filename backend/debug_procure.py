from importlib import import_module
from sqlalchemy import text
import os
os.chdir('d:/millet-dashboard/backend')
db = import_module('app.database')
with db.engine.connect() as conn:
    rs = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='procurement' ORDER BY ordinal_position"))
    print(list(rs))