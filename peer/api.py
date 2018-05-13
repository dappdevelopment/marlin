from flask import Flask
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)

URLS = {
    'url1': {'fetched': True},
}


def abort_if_url_doesnt_exist(url):
    if url not in URLS:
        abort(404, message="Url {} doesn't exist".format(url))

parser = reqparse.RequestParser()
parser.add_argument('task')


# Url
# shows a single url item and lets you delete a url item
class Url(Resource):
    def get(self, url):
        abort_if_url_doesnt_exist(url)
        return URLS[url]

    def delete(self, url):
        abort_if_url_doesnt_exist(url)
        del URLS[url]
        return '', 204

    def put(self, url):
        args = parser.parse_args()
        task = {'task': args['task']}
        URLS[url] = task
        return task, 201


# UrlList
# shows a list of all urls, and lets you POST to add new urls
class UrlList(Resource):
    def get(self):
        return URLS

    def post(self):
        args = parser.parse_args()
        url = int(max(URLS.keys()).lstrip('url')) + 1
        url = 'url%i' % url
        URLS[url] = {'task': args['task']}
        return URLS[url], 201

##
## Actually setup the Api resource routing here
##
api.add_resource(UrlList, '/urls')
api.add_resource(Url, '/urls/<url>')


if __name__ == '__main__':
    app.run(debug=True)
