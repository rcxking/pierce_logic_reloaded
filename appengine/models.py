import cgi
import datetime
import urllib
import webapp2

from google.appengine.ext import ndb
from google.appengine.api import users


class Proof(ndb.Model):
    """Models an individual Proof entry with an author, title, proof, and date."""
    author = ndb.StringProperty()
    name = ndb.StringProperty()
    proof = ndb.StringProperty()
    date = ndb.DateTimeProperty(auto_now_add=True)
