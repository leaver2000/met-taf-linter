import io
from PIL import Image
import metpy.calc as mpcalc
from metpy.plots import SkewT
from metpy.units import units
import numpy as np
import pandas as pd
import tarpy._types as tt
from matplotlib import pyplot as plt


class TSounding:

    def __init__(self, props: dict, df: pd.DataFrame, mb: np.array):
        # print(props)
        self.milibars = mb
        self.data = {
            "tmp": np.array(df.loc[(slice(None), "temp"), ]),
            "dpt": np.array(df.loc[(slice(None), "dewpt"), ]),
            "spd": np.array(df.loc[(slice(None), "speed"), ]),
            "dir": np.array(df.loc[(slice(None), "dir"), ])
        }
        return

    def show(self, index: int = 0) -> SkewT:
        """
        providing an index position will generate a Skew-T for the tarp basetime + index forecast hour

        """
        P = self.milibars*units.mbar
        T, Td = self._thermals(index)
        u, v = self._wind_velocity(index)
        skew = SkewT()
        # ?Plot the data using normal plotting functions, in this case using
        # ? log scaling in Y, as dictated by the typical meteorological plot
        skew.plot(P, T, 'r')
        skew.plot(P, Td, 'g')
        skew.plot_barbs(P, u, v)

        # ? Add the relevant special lines
        skew.plot_dry_adiabats()
        skew.plot_moist_adiabats()
        skew.plot_mixing_lines()
        # plt.savefig('foo.png')

        return skew

    def to_bytes(self, index: int = 0) -> SkewT:
        """
        providing an index position will generate a Skew-T for the tarp basetime + index forecast hour

        """
        P = self.milibars*units.mbar
        T, Td = self._thermals(index)
        u, v = self._wind_velocity(index)
        skew = SkewT()
        # ?Plot the data using normal plotting functions, in this case using
        # ? log scaling in Y, as dictated by the typical meteorological plot
        skew.plot(P, T, 'r')
        skew.plot(P, Td, 'g')
        skew.plot_barbs(P, u, v)

        # ? Add the relevant special lines
        skew.plot_dry_adiabats()
        skew.plot_moist_adiabats()
        skew.plot_mixing_lines()
        # plt.savefig('foo.png')
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        im = Image.open(buf)
        im.show()
        return buf.close()
        # print(x)
        # return skew
    # def to_bytes():
    #     return

    def _thermals(self, index: int) -> tuple:
        return (self.data['tmp'][:, index] * units.degK,
                self.data['dpt'][:, index] * units.degK)

    def _wind_velocity(self, index: int) -> tuple:
        speed = self.data['spd'][:, index] * units.knots
        direction = self.data['dir'][:, index] * units.degrees
        return mpcalc.wind_components(speed, direction)
