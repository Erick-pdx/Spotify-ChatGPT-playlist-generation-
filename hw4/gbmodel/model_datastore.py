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
    return [entity['name'],entity['email'],entity['date'],entity['message']]

class model(Model):
    def __init__(self):
        self.client = datastore.Client('cloud-franco-francoer')

    def select(self):
        query = self.client.query(kind = 'Review')
        entities = list(map(from_datastore,query.fetch()))
        return entities

    def insert(self,name,email,message):
        key = self.client.key('Review')
        rev = datastore.Entity(key)
        rev.update( {
            'name': name,
            'email' : email,
            'date' : datetime.today(),
            'message' : message
            })
        self.client.put(rev)
        return True