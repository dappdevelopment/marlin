import requests

from flask import Flask, request
from flask_restful import reqparse, abort, Api, Resource

app = Flask(__name__)
api = Api(app)

def download_file(url):
    local_filename = url.split('/')[-1]
    r = requests.get(url, stream=True)
    with open(local_filename, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024): 
            if chunk:
                f.write(chunk)
    return local_filename

class AddUrl(Resource):
    def get(self):
        try:
            url = request.args.get('url')
            filename = download_file(url)
            print('saved to file', filename)
            return filename, 200
        except:
            return None, 400

api.add_resource(AddUrl, '/addUrl')

if __name__ == '__main__':
    app.run(debug=True)
