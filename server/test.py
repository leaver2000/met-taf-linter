from datetime import datetime
from tarpy.tarpy import Tarpy

file_path1 = "data/2021102206Z"

with open(f"{file_path1}.txt", "r") as file_in:
    t1S = datetime.now()

    tp = Tarpy(file_in)
    d = tp.generate_taf()
    print(d)
    # print(d)
    # jsn = tp.geo_json()
    # print(type(jsn))
    # print(tp.properties.basetime)
    # skew = tp.skewt()
    # skew = skew.to_bytes()
    # skew.plot()
    # print(dir(skew))

    t1E = datetime.now()
    t1D = (t1E-t1S).total_seconds()
    # print(t1D)
