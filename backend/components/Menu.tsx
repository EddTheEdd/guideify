// components/Menu.tsx

import Link from 'next/link';

interface MenuItem {
  label: string;
  link: string;
}

interface MenuProps {
  items: MenuItem[];
  showSpecialLink?: boolean; // Add the showSpecialLink prop
}

const Menu: React.FC<MenuProps> = ({ items, showSpecialLink = false }) => {
  return (
    <nav>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Link href={item.link}>
              {item.label}
            </Link>
          </li>
        ))}
        {showSpecialLink && (
          <li>
            <Link href="/special-link">
              Special Link
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Menu;
