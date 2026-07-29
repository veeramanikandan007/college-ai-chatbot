
import sqlite3
conn = sqlite3.connect("./database/campusmate.db")
conn.execute("DROP TABLE IF EXISTS notifications")
conn.commit()
conn.close()

from app.database.init_db import init_db
init_db()
print("Database schema fixed!")

