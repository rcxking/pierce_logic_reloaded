import cgi
import datetime
import urllib
import webapp2
import jinja2
import os

from google.appengine.ext import ndb
from google.appengine.api import users

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))


def userproofs_key(email=None):
    return ndb.Key('userproofs', email)

class Proofs(ndb.Model):
    title = ndb.StringProperty(indexed=False)
    description = ndb.StringProperty(indexed=False)
    serializedProof = ndb.StringProperty(indexed=False)

class IndexHandler(webapp2.RequestHandler):

    def get(self):
        user = users.get_current_user()
        proofList = []
        if user:
            greeting = ('Welcome, <a href="#" class="username">%s!</a> (<a href="%s">Sign out</a>)' %
                       (user.nickname(), users.create_logout_url('/')))
            proof_query = Proofs.query(ancestor=userproofs_key(user.email()))
            proofs = proof_query.fetch(10)
            for proof in proofs:
                proofList.append( """
                <div class="panel panel-default loadProof shadow">
                  <div class="panel-body">
                    <h3>%s</h3>
                    <blockquote>
                        <p>%s</p>
                    </blockquote>
                    <input type="hidden" id="jsonProof" value='%s' />
                  </div>
                </div> """ % (proof.title, proof.description, proof.serializedProof))
        else:
            greeting = ('<a href="%s">Sign in or register</a>.' %
                       users.create_login_url('/'))

        template_values = {
            "user": user,
            "greeting": greeting,
            "proofList": proofList
        }
        template = jinja_environment.get_template('templates/index.html')
        self.response.out.write(template.render(template_values))

class SaveTheProof(webapp2.RequestHandler):

    def post(self):
        user = users.get_current_user()
        if(user):
            proofData = Proofs(parent=userproofs_key(users.get_current_user().email()))
            proofData.title = self.request.get('saveFormTitle')
            proofData.description = self.request.get('saveFormDesc')
            proofData.serializedProof = self.request.get('serializedProof')
            proofData.put()

        self.redirect('/')


app = webapp2.WSGIApplication([
    ('/', IndexHandler),
    ('/saveproof', SaveTheProof)
], debug=True)
