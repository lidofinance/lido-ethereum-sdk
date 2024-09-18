import { StethL2Demo, WstethL2Demo } from './tokens';
import { WrapL2Demo } from './wrap-l2';

export const L2 = () => {
  return (
    <>
      <WrapL2Demo />
      <WstethL2Demo />
      <StethL2Demo />
    </>
  );
};
