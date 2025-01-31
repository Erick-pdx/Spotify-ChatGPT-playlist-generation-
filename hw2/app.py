"""
A simple musicbook flask app.
"""
import flask
from flask.views import MethodView
from index import Index
from sign import Sign
from front import Front

app = flask.Flask(__name__)       # our Flask app

"""
Adding a landing page to the flask app, by changing what gets 
shown when the http has nothing else in it and moving the
index its own page 
"""

app.add_url_rule('/',
                 view_func=Front.as_view('front'),
                 methods=["GET"])


app.add_url_rule('/index',
                 view_func=Index.as_view('index'),
                 methods=["GET"])

app.add_url_rule('/sign',
                 view_func=Sign.as_view('sign'),
                 methods=['GET', 'POST'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
