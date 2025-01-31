from flask import render_template
from flask.views import MethodView
import gbmodel

"""
Adding some code that links the front html file to a method so that it can be called
"""

class Front(MethodView):
    def get(self):
        return render_template("front.html")
