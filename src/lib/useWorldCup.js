import { useEffect, useState } from "react";
import { loadWorldCup } from "./wcApi";

let cache = null;
let inflight = null;

function fetchOnce() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = loadWorldCup()
    .then((d) => {
      cache = d;
      inflight = null;
      return d;
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
}

export function useWorldCup() {
  const [data, setData] = useState(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    fetchOnce()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}
