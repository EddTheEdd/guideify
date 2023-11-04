// components/Layout.tsx

import React from 'react';
import Menu from './Menu';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
    { label: 'Home', link: '/' },
    { label: 'Roles', link: '/roles' },
    { label: 'Courses', link: '/courses' },
    { label: 'Portfolio', link: '/portfolio' },
    { label: 'Contact', link: '/contact' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Menu items={menuItems} />
      {children}
    </div>
  );
};

export default Layout;
