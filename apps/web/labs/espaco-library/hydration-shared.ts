import React from 'react';
import { DesignSystemProvider, Dock, DockItem, DockSeparator, NavItem, SegmentedControl, SidebarHeader, SidebarSection, Stack, Text } from 'beds';
import { AppShell } from './recipes';

function HydrationCompletionMarker() {
  React.useEffect(() => {
    (window as Window & { __bedsHydrationComplete?: boolean }).__bedsHydrationComplete = true;
  }, []);
  return null;
}

export function HydrationProbe() {
  const [density, setDensity] = React.useState('compact');
  const [policy, setPolicy] = React.useState('allow');
  const sidebar = React.createElement(React.Fragment, null,
    React.createElement(SidebarHeader, null, React.createElement(Text, null, 'Workspace')),
    React.createElement(SidebarSection, { label: 'Espaço', children: React.createElement(NavItem, { label: 'Perfil', icon: 'UserRound', active: true, href: '#perfil' }) }),
  );
  const secondSidebar = React.createElement(SidebarSection, { label: 'Outro espaço', children: React.createElement(NavItem, { label: 'Atividade', icon: 'Activity', href: '#atividade' }) });
  return React.createElement(
    DesignSystemProvider,
    { theme: 'light', children: React.createElement(React.Fragment, null,
      React.createElement(AppShell, {
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
          React.createElement(HydrationCompletionMarker),
        ),
      }),
      React.createElement(AppShell, {
        navigationLabel: 'Outra navegação',
        collapsed: false,
        onCollapsedChange: () => {},
        mobileOpen: false,
        onMobileOpenChange: () => {},
        sidebar: secondSidebar,
        children: React.createElement(Stack, null,
          React.createElement(Text, null, 'Second shell'),
          React.createElement(Dock, null,
            React.createElement(DockItem, { active: true, onClick: () => {}, 'aria-label': 'Active dock action', children: React.createElement('span', null, 'A') }),
            React.createElement(DockSeparator),
            React.createElement(DockItem, { disabled: true, onClick: () => {}, 'aria-label': 'Disabled dock action', children: React.createElement('span', null, 'D') }),
            React.createElement(DockItem, { active: true, children: React.createElement('a', { href: '#dock-link', 'aria-label': 'Dock link' }, 'L') }),
          ),
        ),
      }),
    ) },
  );
}
