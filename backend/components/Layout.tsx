import { HomeOutlined, TeamOutlined, SolutionOutlined, ReadOutlined, DollarOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const roleMenu = (
  <Menu>
    <Menu.Item key="roles:1">
      <Link href="/roles">View Roles</Link>
    </Menu.Item>
    <Menu.Item key="roles:2">
      <Link href="/roles/assignment">Role Assignment</Link>
    </Menu.Item>
  </Menu>
);

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
    { label: 'Home', link: '/' },
    { label: 'Roles', link: '/roles' },
    { label: 'Courses', link: '/courses' },
    { label: 'Wages', link: '/wages' },
    { label: 'Contact', link: '/contact' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  const [selectedKey, setSelectedKey] = useState('home');

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const logout = async () => {
    try {
      await axios.get('/api/users/logout');
      toast.success('Logout successful');
      router.push('/login');
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      console.log(currentPath);
      // Modify or expand this logic to suit your specific routing
      setSelectedKey(currentPath.includes('/roles') ? 'roles' : currentPath.substring(1));
    }
  }, []);

  const menuItems = [
    {
      label: (
        <Link href="/">
          <img src="https://i.imgur.com/sRUCDHJ.png" alt="Logo" style={{ maxWidth: '50px', maxHeight: '50px' }} />
        </Link>
      ),
      key: 'logo',
      disabled: true, // Disable if you don't want it to be clickable
    },
    {
      label: <Link href="/home"><HomeOutlined /> Home</Link>,
      key: 'home',
    },
    {
      label: (
        <Dropdown overlay={roleMenu} trigger={['hover']} className="role_dropdown_main">
          <a className="dropdown-hover" onClick={e => e.preventDefault()}>
            <TeamOutlined /> Roles <DownOutlined className="down-icon" />
          </a>
        </Dropdown>
      ),
      key: 'roles',
    },
    {
      label: <Link href="/wages"><DollarOutlined /> Wages</Link>,
      key: 'wages',
    },
    {
      label: (
        <Dropdown overlay={coursesMenu} trigger={['hover']} className="role_dropdown_main">
          <a className="dropdown-hover" onClick={e => e.preventDefault()}>
            <TeamOutlined /> Courses <DownOutlined className="down-icon" />
          </a>
        </Dropdown>
      ),
      key: 'courses',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '10vh' }}>
        <Menu style={{ marginTop: '2vh' }} className="guideify_navbar" mode="horizontal" items={menuItems} selectedKeys={[selectedKey]} />
        <div className="logout_button" onClick={logout} style={{display: 'flex', gap: '3px', marginRight: '10px', cursor: 'pointer'}}>
          <LogoutOutlined style={{ fontSize: '18px' }} />
          <p>Log Out</p>
        </div>
      </div>
      <div style={{ margin: "30px" }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
