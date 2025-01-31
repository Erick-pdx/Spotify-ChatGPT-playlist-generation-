"""
The general outline of my entries and the funtions that will be called
that will call the background functions but they will have this data
"""

class Model():
    def select(self):
        """
        Gets all entries from the database
        :return: Tuple containing all rows of database
        """
        pass

    def insert(self, name, genre, performed, written, date, lyrics, url):
        """
        Inserts entry into database
        :param name: String
        :param genre: varchar
        :param performed: string
        :param written: string        
        :param dates: date
        :param lyrics: text
        :param url: varchar

        :return: none
        :raises: Database errors on connection and insertion
        """
        pass
