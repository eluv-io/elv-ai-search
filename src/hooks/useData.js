import {useEffect, useState} from "react";

function useData(
  fetcher,
  shouldFetch,
  deps=[]
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if(!shouldFetch) { return; }

    let ignore = false;
    const result = fetcher();

    if(!result || typeof result.then !== "function") {
      return;
    }

    setLoading(true);
    setError(null);

    result
      .then(response => {
        if(!ignore) {
          setData(response);
        }
      })
      .catch(error => {
        if(!ignore) { setError(error); }
      })
      .finally(() => {
        if(!ignore) { setLoading(false); }
      });

    return () => {
      ignore = true;
    };
  }, deps);

  return { data, loading, error };
}

export default useData;
