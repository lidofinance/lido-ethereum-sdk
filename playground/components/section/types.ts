import React, { ComponentPropsWithoutRef, FC } from 'react';

export type SectionComponent = FC<
  ComponentPropsWithoutRef<'section'> & {
    title?: React.ReactNode;
    headerDecorator?: React.ReactNode;
  }
>;
