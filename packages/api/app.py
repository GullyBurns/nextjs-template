from flask import Flask, jsonify, make_response
from flask_cors import CORS
from markupsafe import escape
import pandas as pd
from snowflake.connector.errors import ProgrammingError
from utils.snowflake import Snowflake
import os
import re

# create and configure the app
app = Flask(__name__)
CORS(app)

df = pd.read_csv('data/ALS/claim_clusters.tsv', sep='\t')
df = df.fillna('')

sf_login = os.environ['SF_LOGIN']
sf_keyfile = os.environ['SF_KEY_FILE']
sf_passphrase = os.environ['SF_PASSPHRASE']
sf_role = os.environ['SF_ROLE']
sf_database = os.environ['SF_DATABASE']
sf_schema = os.environ['SF_SCHEMA']

sf = Snowflake(sf_login, sf_keyfile, sf_passphrase)

# RUN QUERIES TO PREBUILD DATASETS ON FIRST RUN

# DASHBOARD
# ---------
prefix = os.environ['SF_PREFIX']

# total number of papers
# total number of open access papers
# total number of authors
# ranked table of authors
# ranked table of papers
# [publications per year]
# [geographical map]

# DISEASE RESEARCH STATE
# ---------
# [DISTRIBUTION]

# CLAIM CLUSTERS / TOPICS
# ---------
# CLUSTER MAP WITH OVERLAYS
# LIST OF CLUSTERS WITH SPARKLINES

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

# Put some error checking here to refresh stale database connections
def get_cursor(sf):
    try:
        cs = sf.get_cursor(sf_database, sf_schema, sf_role)
    except ProgrammingError:
        sf = Snowflake(sf_login, sf_keyfile, sf_passphrase)
        cs = sf.get_cursor(sf_database, sf_schema, sf_role)
    return cs

def run_query(cs, sql, cols):
    sql = re.sub('PREFIX_', prefix, sql)
    print(sql)
    df = sf.execute_query(cs, sql, cols)
    df['id'] = df.id.astype('int64', copy=False)
    data = df.to_dict('records')
    response = make_response(jsonify(data))
    return response

@app.route('/api/list_corpora', methods=['GET'])
def list_corpora():
    cs = get_cursor(sf)
    sql1 = '''SELECT d.ID, CORPUS_NAME
            FROM PREFIX_CORPUS as d
            JOIN PREFIX_CORPUS_TO_PAPER as dp on (d.ID=dp.ID_CORPUS)
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.ID=dp.ID_PAPER)
        GROUP BY d.ID, CORPUS_NAME, d.CURIS
        ORDER BY d.ID + 0;
    '''
    cols1 = ['id','label']
    sql1 = re.sub('PREFIX_', prefix, sql1)
    df = sf.execute_query(cs, sql1, cols1)
    data = df.to_dict('records')
    response = make_response(jsonify(data))
    return response

@app.route('/api/list_corpora_details', methods=['GET'])
def list_corpora_details():
    cs = get_cursor(sf)
    sql1 = '''SELECT d.ID, CORPUS_NAME, d.CURIS as MONDO_CODES, COUNT(DISTINCT p.id) AS PAPER_COUNT
            FROM PREFIX_CORPUS as d
            JOIN PREFIX_CORPUS_TO_PAPER as dp on (d.ID=dp.ID_CORPUS)
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.ID=dp.ID_PAPER)
        GROUP BY d.ID, CORPUS_NAME, d.CURIS
        ORDER BY d.ID + 0;
    '''
    cols1 = ['id','CORPUS_NAME', 'MONDO_CODES', 'PAPER_COUNT']
    sql1 = re.sub('PREFIX_', prefix, sql1)
    df1 = sf.execute_query(cs, sql1, cols1)

    sql2 = '''SELECT d.ID, COUNT(DISTINCT p.id) AS PAPER_COUNT
            FROM PREFIX_CORPUS as d
            JOIN PREFIX_CORPUS_TO_PAPER as dp on (d.ID=dp.ID_CORPUS)
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.ID=dp.ID_PAPER)
            JOIN PREFIX_PAPER_OPEN_ACCESS as oa on (p.ID=oa.PMID)
        GROUP BY d.ID
        ORDER BY d.ID + 0;
    '''
    cols2 = ['id','OA_PAPER_COUNT']
    sql2 = re.sub('PREFIX_', prefix, sql2)
    df2 = sf.execute_query(cs, sql2, cols2)
    df = df1.merge(df2)
    #df['MONDO_URLS'] = ['<a href="https://monarchinitiative.org/disease/'+row.MONDO_CODES+'">MONDO</a>' for row in df.itertuples()]
    data = df.to_dict('records')
    response = make_response(jsonify(data))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/api/list_authors/<corpus_id>/<page_size>/<n_pages>', methods=['GET'])
