from .Model import Model
from datetime import datetime
from google.cloud import datastore

def from_datastore(entity):
    """Translates Datastore results into the format expected by the
    application.

    Datastore typically returns:
        [Entity{key: (kind, id), prop: val, ...}]

    This returns:
        [ name, email, date, message ]
    where name, email, and message are Python strings
    and where date is a Python datetime
    """
    if not entity:
        return None
    if isinstance(entity, list):
        entity = entity.pop()

    return [
        entity.get('name', ''),
        entity.get('genre', ''),
        entity.get('performed', ''),
        entity.get('written', ''),
        entity.get('dates', ''),
        entity.get('lyrics', ''),
        entity.get('url', '')]

class model(Model):
    def __init__(self):
        self.client = datastore.Client('cloud-franco-francoer')

    def select(self):
        query = self.client.query(kind = 'Review')
        entities = list(map(from_datastore,query.fetch()))
        return entities

    """
    Changing these values to my flasks values, so instead of just adding a name, email, and message
    so instead I have name, genre, performed, witten, date, lyrics, url, but so far I see no difference 
    with this change
    """

    def insert(self,name,genre, performed, written, dates, lyrics ,url):
        key = self.client.key('Review')
        rev = datastore.Entity(key)
        rev.update( {
            'name': name,
            'genre' : genre,
            'performed' : performed,
            'written' : written,
            'dates' : dates,
            'lyrics' : lyrics,
            'url' : url
            })
        self.client.put(rev)
        return True
