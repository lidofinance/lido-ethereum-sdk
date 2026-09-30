import { Input } from '@lidofinance/lido-ui';
import { useMemo, useState } from 'react';
import type { DemoLayer, DemoModule } from 'demo/registry';
import {
  SidebarEmptyStyle,
  SidebarGroupStyle,
  SidebarGroupTitleStyle,
  SidebarLinkStyle,
  SidebarStyle,
  SidebarToggleStyle,
} from './sidebarStyles';

type SidebarProps = {
  modules: readonly DemoModule[];
  activeId?: string;
  layer: DemoLayer;
};

const LAYER_HINT: Record<DemoLayer, string> = {
  l1: 'Switch to an Ethereum network to use this module',
  l2: 'Switch to an L2 network to use this module',
};

export const Sidebar = ({ modules, activeId, layer }: SidebarProps) => {
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(false);

  const groups = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const result = new Map<string, DemoModule[]>();
    for (const entry of modules) {
      const haystack = `${entry.group} ${entry.title}`.toLowerCase();
      if (query && !haystack.includes(query)) continue;
      result.set(entry.group, [...(result.get(entry.group) ?? []), entry]);
    }
    return [...result.entries()];
  }, [modules, filter]);

  const active = modules.find((entry) => entry.id === activeId);

  return (
    <SidebarStyle $expanded={expanded}>
      <SidebarToggleStyle
        type="button"
        onClick={() => setExpanded((value) => !value)}
      >
        {active ? `${active.group} / ${active.title}` : 'Modules'}
        <span>{expanded ? '▴' : '▾'}</span>
      </SidebarToggleStyle>

      <Input
        fullwidth
        variant="small"
        placeholder="Filter modules"
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />

      {groups.length === 0 && (
        <SidebarEmptyStyle>Nothing matches “{filter}”</SidebarEmptyStyle>
      )}

      {groups.map(([group, items]) => (
        <SidebarGroupStyle key={group}>
          <SidebarGroupTitleStyle>{group}</SidebarGroupTitleStyle>
          {items.map((entry) => {
            const disabled = entry.layer !== layer;
            return (
              <SidebarLinkStyle
                key={entry.id}
                href={disabled ? undefined : `#${entry.id}`}
                title={disabled ? LAYER_HINT[entry.layer] : undefined}
                aria-disabled={disabled}
                aria-current={entry.id === activeId ? 'page' : undefined}
                $active={entry.id === activeId}
                $disabled={disabled}
                onClick={() => setExpanded(false)}
              >
                {entry.title}
              </SidebarLinkStyle>
            );
          })}
        </SidebarGroupStyle>
      ))}
    </SidebarStyle>
  );
};
