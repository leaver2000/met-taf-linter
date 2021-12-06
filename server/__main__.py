"""
## METLAB-SERVER

"""
from flask import Flask
from flask_cors import CORS
import sys

app = Flask(__name__)
app.testing = True
CORS(app)

if __name__ == '__main__':
    env = sys.argv[1]
    if(env == 'DEV'):
        from dotenv import dotenv_values
        from routes import *
        config = dotenv_values('.env')
        app.run(host=config['HOST'], port=config['PORT'], debug=False)

    if(env == 'TEST'):
        from test import *

        pass

    # print(f"{sys.argv[1]}")
    # try:
    #     from dotenv import dotenv_values
    #     config = dotenv_values(f"{sys.argv[1]}.env")
    #     print("DOTENV ENVIRONMENT LOADED")

    #     if config["ENV"] == "DEVELOPMENT":
    #         print("Starting Flask API Server")
    #         from routes import *
    #         app.run(host=config['HOST'], port=config['PORT'], debug=False)

    #     elif config["ENV"] == "TEST":
    #         print("starting test")
    #         from test import *

    # except ModuleNotFoundError:
    #     print("dotenv failed to load")
    #     print("produiction env not yet developed")
