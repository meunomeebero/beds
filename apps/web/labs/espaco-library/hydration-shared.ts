import React from 'react';
import { AppShell, DesignSystemProvider, NavItem, SidebarHeader, SidebarSection, Stack, Text } from 'beds';

export function HydrationProbe() {
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
      children: React.createElement(Stack, null, React.createElement(Text, null, 'Hydration probe')),
    }) },
  );
}
