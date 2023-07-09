import React from "react";

type CallbackFunction = (...args: any[]) => void;

const useOutsideClick = (ref:React.RefObject<HTMLElement>, callback: CallbackFunction) => {

  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  React.useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default useOutsideClick;