import { useCallback, useMemo } from 'react';
type TSearchParams = { [key: string]: any } | string | Record<string, string> | URLSearchParams | string[][] | undefined;
/**
 *
 * ```
 *
 * baseUrl : String = 'http://localhost:5000/api' | process.env.REACT_APP_API
 *
 * callBack : Function = useCallback((res:any,err:any) =>{...})
 *
 * const { getJSON } = useFetch(baseUrl, callBack)
 *
 * path : String = '/somepath'
 *
 * searchParams : String | Record<String, String> | URLSearchParams | String[][] | undefined = { person: 'steve' }
 *
 * useEffect(() => (!!query ? getJSON(path,searchParams) : void null), [getJSON, query]);
 *
 * fetch('http://localhost:5000/api/somepath?person=steve',{ method: 'GET' }).then(...)
 *
 *
 *
 * ```
 */
export function useFetch(baseUrl: string) {
	// export function useFetch(baseUrl: string, callBack: (res: any, err?: Error | undefined) => any) {
	const _url = !!baseUrl ? baseUrl : !!process.env.REACT_APP_API ? process.env.REACT_APP_API : '';
	const url = useCallback(
		(path: string, searchParams?: TSearchParams) => {
			if (!!path && !!searchParams) return `${_url}${path}?${new URLSearchParams(searchParams)}`;
			else if (!!path) return _url.concat(path);
			else return _url;
		},
		[_url]
	);
	const getJSON = useCallback(
		(path: string, searchParams: TSearchParams = {}, callback: (res: any, err?: Error | undefined) => any) => {
			const method = 'GET';

			fetch(url(path, searchParams), { method })
				.then((res) => res.json())
				.then((res) => callback(res, undefined));
			// .catch(onError);
		},
		[url]
	);
	return useMemo(() => {
		// const onSuccess = (res: any) => (res, undefined);
		// const onError = (err: Error) => ({}, err);
		return {
			getJSON,
			postJSON: (path: string, data: object) => {
				const method = 'MERGE';
				const body = JSON.stringify(data);

				fetch(url(path), { method, body }).then((res) => res.json());
				// .then(onSuccess)
				// .catch(onError);
			},
			putJSON: (path: string, data: object) => {
				const method = 'MERGE';
				const body = JSON.stringify(data);

				fetch(url(path), { method, body }).then((res) => res.json());
				// .then(onSuccess)
				// .catch(onError);
			},
			delete: (path: string, searchParams: TSearchParams) => {
				const method = 'DELETE';

				fetch(url(path), { method }).then((res) => res.json());
				// .then(onSuccess)
				// .catch(onError);
			},
			url,
		};
	}, [getJSON, url]);
}
