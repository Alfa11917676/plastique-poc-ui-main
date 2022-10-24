import { ReactNode } from "react";

import LandingNavBar from "../components/NavBar";

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Main = (props: IMainProps) => (
  <div className="antialiased w-full  px-4 lg:px-0 p-2">
    {props.meta}
    <div className="customContainer mx-auto">
      <LandingNavBar />
    </div>
    <div className="customContainer mx-auto">{props.children}</div>
  </div>
);

export { Main };
