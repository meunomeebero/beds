import React from 'react';
import { AppShell, DesignSystemProvider, NavItem, SegmentedControl, SidebarHeader, SidebarSection, Stack, Text } from 'beds';

export function HydrationProbe() {
  const [density, setDensity] = React.useState('compact');
  const [policy, setPolicy] = React.useState('allow');
  const sidebar = React.createElement(React.Fragment, null,
    React.createElement(SidebarHeader, null, React.createElement(Text, null, 'Workspace')),
    React.createElement(SidebarSection, { label: 'Espaço', children: React.createElement(NavItem, { label: 'Perfil', icon: 'UserRound', active: true, href: '#perfil' }) }),
  );
  return React.createElement(
    DesignSystemProvider,
    { theme: 'light', children: React.createElement(AppShell, {
      navigationLabel: 'Navegação',
      collapsed: false,
      onCollapsedChange: () => {},
      mobileOpen: false,
      onMobileOpenChange: () => {},
      sidebar,
      children: React.createElement(Stack, null,
        React.createElement(Text, null, 'Hydration probe'),
        React.createElement(SegmentedControl, {
          label: 'Hydration density',
          value: density,
          options: [{ id: 'compact', label: 'Compact' }, { id: 'comfortable', label: 'Comfortable' }],
          onChange: setDensity,
        }),
        React.createElement(SegmentedControl, {
          label: 'Hydration policy',
          value: policy,
          variant: 'joined',
          options: [{ id: 'allow', label: 'Allow' }, { id: 'confirm', label: 'Confirm' }],
          onChange: setPolicy,
        }),
      ),
    }) },
  );
}
