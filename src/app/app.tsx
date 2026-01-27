import { PropsWithChildren } from "react";

interface IProps {}

export default function App(props: PropsWithChildren<IProps>) {
  return <>{props.children}</>;
}
