# /usr/bin/python3
from typing import Dict, List, TextIO, Union
import pandas as pd
import numpy.typing as npt
import numpy as np
from datetime import datetime, timedelta
import json
from tarpy._tparse import TParse
from tarpy._tsounding import TSounding
from tarpy._tmeteogram import TMeteogram
import re
np.seterr(divide="ignore", invalid="ignore")



INDEX_SFC = [
    '10_m_agl_spd',
    '10_m_agl_dir',
    'noncv_gust_spd',
    
    'visibility',

    'tstm_flag',

    'fog_probability',

    'prob_fzra',
    'prob_pl',
    'prob_mix',
    'prob_sn',
    'prob_ra',
    'prob_rasn',
    'prob_any_precip',
    'llws_prob',

    'cloud_base1',
    'cloud_cover1',
    'cloud_base2',
    'cloud_cover2',
    'cloud_base3',
    'cloud_cover3',
    'cloud_base4',
    'cloud_cover4',

    '2_m_agl_tmp',

    'altimeter',
]

SKEWT_DESCRIPTION = """\
The Array should be mapped -> Tuple destructured -> reformat [{x,y},...]\n
This method reduces data transfer and is a fast to generate the dataset object\n
const [temp,dpt,...] = dataset.map(([mbar,gph,tmp,dewpt,wndspd,wnddir],i)=>\
([{ x: temp, y: mbar },{ x: dewpt, y: mbar },...]))\n
datasetFormat: [(milibars(mb), gph(ft), temp(°c), dewpoint(°c), windSpeed(kt), windDirection),...]
"""


