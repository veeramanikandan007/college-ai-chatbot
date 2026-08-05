import os
import sqlite3
import re

db_path = r'c:\Users\devha\OneDrive\Desktop\campusmate\CollegeMate\backend\database\campusmate.db'
try:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        old_greeting = "Hello! Vanakkam! Welcome to CampusMate AI Assistant. I'm here to help you with any questions or concerns you may have about college life, academics, or anything else. How can I assist you today?"
        new_greeting = "Hello! Vanakkam! Welcome to CollegeMate AI Assistant. I'm here to help you with your academic journey, college information, campus services, assignments, placements, schedules, and much more. How can I assist you today?"
        
        cursor.execute("UPDATE chat_messages SET content = REPLACE(content, ?, ?)", (old_greeting, new_greeting))
        cursor.execute("UPDATE chat_messages SET content = REPLACE(content, 'CampusMate', 'CollegeMate')")
        cursor.execute("UPDATE chat_sessions SET title = REPLACE(title, 'CampusMate', 'CollegeMate')")
        
        conn.commit()
        conn.close()
        print('Updated DB successfully.')
    else:
        print('DB not found.')
except Exception as e:
    print('Error updating DB:', e)

search_dir = r'c:\Users\devha\OneDrive\Desktop\campusmate\CollegeMate'
exclude_dirs = {'.git', 'node_modules', '.venv', 'dist', '__pycache__', 'database'}

modified_files = []

def smart_replace(text):
    text = text.replace('campusmate.db', '__TEMP_DB__')
    
    text = re.sub(r'CampusMate', 'CollegeMate', text)
    text = re.sub(r'campusmate(?!_)', 'collegemate', text)
    text = re.sub(r'Campus Mate', 'College Mate', text)
    
    text = text.replace('__TEMP_DB__', 'campusmate.db')
    return text

for root, dirs, files in os.walk(search_dir):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(('.pyc', '.png', '.jpg', '.db', 'replace_script.py')):
            continue
        filepath = os.path.join(root, file)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            new_content = smart_replace(content)
            
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files.append(filepath)
        except Exception as e:
            pass

print('Modified', len(modified_files), 'files:')
for m in modified_files:
    print(m)
