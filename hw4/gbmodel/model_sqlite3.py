"""
A simple musicbook flask app.
Data is stored in a SQLite database that looks something like the following:

+------------+--------+-----------------+-----------------+------------+------------+-----------------+
| Name       | Genre  | performed by    | written by      | date made       lyrics       url
+============+========+=================+=================+============+============+=================+
| Thriller   | pop    | Michael Jackson | Michael Jackson | 11-20-1982   too long      also too long
+------------+--------+-----------------+-----------------+------------+------------+-----------------+


This can be created with the following SQL (see bottom of this file):

    create table musicbook (name text, genre varchar, performed text, written text, dates DATE not NULL, lyrics TEXT, url varchar(2083));

"""
from datetime import date
from .Model import Model
import sqlite3
DB_FILE = 'entries.db'    # file for our Database

class model(Model):
    def __init__(self):
        # Make sure our database exists
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        try:
            cursor.execute("select count(rowid) from musicbook")
        except sqlite3.OperationalError:
            cursor.execute("""
                CREATE TABLE musicbook (
                    name TEXT,
                    genre VARCHAR(255),
                    performed TEXT,
                    written TEXT,
                    dates DATE NOT NULL,
                    lyrics TEXT,
                    url VARCHAR(2083)
                )
            """)
        cursor.close()

    def select(self):
        """
        Gets all rows from the database
        Each row contains: name, email, date, message
        :return: List of lists containing all rows of database
        """
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM musicbook")
        return cursor.fetchall()

        """
            insert function for inserting the data into the sqlite along with the params
            and data types, than after executing sql style code to insert
        """

    def insert(self, name, genre, performed, written, dates, lyrics, url):
        """
        Inserts an entry into the database.
        :param name: String
        :param genre: varchar
        :param performed: string
        :param written: string
        :param dates: date
        :param lyrics: text
        :param url: varchar
        :return: True
        """
        params = {
            'name': name, 
            'genre': genre, 
            'performed': performed, 
            'written': written, 
            'dates': dates, 
            'lyrics': lyrics, 
            'url': url
        }
        connection = sqlite3.connect(DB_FILE)
        cursor = connection.cursor()
        cursor.execute("""insert into musicbook (name, genre, performed, written, dates, lyrics, url) 
                       VALUES (:name, :genre, :performed, :written, :dates, :lyrics, :url)""", params)
        connection.commit()
        cursor.close()
        return True
