import { FC, PropsWithChildren } from 'react';
import { MainStyle } from './mainStyles';

const Main: FC<PropsWithChildren> = (props) => {
  return <MainStyle size="full" forwardedAs="main" {...props} />;
};

export default Main;
