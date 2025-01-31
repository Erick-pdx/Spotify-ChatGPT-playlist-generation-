"""
Python list model
"""
from datetime import date
from .Model import Model

class model(Model):
    def __init__(self):
        self.music_entries = []

    def select(self):
        """
        Returns guestentries list of lists
        Each list in music_entries contains: name, genre, performed, written, dates, lyrics, url
        :return: List of lists
        """
        return self.music_entries

    def insert(self, name, genre, performed, written, dates, lyrics, url):
        """
        Appends a new list of values representing new message into guestentries
        :param name: String
        :param genre: varchar
        :param performed: string
        :param written: string
        :param dates: date
        :param lyrics: text
        :param url: varchar
        :return: True
        """
        params = [name, genre, performed, written, dates, lyrics, url]
        self.music_entries.append(params)
        return True
