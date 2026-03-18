import { LinearProgress } from "@mui/material";
import { createContext, useEffect } from "react";
import { useState } from "react";
import ErrorElement from "../ErrorElement";

export const Data = createContext();

const Loader = ({ lc, fn, children, render }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loaderFunction = async () => {
      try {
        setIsLoading(true);
        const { data } = await fn();
        setData(data);
      } catch (error) {
        console.log(error);
        setError(error?.message);
      } finally {
        setIsLoading(false);
      }
    };
    loaderFunction();
  }, []);

  if (isLoading) return lc ? lc : <LinearProgress />;

  if (render && data) return render(data);

  if (data) return <Data.Provider value={data}>{children}</Data.Provider>;

  return <ErrorElement message={error} />;
};

export default Loader;
