from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric import dsa
from cryptography.hazmat.primitives import serialization
import io
import snowflake.connector
import pandas as pd

class Snowflake():

    def __init__(self, user, pem, pwd, warehouse='DEV_WAREHOUSE'):
        # string_private_key = f"-----BEGIN ENCRYPTED PRIVATE KEY-----\n{pem.strip()}\n-----END ENCRYPTED PRIVATE KEY-----"
        #string_private_key = f"{pem.strip()}"
        #p_key = serialization.load_pem_private_key(
        #    io.BytesIO(string_private_key.encode()).read(),
        #    password=pwd.strip().encode(),
        #    backend=default_backend())
        with open(pem, "rb") as key:
            p_key = serialization.load_pem_private_key(
                key.read(),
                password=pwd.encode(),  # os.environ['PRIVATE_KEY_PASSPHRASE'].encode(),
                backend=default_backend()
            )

        pkb = p_key.private_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption())

        self.ctx = snowflake.connector.connect(
            user=user.strip(),
            private_key=pkb,
            account='lr02922')

        cur = self.ctx.cursor()
        cur.execute("select current_date;")
        print(cur.fetchone()[0])

    def cursor(self):
        self.cs = self.ctx.cursor()
        return self.cs

    def get_cursor(self, database, schema, role):
        cs = self.cursor()
        cs.execute('USE WAREHOUSE DEV_WAREHOUSE')
        cs.execute('USE ROLE ' + role)
        cs.execute('USE ' + database + '.' + schema)
        return cs

    def execute_query(self, cs, sql, columns):
        cs.execute(sql)
        df = pd.DataFrame(cs.fetchall(), columns=columns)
        df = df.replace('\n', ' ', regex=True)
        return df