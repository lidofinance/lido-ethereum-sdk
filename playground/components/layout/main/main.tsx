import { FC, PropsWithChildren } from 'react';
import { MainStyle } from './mainStyles';

const Main: FC<PropsWithChildren> = (props) => {
  return <MainStyle size="tight" forwardedAs="main" {...props} />;
};

export default Main;