class Tarpy(TParse):

    # ! development still required...
    # ?     - file type checking
    # ?     - reduce Tarp class bloat by moving self assigned attributes to external class
    def __init__(self, filein: TextIO):

        self.properties: Dict[str, Union[str, datetime]] = {
            "description": ""
        }
        self.DataFrame: pd.DataFrame = pd.DataFrame
        self.NDArray: npt.NDArray = npt.NDArray
        self._parseprops(filein)

        self._parsemodels(filein)

    def skewt(self): return TSounding(
        self.properties, self.DataFrame, self.milibars)

    def mgram(self): return TMeteogram(
        self.properties, self.DataFrame, self.milibars)

    @staticmethod
    def _make_valid_times(props):
        basetime = props['basetime']
        forecast_hours = props['forecast_hours']
        # print(basetime)
        timeD = np.datetime64(basetime, 's')+forecast_hours
        return timeD

    @staticmethod
    def _chartify_upperair(df: pd.DataFrame):
        thermals = {}
        _thermals = ('temp', 'dewpt')
        for col in df.columns:
            if(col in _thermals):
                thermals[col] = np.around(df[col]-273.15, 2).tolist()

        dataset = {
            'thermals': thermals

        }
        return dataset

    @staticmethod
    def _chartify_surface(df: pd.DataFrame):
        pressures = {}
        two_m_values = {}
        wind_data = {}
        prob = {}
        # print(df)
        # thermals = ('2_m_agl_wbt', '2_m_agl_tmp', '2_m_agl_dpt')
        thermals = {}

        _pressures = ('altimeter', 'press_alt', 'density_alt')
        _thermals = ('2_m_agl_wbt', '2_m_agl_tmp', '2_m_agl_dpt')

        for col in df.columns:
            if(col in _pressures):
                pressures[col] = df[col].to_list()

            elif(col in _thermals):
                thermals[col] = np.around(df[col]-273.15, 2).tolist()

            elif(bool(re.search(r'_dir|_spd', col))):
                wind_data[col] = df[col].to_list()

            # elif(bool(re.search(r'prob_',col))):
            #     prob[col]=df[col].to_list()

            else:
                # print(col)
                pass

        dataset = {
            'pressures': pressures,
            'thermals': thermals,
            # 'two_m_values': two_m_values,
            # 'wind_data': wind_data,
            # 'prob': prob
        }
        return dataset
        # print(two_m_values)
        # return{
        #     'pressure': pressure,
        #     'thermals':thermals,
        #     # 'two_m_values': two_m_values,
        #     'wind_data': wind_data,
        #     # 'prob': prob
        # }

    @staticmethod
    def _forecast_hours(basetime, fcsthrs):
        timeD = np.datetime64(basetime)+fcsthrs
        return np.datetime_as_string(timeD, unit='s')

    def _feature(self, dataset: dict, forecast_hours: bool = False,
                 setdefault_props: 'tuple[str,dict|list|str|int]' = None) -> Dict:

        props = self.properties
        bt = self.properties['basetime']

        properties = {
            # 'description': '',
            'icao': 'KBLV',
            'basetime': bt.isoformat(),
        }

        geometry = {
            'type': 'Point',
            'coordinates': [
                    props['longitude'],
                    props['latitude']
            ]
        }

        feature = {
            'type': 'Feature',
            'geometry': geometry,
            'properties': properties,
            'dataset': dataset
        }

        if (forecast_hours):
            fh = self._forecast_hours(bt, props['forecast_hours'])
            properties.setdefault('forecastHours', fh.tolist())

        if(setdefault_props is not None):
            properties.setdefault(*setdefault_props)

        return feature

    def temporal_series(self, lvl: str = 'sfc'):
        # print(self.DataFrame.loc[[('200mb', "temp"), ('200mb', "dewpt")]])

        forecast_hours: list[str] = np.datetime_as_string(
            self._make_valid_times(self.properties)).tolist()

        if(lvl == 'sfc'):
            dataset: list[dict[str, list]] = self._chartify_surface(
                self.DataFrame.T[lvl])

        else:
            dataset: list[dict[str, list]] = self._chartify_upperair(
                self.DataFrame.T[lvl])
            # print(dataset)
        feature = self._feature(dataset, forecast_hours=True)
        return feature
        return {
            'forecastHours': forecast_hours,
            'dataset': dataset
        }

    # def _thermals(self, index: int) -> tuple:
    #     return (self.data['tmp'][:, index] * units.degK,
    #             self.data['dpt'][:, index] * units.degK)

    # print(x)
    # return x
    @staticmethod
    def _make_mbars(length: int):
        return np.flip(np.arange(length, dtype=int)*25+50)

    @staticmethod
    def _flip_around(series: pd.Series):
        """elevation series method -> flips and rounds temps for charting skew-t"""
        return np.around(series-273.15, 2)

    def elevation_series2(self, forecast_hour=0):
        series = self.DataFrame[forecast_hour]

        temp = np.around(series.loc[(slice(None), "temp"), ] - 273.15, 2)
        dewpt = np.around(series.loc[(slice(None), "dewpt"), ] - 273.15, 2)
        gph = series.loc[(slice(None), "gph"), ]
        wndspd = series.loc[(slice(None), "speed"), ]
        wnddir = series.loc[(slice(None), "dir"), ]
        mbars = self._make_mbars(len(temp))
        # print(gph)
        dataset = np.squeeze(
            np.dstack((mbars, gph, temp, dewpt, wndspd, wnddir))).tolist()

        feature = self._feature(
            dataset=dataset, setdefault_props=('description', SKEWT_DESCRIPTION))
        return feature

    def elevation_series3(self, forecast_hour=0):
        series = self.DataFrame[forecast_hour]

        temp = np.around(series.loc[(slice(None), "temp"), ] - 273.15, 2)
        dwpt = np.around(series.loc[(slice(None), "dewpt"), ] - 273.15, 2)
        hght = series.loc[(slice(None), "gph"), ]
        wspd = series.loc[(slice(None), "speed"), ]
        wdir = series.loc[(slice(None), "dir"), ]
        press = self._make_mbars(len(temp))
        # print(dict(press=press))
        # dataset = np.squeeze(np.dstack(('press', press)))
        stacked_datums = np.squeeze(
            np.dstack((press, hght, temp, dwpt, wspd, wdir)))

        keys = ['press', 'hght', 'temp', 'dwpt', 'wspd', 'wdir']
        dataset = [dict(zip(keys, datums)) for datums in stacked_datums]
        feature = self._feature(dataset=dataset)

        return feature

    def elevation_dataframe(self):
        df = self.DataFrame.T
        temp = np.around(df.loc[:, (slice(None), "temp")] - 273.15, 2)
        dwpt = np.around(df.loc[:, (slice(None), "dewpt"), ] - 273.15, 2)
        hght = df.loc[:, (slice(None), "gph"), ]
        wspd = df.loc[:, (slice(None), "speed"), ]
        wdir = df.loc[:, (slice(None), "dir"), ]
        press = self._make_mbars(39)

        dataset = {
            'press': press.tolist(),
            'hght': hght.values.tolist(),
            'temp': temp.values.tolist(),
            'dwpt': dwpt.values.tolist(),
            'wspd': wspd.values.tolist(),
            'wdir': wdir.values.tolist()
        }
        feature = self._feature(dataset=dataset)
        return feature





        # return df

    def generate_taf(self, start=40, stop=90):

        df =self.DataFrame.loc[(['sfc'],slice(None)),range(start,stop)]#.astype(int)
        df.index = df.index.droplevel(0)

        sfc_df = df.loc[INDEX_SFC,].rename(index={
            '10_m_agl_spd':'wspd',
            '10_m_agl_dir':'wdir',
            'noncv_gust_spd':'wgust',
            'visibility': 'vis',
            'tstm_flag':'prob_tsra',
            'fog_probability':'prob_fog',
            '2_m_agl_tmp':'temp',
            'altimeter':'altsg',
            'llws_prob':'prob_llws'
        })
        print(list(sfc_df.index))

        lines =[]
        for i,(col,val) in enumerate(sfc_df.iteritems()):
            print(i)
            wind = self._taf_winds(val['wdir'],val['wspd'],val['wgust'])
            vis = self._taf_visibility(val['vis'])
            wx = self._taf_pres_wx(val.astype(int))
            cloud_layers = self._taf_cloud_layers(val)
            altsg = f"QNH{int(val['altsg']*100)}INS"

            if i ==0:
                head ='TAF KMTC 070100Z'
            else:
                head = f' BECMG 0708/0709'
            line =  f'{head} {wind} {vis}{wx}{cloud_layers} {altsg}'
            lines.append(line)
        
        # return None

        return '\n'.join(lines)

    @staticmethod
    def _taf_pres_wx(val):
        pap = val['prob_any_precip']
        if pap == 0:
            return ' '
        else:
            pr = val['prob_ra']
            if pr <= 30:
                return ' -RA '
            elif pr <=60:
                return ' RA '
            else:
                return ' +RA '
        #     print(pr)
        # # print(p)
        # return
    def _taf_cloud_layers(self,val):
        layer1 = self._get_cloud_layer(val['cloud_cover1'],val['cloud_base1'])

        if layer1 =='SKC':
            cloud_layers = layer1

        else:
            layer2 = self._get_cloud_layer(val['cloud_cover2'],val['cloud_base2'])
            
            if layer2 =='SKC':
                cloud_layers = layer1

            else:
                layer3 = self._get_cloud_layer(val['cloud_cover3'],val['cloud_base3'])

                if layer3 =='SKC':
                    cloud_layers =  f'{layer1} {layer2}'

                else:
                    layer4 = self._get_cloud_layer(val['cloud_cover4'],val['cloud_base4'])
                    if layer4 =='SKC':
                        cloud_layers = f'{layer1} {layer2} {layer3}'
                    else:
                        cloud_layers = f'{layer1} {layer2} {layer3} {layer4}'

        return cloud_layers


    @staticmethod
    def _get_cloud_layer(cover,base):
        if cover == 0:
            return 'SKC'
        elif cover  <= 2:
            c = 'FEW'
        elif cover <= 3:
            c = 'SCT'
        elif cover <= 5:
            c = 'BKN'
        else:
            c = 'OVC'

        b = base
        return f'{c}{b:03n}'

    @staticmethod
    def _taf_visibility(vis):
        vis = int(vis)
        if vis >= 7:
            return '9999'
        return round(vis * 1609.344/100)*100

    @staticmethod    
    def _taf_winds(wdir,wspd,wgust):
        wind = round(wdir/10)*10
        speed = round(wdir/2)*2
        gust = round(wgust/2)*2
        if gust>15:
            gust =f'G{gust:02n}'
        else:
            gust =''

        return f'{wind:03n}{wspd:02n}{gust}KT'


