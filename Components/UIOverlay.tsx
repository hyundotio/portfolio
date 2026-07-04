import { ReactNode } from "react";

interface Props {
  uiComponent: ReactNode | null;
}

const UIOverlay = ({ uiComponent }: Props) => {
  return <>{uiComponent}</>;
};

export default UIOverlay;