def list_authors(corpus_id, page_size, n_pages):
    cs = get_cursor(sf)
    sql = '''
    select distinct a.id, 
        a.id_orcid, 
        a.name as author_name, 
        sum(ZEROIFNULL(cc.citation_count)/(2023-p.year)) as normalized_citation_count,  
        loc.institution as Institution,
        loc.city as City,
        loc.country as Country,
        DENSE_RANK() OVER (PARTITION BY CORPUS_NAME ORDER BY normalized_citation_count DESC, a.id, a.id_orcid, a.name, loc.institution DESC) as RANK,
        CORPUS_NAME
    from PREFIX_CORPUS_TO_PAPER as dop 
        JOIN PREFIX_CORPUS as do on (dop.id_corpus=do.id)
        JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER_TO_AUTHOR_V2 as pa on (dop.id_paper=pa.id_paper)
        JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (pa.id_paper=p.id)
        JOIN FIVETRAN.KG_RDS_CORE_DB.AUTHOR_V2 as a on (pa.id_author=a.id)
        JOIN PREFIX_CITATION_COUNTS as cc on (dop.ID_PAPER=cc.id)
        LEFT JOIN PREFIX_AUTHOR_LOCATION as loc on (a.id=loc.author_id)
    where do.id = <<corpus_id>>    
    group by a.id, a.id_orcid, a.name, loc.Institution, loc.City, loc.Country, CORPUS_NAME
    order by normalized_citation_count desc
'''
    offset = int(page_size) * int(n_pages)
    sql = re.sub('<<corpus_id>>', corpus_id, sql)
    sql = sql + '\n limit ' + str(page_size) + ' OFFSET ' + str(offset)
    cols = ['id','id_orcid','author_name', 'normalized_citation_count',
            'Institution', 'City', 'Country', 'RANK', 'CORPUS_NAME']
    return run_query(cs, sql, cols)

@app.route('/api/list_papers/<corpus_id>/<page_size>/<n_pages>', methods=['GET'])
def list_papers(corpus_id, page_size, n_pages):
    cs = get_cursor(sf)
    sql = '''
        SELECT DISTINCT p.id AS ID, p.DOI, p.TITLE, p.ABSTRACT, p.YEAR, p.MONTH, p.DAY, p.PUBLICATION_STATUS, p.VOLUME, p.ISSUE, 
            p.MESH_TERMS_RAW as MESH, p.PAGINATION, p.JOURNAL_NAME_RAW as JOURNAL_TITLE, p.TYPE as ARTICLE_TYPE  
        FROM PREFIX_CORPUS as d
            JOIN PREFIX_CORPUS_TO_PAPER as dp on (d.ID=dp.ID_CORPUS)
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.ID=dp.ID_PAPER)
        WHERE d.ID='''+corpus_id+'''
        ORDER BY YEAR DESC, MONTH DESC, DAY DESC
        '''
    offset = int(page_size) * int(n_pages)
    sql = sql + '\n limit ' + str(page_size) + ' OFFSET ' + str(offset)
    cols = ['id','DOI','TITLE','ABSTRACT','YEAR','MONTH','DAY','PUBLICATION_STATUS',
            'VOLUME','ISSUE','MESH','PAGINATION','JOURNAL_TITLE','ARTICLE_TYPE' ]
    return run_query(cs, sql, cols)

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
