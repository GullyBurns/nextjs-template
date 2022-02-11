from flask import Flask, jsonify, make_response
from flask_cors import CORS
from markupsafe import escape
import pandas as pd
from snowflake.connector.errors import ProgrammingError
from utils.snowflake import Snowflake
import os
import re
import json
import datetime

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

def run_query(cs, sql, cols, id_in_query=True):
    sql = re.sub('PREFIX_', prefix, sql)
    print(sql)
    df = sf.execute_query(cs, sql, cols)
    if id_in_query:
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
        GROUP BY d.ID, CORPUS_NAME
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

@app.route('/api/count_authors/<corpus_id>', methods=['GET'])
def count_authors(corpus_id):
    cs = get_cursor(sf)
    sql = '''
    select distinct do.id, count(a.id)
    from PREFIX_CORPUS_TO_PAPER as dop 
        JOIN PREFIX_CORPUS as do on (dop.id_corpus=do.id)
        JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER_TO_AUTHOR_V2 as pa on (dop.id_paper=pa.id_paper)
        JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (pa.id_paper=p.id)
        JOIN FIVETRAN.KG_RDS_CORE_DB.AUTHOR_V2 as a on (pa.id_author=a.id)
    where do.id = <<corpus_id>>
    group by do.id
'''
    sql = re.sub('<<corpus_id>>', corpus_id, sql)
    cols = ['id', 'author_count']
    return run_query(cs, sql, cols)

@app.route('/api/list_authors/<corpus_id>/<page_size>/<n_pages>', methods=['GET'])
def list_authors(corpus_id, page_size, n_pages):
    cs = get_cursor(sf)
    sql = '''select cc.id, cc.id_corpus, do.corpus_name, 
        OBJECT_CONSTRUCT('orcid_id', a.id_orcid, 'author_name', a.name) as author_json,
        LOG(10,cc.weighted_citation_score),
        cc.citations_per_year,
        LOG(10,sum(ZEROIFNULL(p.paper_counts)/(2023-p.year))) as weighted_pub_score,
        array_agg(object_construct('p_year', year, 'p_count', paper_counts)) within group (order by year) as papers_per_year
    from (
      select distinct pa.id_author as id, dop.id_corpus as ID_CORPUS, p.YEAR, COUNT(pa.id_paper) as paper_counts
        from FIVETRAN.KG_RDS_CORE_DB.PAPER_TO_AUTHOR_V2 as pa 
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.id=pa.id_paper)
            JOIN PREFIX_CORPUS_TO_PAPER as dop on (p.id=dop.id_paper)
        group by pa.id_author, dop.id_corpus, p.year) as p
      inner join (
        select distinct pa.id_author as id, dop.id_corpus as ID_CORPUS, 
                sum(ZEROIFNULL(cc.citation_count)/(2023-p.year)) as weighted_citation_score,
                array_agg(object_construct('c_year', p.year, 'c_score', cc.citation_count)) within group (order by year) as citations_per_year
        from FIVETRAN.KG_RDS_CORE_DB.PAPER_TO_AUTHOR_V2 as pa 
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.id=pa.id_paper)
            JOIN PREFIX_CORPUS_TO_PAPER as dop on (p.id=dop.id_paper)
            JOIN PREFIX_CITATION_COUNTS as cc on (dop.ID_PAPER=cc.id)
        group by pa.id_author, dop.id_corpus) as cc on (p.id=cc.id and p.id_corpus=cc.id_corpus)
      inner join PREFIX_CORPUS as do on (cc.id_corpus=do.id)
      inner join FIVETRAN.KG_RDS_CORE_DB.AUTHOR_V2 as a on (cc.id=a.id)
    where do.id = '''+corpus_id+''' 
    group by cc.id, cc.id_corpus, cc.weighted_citation_score, cc.citations_per_year, a.name, a.id_orcid, do.corpus_name
    order by weighted_pub_score desc
    '''
    offset = int(page_size) * int(n_pages)
    sql = re.sub('<<corpus_id>>', corpus_id, sql)
    sql = sql + '\n limit ' + str(page_size) + ' OFFSET ' + str(offset)
    cols = ['id', 'id_corpus', 'corpus_name', 'author_json',
            'weighted_citation_score',
            'citations_per_year',
            'weighted_pub_score',
            'pubs_per_year']

    # HARD-CODE THE QUERY TO GIVE CORRECT FORMAT FOR PUB_PER_YEAR SPARKLINES
    sql = re.sub('PREFIX_', prefix, sql)
    df = sf.execute_query(cs, sql, cols)
    df['id'] = df.id.astype('int64', copy=False)

    l1 = []
    l2 = []
    for row in df.itertuples():
        m1 = {}
        for el in json.loads(row.pubs_per_year):
            m1[el['p_year']] = el['p_count']
        l1.append([m1[year] if m1.get(year) else 0 for year in range(2000,2022)])
        m2 = {}
        for el in json.loads(row.citations_per_year):
            m2[el['c_year']] = el['c_score']
        l2.append([m2[year] if m2.get(year) else 0 for year in range(2000,2022)])
    df['pubs_per_year'] = l1
    df['citations_per_year'] = l2
    data = df.to_dict('records')
    return make_response(jsonify(data))

