import numpy as np  # type: ignore
import numpy.typing as npt  # type: ignore
import pandas as pd  # type: ignore
from typing import Dict, List, TextIO, Union
# from collections.abc import Iterable
import re
from datetime import datetime
import tarpy._types as tt
WXIDX = {
    'icing': np.array([
        # 'none',
        # "",
        # 'null',
        'trace',
        'l-mixed',
        'l-rime',
        'l-clear',
        'm-mixed',
        'm-rime',
        'm-clear',
        's-mixed',
        's-rime',
        's-clear',
        'none'
    ]),
    "turbulence": np.array([
        'none',
        # "",
        # 'null',
        'lgt',
        'lgt-mod',
        'mod',
        'mod-svr',
        'svr'
    ]),
    "precip": np.array([
        'none',
        "rain",
        # "showers",
        # "snow",
        # "hail",
        # "sleet",

    ])
}


class TParse:
    """hello"""

    def _parseprops(self, tf: TextIO) -> None:
        """ Parse header information of TARP file loop will break @ forecast_hours """

        while True:
            line = tf.readline()
            if line.isspace():
                continue
            try:  # * DESTRUCTURE LINE
                k, v = line.split(":")
                key = k.replace(" ", "_").lower()
                val = v.strip()
                if key == "basetime":  # * datetime object from basetime
                    dt = datetime.strptime(val, "%Y%m%d%HZ")
                    self.properties[key] = dt

                elif key == "forecast_hours":
                    # ?  strp forecast_hours to np.array
                    hours = np.fromstring(
                        val, dtype='timedelta64[h]', sep='hr')
                    self.names_range = np.append(hours, hours[-1]+1)
                    self.properties[key] = hours
                    break  # ? END

                else:  # * set misc attribute values
                    self.properties[key] = val

            except ValueError:  # * description
                self.properties["description"] = self.properties["description"] + re.sub(
                    r"[^\S\r\n\t]{2,}", " ", line)

        return

    def _parsemodels(self, tf: TextIO) -> None:
        """

        """
        names = self.names_range
        # ? parse csv like model TarpFile to DataFrame
        df = pd.read_csv(tf, sep=r"\\s*|,|\t", engine="python", comment='#',
                         header=0,  names=names, index_col=0).iloc[:, :-1]
        tuples: list[tuple[str, str]] = []

        mb = df.index.str.extract(r"([0-9]+)(?=mb)").dropna()
        self.milibars = np.flip(np.unique(mb.astype(int)))

        # ? itterate csv DataFrame. lvl & key information is split from the index
        # ? and appened to a list as tuples -> (lvl, prop)
        self.NDArray = np.array([self._itermodel(index, row, tuples)
                                for index, row in df.iterrows()])
        # ? with the tuples and NDArray rebuild the DataFrame
        index = pd.MultiIndex.from_tuples(tuples, names=["lvl", "props"])
        self.DataFrame = pd.DataFrame(self.NDArray, index=index)

        return

    @classmethod
    def _itermodel(self, index: str, series: tt.Series, labels: list) -> np.ndarray:
        lvl, key = self._make_lvl_key(index)
        labels.append((lvl, key))
        try:
            return np.array(series, dtype=float)

        except ValueError:
            # ? aos -> array of strings
            aos = np.array(series.str.strip().str.lower())
            aos[aos == ''] = 'none'
            aos[aos == 'null'] = 'none'
            # print(aos)
            # ? static WXIDX dict
            return self._encode(aos, self._wxidx(key))

    @staticmethod
    def _encode(aos: str, idx: npt.NDArray) -> np.ndarray:
        a = np.where(aos[:, None] == idx)[1]
        return np.where(a < 10, a, -1)

    @staticmethod
    def _decode(aos: str, idx: npt.NDArray) -> np.ndarray:
        a = np.where(aos[:, None] == idx)[1]
        return np.where(a < 10, a, -1)

    @staticmethod
    def _make_lvl_key(key: str) -> tuple:
        """
        make lvl & prop method
        ```
        @method:
        re.split(key:str)->tuple(lvl:str, prop:str)

        ```
        milibar level is split from str argument and the trailing units are striped
        ```
        @upper_air:
        str('50mb  CWMR (g/kg): ') -> tuple('50mb', 'cwmr')
        ```
        surface lvls are not proveded with the tarp key so one is generated
        ```
        @surface:
        str('ThetaE Adv (K/hr):') -> tuple('sfc', 'thetae_adv')
        ```
        """
        k = re.split(r'(?<=mb)\s* ', key)
        lvl, prop = (k if len(k) > 1 else ["sfc", k[0]])

        prop = re.sub(
            r"\s+", "_", re.sub(r"\s*(?=\().*|\s*(?=:).*", "", prop)).lower()

        return (lvl, prop)

    @staticmethod
    def _wxidx(prop: str) -> Dict[str, npt.NDArray]:
        """
        _get_wxidx method is only called when a ``ValueError`` exception occurs,
        within the _itermodel method.

        The core function of the `WXIDX` is to provide a numeric represenation for
        string weather values.

        ```
        @method
        str('turbulence') -> WXIDX['turbulence']:np.ndarray

        ```
        the return value is a `np.ndarray` with `index` position for `str` weather
        values representing 
        """

        if bool(re.search(r"turb", prop)):
            return WXIDX["turbulence"]
        elif bool(re.search(r"icing", prop)):
            return WXIDX["icing"]
        else:
            return WXIDX["precip"]