# { press: 650, hght: 3673.08, temp: -2.67, dwpt: -12.4, wdir: 28.0, wspd: 302.23 },
# 1000mb  GPH (m):     	  166.88,  165.16,  162.34,  159.50,  161.16,  160.70,  161.16,  164.98,  165.70,  164.82,  163.34,  162.34,  158.34,  153.52,  150.18,  147.18,  145.72,  145.72,  145.84,  144.54,  146.00,  146.76,  144.64,  144.12,  144.90,  144.54,  143.18,  141.84,  142.66,  143.94,  144.94,  146.66,  148.78,  148.96,  145.84,  141.84,  136.12,  128.66,  120.44,  116.66,  114.50,  113.42,  116.02,  114.77,  113.53,  112.28,  109.00,  105.72,  102.44,   97.50,   92.56,   87.62,   85.30,   82.99,   80.68,   82.66,   84.64,   86.62,   78.45,   70.28,   62.12,   55.95,   49.78,   43.62,   38.65,   33.68,   28.71,   26.56,   24.41,   22.25,   20.78,   19.30,   17.82,   18.34,   18.86,   19.38,   24.23,   29.07,   33.92,   39.10,   44.28,   49.46,   49.72,   49.99,   50.26,   56.58,   62.90,   69.22,   79.36,   89.50,   99.64,  105.31,  110.98,  116.64,  119.50,  122.35,  125.20,  126.42,  127.64,  128.86,  132.69,  136.51,  140.34,  142.01,  143.67,  145.34,  139.01,  132.67,  126.34,  120.35,  114.37,  108.38,  107.47,  106.57,  105.66,   99.96,   94.27,   88.58,   81.61,   74.65,   67.68,   64.92,   62.16,   59.39,   44.82,   30.25,   15.68,    8.73,    1.77,   -5.18,  -16.35,  -27.52,  -38.68,  -42.91,  -47.13,  -51.36,  -48.50,  -45.64,  -42.78,  -39.97,  -37.16,  -34.34,  -32.48,  -30.62,  -28.76,
# 1000mb  GPH DVal(m): 	   56.00,   54.28,   51.46,   48.62,   50.28,   49.82,   50.28,   54.09,   54.82,   53.93,   52.46,   51.46,   47.46,   42.64,   39.30,   36.30,   34.84,   34.84,   34.96,   33.66,   35.12,   35.87,   33.75,   33.23,   34.02,   33.66,   32.30,   30.96,   31.77,   33.05,   34.05,   35.77,   37.89,   38.07,   34.96,   30.96,   25.23,   17.77,    9.55,    5.77,    3.61,    2.53,    5.14,    3.89,    2.64,    1.40,   -1.88,   -5.17,   -8.45,  -13.39,  -18.33,  -23.27,  -25.58,  -27.89,  -30.21,  -28.23,  -26.25,  -24.27,  -32.43,  -40.60,  -48.77,  -54.94,  -61.10,  -67.27,  -72.24,  -77.20,  -82.17,  -84.33,  -86.48,  -88.63,  -90.11,  -91.59,  -93.07,  -92.55,  -92.02,  -91.50,  -86.66,  -81.81,  -76.97,  -71.79,  -66.61,  -61.43,  -61.16,  -60.89,  -60.63,  -54.30,  -47.98,  -41.66,  -31.52,  -21.38,  -11.24,   -5.58,    0.09,    5.76,    8.61,   11.46,   14.32,   15.54,   16.76,   17.98,   21.80,   25.63,   29.46,   31.12,   32.79,   34.46,   28.12,   21.79,   15.46,    9.47,    3.48,   -2.50,   -3.41,   -4.32,   -5.23,  -10.92,  -16.61,  -22.31,  -29.27,  -36.24,  -43.20,  -45.97,  -48.73,  -51.49,  -66.06,  -80.63,  -95.20, -102.16, -109.11, -116.07, -127.23, -138.40, -149.57, -153.79, -158.02, -162.25, -159.39, -156.53, -153.67, -150.85, -148.04, -145.23, -143.37, -141.51, -139.65,
# 1000mb  Temp (K):    	  283.88,  283.48,  283.09,  282.57,  282.16,  281.83,  281.51,  281.33,  282.10,  282.98,  283.56,  284.11,  284.78,  285.36,  285.80,  285.93,  285.93,  285.70,  284.88,  284.21,  283.76,  283.39,  282.76,  282.08,  281.82,  281.54,  281.03,  280.67,  280.38,  280.28,  280.23,  280.44,  282.13,  284.26,  285.90,  286.92,  287.64,  288.15,  288.42,  288.76,  288.83,  288.58,  288.07,  287.99,  287.90,  287.81,  287.87,  287.93,  287.98,  288.04,  288.09,  288.15,  288.63,  289.10,  289.58,  290.41,  291.24,  292.07,  292.93,  293.79,  294.66,  295.37,  296.08,  296.79,  296.65,  296.51,  296.37,  295.86,  295.34,  294.83,  294.26,  293.69,  293.13,  292.67,  292.20,  291.74,  290.46,  289.18,  287.91,  287.13,  286.35,  285.57,  286.00,  286.42,  286.84,  286.70,  286.56,  286.43,  285.97,  285.52,  285.07,  284.78,  284.49,  284.20,  283.95,  283.70,  283.45,  283.31,  283.17,  283.03,  282.94,  282.84,  282.75,  283.01,  283.27,  283.53,  284.01,  284.50,  284.98,  285.48,  285.98,  286.48,  286.25,  286.02,  285.79,  285.50,  285.22,  284.93,  284.73,  284.53,  284.34,  284.12,  283.91,  283.70,  283.85,  284.01,  284.16,  284.62,  285.07,  285.52,  286.27,  287.02,  287.77,  288.59,  289.41,  290.24,  289.73,  289.22,  288.72,  288.49,  288.27,  288.05,  287.72,  287.40,  287.07,
# 1000mb  Temp DVal(K):	   -3.56,   -3.96,   -4.35,   -4.87,   -5.28,   -5.61,   -5.93,   -6.11,   -5.34,   -4.46,   -3.88,   -3.33,   -2.66,   -2.08,   -1.64,   -1.51,   -1.51,   -1.74,   -2.56,   -3.23,   -3.68,   -4.05,   -4.68,   -5.36,   -5.62,   -5.90,   -6.41,   -6.77,   -7.06,   -7.15,   -7.21,   -7.00,   -5.31,   -3.17,   -1.53,   -0.51,    0.20,    0.71,    0.98,    1.32,    1.39,    1.14,    0.63,    0.55,    0.46,    0.37,    0.43,    0.49,    0.55,    0.60,    0.65,    0.71,    1.19,    1.67,    2.14,    2.97,    3.80,    4.63,    5.49,    6.35,    7.22,    7.93,    8.64,    9.36,    9.21,    9.07,    8.93,    8.42,    7.90,    7.39,    6.82,    6.26,    5.69,    5.23,    4.76,    4.30,    3.02,    1.74,    0.47,   -0.31,   -1.09,   -1.87,   -1.44,   -1.02,   -0.60,   -0.74,   -0.88,   -1.01,   -1.47,   -1.92,   -2.37,   -2.66,   -2.95,   -3.24,   -3.49,   -3.74,   -3.99,   -4.13,   -4.27,   -4.41,   -4.50,   -4.59,   -4.68,   -4.43,   -4.17,   -3.91,   -3.43,   -2.94,   -2.45,   -1.96,   -1.46,   -0.96,   -1.19,   -1.42,   -1.65,   -1.94,   -2.22,   -2.51,   -2.71,   -2.91,   -3.10,   -3.32,   -3.53,   -3.74,   -3.59,   -3.43,   -3.28,   -2.82,   -2.37,   -1.92,   -1.17,   -0.42,    0.33,    1.15,    1.97,    2.80,    2.29,    1.78,    1.28,    1.06,    0.83,    0.61,    0.28,   -0.04,   -0.37,
# 1000mb  Dewpt (K):   	  280.18,  280.17,  280.17,  280.08,  280.08,  280.06,  280.02,  280.07,  279.96,  279.52,  279.10,  279.05,  279.30,  279.49,  279.48,  279.22,  278.99,  279.03,  278.84,  278.31,  277.71,  277.22,  276.56,  277.37,  278.89,  279.03,  278.44,  278.05,  277.92,  278.17,  278.56,  278.84,  279.67,  280.07,  280.89,  281.58,  282.23,  282.83,  283.60,  284.29,  284.91,  285.35,  285.64,  285.93,  286.20,  286.47,  286.41,  286.35,  286.28,  286.15,  286.02,  285.88,  286.69,  287.50,  288.30,  289.25,  290.19,  291.14,  291.76,  292.37,  292.97,  293.03,  293.06,  293.05,  292.66,  292.27,  291.88,  291.71,  291.53,  291.35,  291.32,  291.27,  291.20,  290.47,  289.73,  288.99,  286.86,  284.69,  282.48,  282.32,  282.14,  281.93,  282.98,  284.02,  285.04,  284.89,  284.73,  284.58,  284.07,  283.57,  283.06,  282.55,  282.04,  281.52,  281.44,  281.36,  281.27,  281.32,  281.36,  281.40,  281.46,  281.53,  281.60,  281.49,  281.37,  281.24,  280.84,  280.38,  279.86,  279.96,  280.05,  280.13,  280.35,  280.56,  280.76,  281.05,  281.31,  281.56,  281.49,  281.42,  281.35,  281.61,  281.85,  282.08,  282.55,  283.02,  283.48,  283.95,  284.42,  284.89,  285.66,  286.44,  287.22,  287.70,  288.17,  288.62,  288.17,  287.71,  287.25,  286.83,  286.40,  285.97,  285.47,  284.97,  284.47,
# 1000mb  RH (%):      	   77.88,   79.97,   82.05,   84.47,   86.79,   88.64,   90.31,   91.75,   86.40,   79.03,   73.85,   70.95,   69.06,   67.34,   65.37,   63.69,   62.67,   63.82,   66.44,   66.95,   66.19,   65.52,   65.28,   72.34,   81.83,   84.18,   83.68,   83.48,   84.33,   86.40,   89.10,   89.52,   84.58,   75.33,   71.54,   70.15,   69.96,   70.52,   72.90,   74.71,   77.47,   81.03,   85.37,   87.47,   89.57,   91.67,   90.96,   90.25,   89.53,   88.45,   87.37,   86.29,   88.25,   90.20,   92.15,   92.88,   93.62,   94.35,   92.95,   91.55,   90.14,   86.61,   83.07,   79.53,   78.31,   77.09,   75.88,   77.45,   79.02,   80.60,   83.28,   85.97,   88.65,   87.12,   85.59,   84.06,   79.36,   74.65,   69.95,   72.77,   75.60,   78.42,   81.91,   85.40,   88.89,   88.78,   88.68,   88.58,   88.22,   87.86,   87.49,   86.18,   84.86,   83.55,   84.48,   85.42,   86.36,   87.43,   88.51,   89.58,   90.55,   91.53,   92.50,   90.25,   87.99,   85.74,   80.77,   75.80,   70.82,   69.02,   67.21,   65.41,   67.42,   69.44,   71.46,   74.24,   77.02,   79.81,   80.48,   81.15,   81.82,   84.46,   87.10,   89.74,   91.67,   93.60,   95.53,   95.65,   95.76,   95.88,   96.10,   96.33,   96.55,   94.43,   92.32,   90.21,   90.47,   90.73,   90.99,   89.78,   88.57,   87.36,   86.33,   85.31,   84.29,
# 1000mb  Parcel Temp: 	    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,
# 1000mb  Theta-E (K): 	  301.55,  301.11,  300.69,  300.03,  299.59,  299.21,  298.82,  298.68,  299.38,  299.83,  299.98,  300.52,  301.51,  302.34,  302.80,  302.65,  302.39,  302.19,  301.11,  299.83,  298.72,  297.85,  296.55,  296.60,  297.89,  297.75,  296.58,  295.78,  295.35,  295.50,  295.85,  296.37,  299.08,  301.83,  304.59,  306.56,  308.19,  309.57,  310.98,  312.39,  313.44,  313.87,  313.79,  314.18,  314.54,  314.90,  314.86,  314.83,  314.78,  314.62,  314.44,  314.27,  316.20,  318.22,  320.28,  323.15,  326.11,  329.25,  331.74,  334.27,  336.86,  337.86,  338.78,  339.60,  338.40,  337.21,  336.04,  335.02,  333.98,  332.95,  332.22,  331.45,  330.61,  328.38,  326.21,  324.12,  318.56,  313.48,  308.83,  307.76,  306.68,  305.55,  307.44,  309.40,  311.45,  311.06,  310.65,  310.27,  309.00,  307.76,  306.53,  305.52,  304.52,  303.53,  303.16,  302.79,  302.40,  302.31,  302.21,  302.11,  302.09,  302.07,  302.07,  302.21,  302.33,  302.45,  302.48,  302.45,  302.36,  303.01,  303.65,  304.28,  304.30,  304.30,  304.30,  304.35,  304.37,  304.38,  304.07,  303.76,  303.46,  303.57,  303.64,  303.71,  304.51,  305.33,  306.14,  307.33,  308.52,  309.75,  311.82,  313.98,  316.19,  318.01,  319.84,  321.66,  320.20,  318.75,  317.32,  316.31,  315.30,  314.31,  313.11,  311.95,  310.81,
# 1000mb  Dir:         	  300.86,  305.02,  310.45,  303.48,  295.93,  291.48,  274.68,  270.46,  270.31,  280.81,  288.25,  292.81,  297.49,  302.26,  310.24,  317.81,  323.07,  343.00,   11.36,   44.73,   68.86,   94.68,  143.76,  175.06,  169.70,  119.89,  115.18,   92.85,   92.21,  103.45,  113.81,  121.39,  126.65,  126.46,  131.97,  136.60,  144.73,  156.73,  150.80,  152.18,  140.09,  127.76,  128.90,  118.67,  110.05,  103.00,  112.40,  121.67,  130.35,  145.45,  159.37,  170.92,  172.70,  174.23,  175.56,  175.52,  175.48,  175.44,  175.03,  174.64,  174.27,  178.09,  181.42,  184.33,  182.17,  180.38,  178.88,  179.06,  179.22,  179.36,  179.33,  179.31,  179.27,  193.61,  213.02,  234.61,  239.30,  244.00,  248.65,  248.96,  249.28,  249.62,  257.21,  265.55,  274.38,  284.08,  291.53,  297.26,  305.55,  314.45,  323.56,  325.42,  327.64,  330.30,  328.33,  326.24,  324.04,  326.78,  329.83,  333.23,  333.14,  333.04,  332.92,  344.10,  357.33,   11.56,   25.32,   46.84,   73.95,   87.22,   99.39,  109.69,  115.68,  120.55,  124.54,  121.83,  119.96,  118.59,  120.42,  122.45,  124.71,  125.91,  127.48,  129.61,  131.68,  132.79,  133.48,  135.68,  138.08,  140.69,  144.79,  149.46,  154.76,  178.28,  207.31,  230.44,  233.85,  236.71,  239.13,  250.47,  260.39,  268.68,  269.42,  270.19,  270.98,
# 1000mb  Speed(kt):   	    6.00,    6.00,    6.00,    6.00,    6.00,    6.00,    6.00,    6.00,    6.00,    8.00,    8.00,    8.00,    9.00,    9.00,    9.00,    8.00,    6.00,    5.00,    5.00,    4.00,    4.00,    4.00,    5.00,    6.00,    3.00,    3.00,    4.00,    5.00,    6.00,    7.00,    8.00,    8.00,    8.00,    8.00,    8.00,    8.00,    8.00,    8.00,    8.00,    9.00,    7.00,    7.00,    7.00,    8.00,    8.00,    9.00,    9.00,    9.00,   10.00,   10.00,   11.00,   12.00,   13.00,   14.00,   15.00,   14.00,   14.00,   14.00,   14.00,   14.00,   15.00,   16.00,   17.00,   18.00,   20.00,   22.00,   23.00,   25.00,   26.00,   27.00,   25.00,   23.00,   21.00,   18.00,   16.00,   16.00,   16.00,   16.00,   16.00,   16.00,   15.00,   15.00,   14.00,   14.00,   13.00,   15.00,   17.00,   20.00,   19.00,   18.00,   18.00,   17.00,   16.00,   14.00,   14.00,   13.00,   13.00,   12.00,   12.00,   11.00,   10.00,   10.00,    9.00,    8.00,    7.00,    7.00,    6.00,    5.00,    5.00,    5.00,    5.00,    6.00,    6.00,    7.00,    8.00,    9.00,   11.00,   13.00,   12.00,   12.00,   11.00,   10.00,    8.00,    7.00,   10.00,   13.00,   16.00,   16.00,   15.00,   14.00,   13.00,   13.00,   12.00,   10.00,   10.00,   12.00,   13.00,   14.00,   15.00,   16.00,   18.00,   19.00,   19.00,   19.00,   18.00,
# 1000mb  Clouds(%):   	    0.00,    0.00,    0.00,    6.00,   13.00,   18.00,   23.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    0.00,    3.00,    8.00,   16.00,   60.00,   60.00,   24.00,   24.00,   21.00,    0.00,    0.00,    0.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   25.00,   43.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,    0.00,    0.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,   59.00,   53.00,   53.00,   52.00,   52.00,   51.00,   49.00,   48.00,   45.00,   46.00,   53.00,   53.00,   53.00,   53.00,   60.00,   60.00,   60.00,   60.00,   60.00,   60.00,
# 1000mb  FL-Vis (sm): 	    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,    7.00,
# 1000mb  Mixing Ratio:	    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.00,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,    0.01,
# 1000mb  CWMR (g/kg): 	  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,  0.0000,
# 1000mb  Icing Type:  	    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,    None,
# 1000mb  Turbulence:  	        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,        ,
# 1000mb  VVS (-ub/s):

    def elevation_series(self, forecast_hour=0):
        series = self.DataFrame[forecast_hour]

        temp = self._flip_around(series.loc[(slice(None), "temp"), ])
        dpt = self._flip_around(series.loc[(slice(None), "dewpt"), ])
        lvls = self._make_mbars(len(temp))

        feature = self._feature(dataset={
            'levels': lvls.tolist(),
            'data': np.squeeze(
                np.dstack((temp, dpt))).tolist()
        })
        return feature

    def geo_json(self, saveas: bool = False):
        df = self.DataFrame
        props = self.properties
        lat = props.pop('latitude')
        lon = props.pop('longitude')

        timeD = np.datetime64(
            props['basetime'])+props['forecast_hours']

        props['basetime'] = props['basetime'].isoformat()
        props['forecast_hours'] = np.datetime_as_string(
            timeD, unit='s').tolist()

        model = {}
        for (lvl, prop), row in df.iterrows():
            model.setdefault(lvl, {})
            model[lvl].update({prop: row.to_list()})

        return json.dumps({
            "type": "Feature",
            "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
            },
            "properties": props,
            "model": model,
        },)

        sfc = {k: self.surface[k].tolist() for k in self.surface.keys()}
        ua = {k: self._tolist(self.upperair[k]) for k in self.upperair.keys()}

    def help(self):
        print("printing avaliable methods:")
        for x in dir(self):
            if not bool(re.match(r"(_.+)", x)):
                print(x)


class TarpVIV:
    def perfomV1(self, x, dtype="percent"):
        """
        performs first verification of model data to determine change in values
        """
        # change in run time
        # timeD = self.props.basetime, - x.props.basetime
        timeD = (self.properties.basetime -
                 x.properties.basetime).total_seconds()

        # change in hours
        idx = int(timeD / 3600)
        # print(idx)
        # slice currentMatrix tail by idx offset
        cM = self.asMatrix(np.s_[: -idx])
        # slice previousMatrix head by idx offset
        xM = x.asMatrix(np.s_[idx:])
        #
        matrices = np.array([cM, xM])
        # DIFFRENCE
        diff = np.diff(matrices, axis=0)
        # * PERCENT CHANGE
        pc = (
            np.divide(
                diff,
                cM,  # ?diff/currentMatrix -> 0 where 0/0
                out=np.zeros_like(diff),
                where=cM != 0,
            )
            * 100
        )
        # print(pc)

        return pd.DataFrame(dict(zip(self.models.keys, return_value[dtype])))

    def perfomI1(self, data, dtype=None):
        return None

    def perfomV2(self, data, dtype=None):
        return None

    def applyVIV(self, data, dtype=None):
        return None
