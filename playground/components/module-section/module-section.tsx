import type { ReactNode } from 'react';
import {
  ActionGroupHeaderStyle,
  ActionGroupParamsStyle,
  ActionGroupStyle,
  ActionGroupTitleStyle,
  ActionListStyle,
  DescriptionStyle,
  ModuleHeaderStyle,
  ModuleSectionStyle,
  ModuleTitleStyle,
} from './styles';

type ModuleSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

/** Page-level wrapper for a playground module. */
export const ModuleSection = ({
  title,
  description,
  children,
}: ModuleSectionProps) => (
  <ModuleSectionStyle>
    <ModuleHeaderStyle>
      <ModuleTitleStyle>{title}</ModuleTitleStyle>
      {description && <DescriptionStyle>{description}</DescriptionStyle>}
    </ModuleHeaderStyle>
    <ActionListStyle>{children}</ActionListStyle>
  </ModuleSectionStyle>
);

type ActionGroupProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Inputs shared by every action in the group. */
  params?: ReactNode;
  /** Keep the group pinned while scrolling (for page-wide params). */
  sticky?: boolean;
  children?: ReactNode;
};

/** Groups related actions (send / populate / simulate…) around shared params. */
export const ActionGroup = ({
  title,
  description,
  params,
  sticky = false,
  children,
}: ActionGroupProps) => (
  <ActionGroupStyle $sticky={sticky}>
    <ActionGroupHeaderStyle>
      <ActionGroupTitleStyle>{title}</ActionGroupTitleStyle>
      {description && <DescriptionStyle>{description}</DescriptionStyle>}
    </ActionGroupHeaderStyle>
    {params && (
      <ActionGroupParamsStyle aria-label="Shared parameters">
        {params}
      </ActionGroupParamsStyle>
    )}
    {children && <ActionListStyle>{children}</ActionListStyle>}
  </ActionGroupStyle>
);
