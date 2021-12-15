from flask import Flask, jsonify, make_response
from markupsafe import escape
import pandas as pd

# create and configure the app
app = Flask(__name__)

df = pd.read_csv('data/ALS/sent_claims_db.tsv', sep='\t')
df = df.fillna('')

@app.route('/api/v1.0/test', methods=['GET'])
def test_response():
    """Return a sample JSON response."""
    sample_response = {
        "items": [
            { "id": 1, "name": "Apples",  "price": "$2" },
            { "id": 2, "name": "Peaches", "price": "$5" }
        ]
    }
    # JSONify response
    response = make_response(jsonify(sample_response))

    # Add Access-Control-Allow-Origin header to allow cross-site request
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5050'

    # Mozilla provides good references for Access Control at:
    # https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    # https://developer.mozilla.org/en-US/docs/Web/HTTP/Server-Side_Access_Control

    return response

@app.route('/api/read/<disease_name>/<data_set>', methods=['GET'])
def read_tsv(disease_name, data_set):
    temp_df = pd.read_csv('data/'+disease_name+'/'+data_set+'.tsv', sep='\t')
    temp_df = temp_df.fillna('')
    data = temp_df.to_dict('records')
    response = make_response(jsonify(data))
    return response

@app.route('/api/ALS/claims', methods=['GET'])
def serve_claims_data():
    """Return a sample JSON response."""
    data = df[0:1000].to_dict('records')
    response = make_response(jsonify(data))
    return response

#@app.route('/api/<disease_name>/<data_set>', methods=['GET'])
#def disease_data(disease_name, data_set):
#    return f'Dataset {escape(data_set)}'
