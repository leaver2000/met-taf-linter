from tarpy.tarpy import Tarpy
# import io
from flask import request, jsonify, make_response, Response
from datetime import datetime
from flask_cors import CORS
# import sys
# import json
# import __types__ as T
from __main__ import app
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
# impp
stations = [
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [-89.84, 38.55]
        },
        "properties": {
            "name": "Scott AFB",
            "basetimes": ['2021102406Z']
        }
    }
]


def get_all_features():
    return stations


@app.route("/", methods=['GET'])
def index() -> str:

    return "connected to index"


# dict


@app.route("/api/", methods=['GET'])
def api():
    "initalize avalible products"
    response = make_response(
        jsonify({"source": "Jason Leaver",
                 "product": "BaseProducts",
                 "type": "FeatureCollection",
                 "features": get_all_features()
                 }),
        200,
    )
    return response


@app.route("/api/meteogram", methods=['GET'])
def meteogram():
    file_path1 = "data/2021102206Z"
    with open(f"{file_path1}.txt", "r") as file_in:
        tp = Tarpy(file_in)
    # print('hello:', , file=sys.stdout)
    lvl = dict(request.args)['level']

    data = jsonify(tp.temporal_series(lvl))
    return data


@app.route("/api/temporal", methods=['GET'])
def temporal():
    file_path1 = "data/2021102206Z"
    with open(f"{file_path1}.txt", "r") as file_in:
        tp = Tarpy(file_in)
    # print('hello:', , file=sys.stdout)
    lvl = dict(request.args)['level']

    data = jsonify(tp.temporal_series(lvl))
    return data


@app.route("/api/skewt", methods=['GET'])
def skewt():
    # valid_time = dict(request.args)['TIME']
    file_path1 = "data/2021102206Z"
    with open(f"data/2021102206Z.txt", "r") as file_in:
        tp = Tarpy(file_in)

    forecast_hour = dict(request.args)['time']

    data = jsonify(tp.elevation_series3(int(forecast_hour)))
    return data

    # skew = tp.skewt().to_bytes(int(valid_time))
    # output = io.BytesIO()
    # FigureCanvas(skew).print_png(output)
    # return Response(output.getvalue(), mimetype='image/png')
