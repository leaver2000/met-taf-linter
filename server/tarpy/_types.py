from typing import TypeVar, NewType
import pandas as pd
import metpy.plots as mp
Series = NewType('pandas.core.series.Series', pd.Series)
DataFrame = NewType('pandas.core.frame.DataFrame', pd.DataFrame)
SkewT = NewType('metpy.plots.SkewT', mp.SkewT)
