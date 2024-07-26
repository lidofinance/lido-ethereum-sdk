import React from 'react';
import dynamic from 'next/dynamic';

const NoSSRWrapper = (props: { children: React.ReactNode }) => (
  <>{props.children}</>
);

export default dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
});