@app.route('/api/list_papers/<corpus_id>/<page_size>/<n_pages>', methods=['GET'])
def list_papers(corpus_id, page_size, n_pages):
    cs = get_cursor(sf)
    sql = '''
        SELECT DISTINCT p.id AS ID, p.DOI, (c.CITATION_COUNT)/(2023-p.year) as weighted_citation_score, 
                n.AUTHOR_STRING, p.YEAR, p.TITLE, p.JOURNAL_NAME_RAW as JOURNAL_TITLE, 
                p.VOLUME, p.PAGINATION, p.TYPE as ARTICLE_TYPE  
        FROM PREFIX_CORPUS as d
            JOIN PREFIX_CORPUS_TO_PAPER as dp on (d.ID=dp.ID_CORPUS)
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.ID=dp.ID_PAPER)
            JOIN PREFIX_PAPER_NOTES as n on (p.ID=n.PMID)
            JOIN PREFIX_CITATION_COUNTS as c on (p.ID=c.ID)
        WHERE d.ID='''+corpus_id+'''
        ORDER BY weighted_citation_score DESC
        '''
    offset = int(page_size) * int(n_pages)
    sql = sql + '\n limit ' + str(page_size) + ' OFFSET ' + str(offset)
    cols = ['id','DOI','CITATION_SCORE','AUTHORS','YEAR','TITLE','JOURNAL_TITLE','VOLUME',
            'PAGE','ARTICLE_TYPE' ]
    sql = re.sub('PREFIX_', prefix, sql)
    df = sf.execute_query(cs, sql, cols)
    df['id'] = df.id.astype('int64', copy=False)
    df = df.fillna('')
    df['REF'] = ['%s %s:%s'%(row.JOURNAL_TITLE,row.VOLUME,row.PAGE) for row in df.itertuples()]
    df = df.drop(columns=['JOURNAL_TITLE','VOLUME','PAGE'])
    data = df.to_dict('records')
    return make_response(jsonify(data))

@app.route('/api/count_papers/<corpus_id>', methods=['GET'])
def count_papers(corpus_id):
    cs = get_cursor(sf)
    sql = '''
        SELECT DISTINCT d.id, count(p.id)  
        FROM PREFIX_CORPUS as d
            JOIN PREFIX_CORPUS_TO_PAPER as dp on (d.ID=dp.ID_CORPUS)
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.ID=dp.ID_PAPER)
        WHERE d.ID='''+corpus_id+'''
        GROUP BY d.id
        '''
    cols = ['id','paper_count']
    return run_query(cs, sql, cols)

@app.route('/api/count_papers_per_month/<corpus_id>', methods=['GET'])
def count_papers_per_year(corpus_id):
    cs = get_cursor(sf)
    sql = '''
        SELECT DISTINCT count(p.id) AS paper_count, 
            p.YEAR, p.MONTH
        FROM PREFIX_CORPUS as d
            JOIN PREFIX_CORPUS_TO_PAPER as dp on (d.ID=dp.ID_CORPUS)
            JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (p.ID=dp.ID_PAPER)
        WHERE d.ID='''+corpus_id+'''
        GROUP BY YEAR, MONTH
        ORDER BY YEAR, MONTH
        '''
    cols = ['paper_count', 'YEAR', 'MONTH']
    sql = re.sub('PREFIX_', prefix, sql)
    df = sf.execute_query(cs, sql, cols)
    df = df.fillna(1).loc[df.YEAR>0]
    df['date'] = [datetime.date(int(row.YEAR), int(row.MONTH), 1).isoformat() for row in df.itertuples()]
    df = df.drop(columns=['YEAR', 'MONTH'])
    data = df.to_dict('records')
    return make_response(jsonify(data))

@app.route('/api/count_concepts/<corpus_id>', methods=['GET'])
def count_concepts(corpus_id):
    cs = get_cursor(sf)
    sql = '''
    select distinct do.id, count(c.id)
    from PREFIX_CORPUS_TO_PAPER as dop 
        JOIN PREFIX_CORPUS as do on (dop.id_corpus=do.id)
        JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER_TO_CONCEPT as pc on (dop.id_paper=pc.id_paper)
        JOIN FIVETRAN.KG_RDS_CORE_DB.CONCEPT as c on (pc.id_concept=c.id)
    where do.id = <<corpus_id>>
    group by do.id
'''
    sql = re.sub('<<corpus_id>>', corpus_id, sql)
    cols = ['id', 'concept_count']
    return run_query(cs, sql, cols)

@app.route('/api/list_concepts/<corpus_id>/<page_size>/<n_pages>', methods=['GET'])
def list_concepts(corpus_id, page_size, n_pages):
    cs = get_cursor(sf)
    sql = '''select c.id as id, c.name as concept_name, st.category, st.semtype, count(p.id) as paper_count
    from PREFIX_CORPUS as do
        JOIN PREFIX_CORPUS_TO_PAPER as dop on (dop.id_corpus=do.id)
        JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER as p on (dop.id_paper=p.id)
        JOIN FIVETRAN.KG_RDS_CORE_DB.PAPER_TO_CONCEPT as pc on (dop.id_paper=pc.id_paper)
        JOIN FIVETRAN.KG_RDS_CORE_DB.CONCEPT as c on (pc.id_concept=c.id)
        JOIN FIVETRAN.KG_RDS_CORE_DB.CONCEPT_TO_SEMANTIC_TYPE as cst on (cst.id_concept=c.id)
        JOIN SEMANTIC_TYPES_CATEGORIES as st on (cst.id_semantic_type=st.s_id)
    where do.id = <<corpus_id>>
    group by do.id, c.id, c.name, do.corpus_name, st.category, st.semtype
    order by paper_count desc
    '''
    offset = int(page_size) * int(n_pages)
    sql = re.sub('<<corpus_id>>', corpus_id, sql)
    sql = sql + '\n limit ' + str(page_size) + ' OFFSET ' + str(offset)
    cols = ['id', 'concept_name',
            'sem_category',
            'sem_type',
            'paper_count']
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
