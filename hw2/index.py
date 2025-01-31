from flask import render_template
from flask.views import MethodView
import gbmodel

"""
Here is how the data is sent to the index, the row has to match with 
way the data is beind shown or else the data will be scrambled 
"""
class Index(MethodView):
    def get(self):
        model = gbmodel.get_model()
        entries = [dict(
            name=row[0], 
            genre=row[1],
            performed=row[2], 
            written=row[3], 
            dates=row[4], 
            url=row[5],
            lyrics=row[6],
            ) for row in model.select()]
        return render_template('index.html',entries=entries)
