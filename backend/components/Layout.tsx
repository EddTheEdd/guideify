import {
  HomeOutlined,
  TeamOutlined,
  SolutionOutlined,
  ReadOutlined,
  DollarOutlined,
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu, Dropdown, Breadcrumb } from "antd";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalContext } from "@/contexts/GlobalContext";

const Layout: React.FC<any> = ({ children }) => {
  const router = useRouter();
  const currentPath = usePathname();

  const [selectedKey, setSelectedKey] = useState("home");

  const { userPermissions, finishedFetchingPermissions, activeUserId } =
    useGlobalContext();

  const roleMenu = (
    <Menu>
      {[
        ...(userPermissions.includes("View Roles")
          ? [
              <Menu.Item key="roles:1">
                <Link href="/roles">View Roles</Link>
              </Menu.Item>,
            ]
          : []),
        ...(userPermissions.includes("Assign Roles")
          ? [
              <Menu.Item key="roles:2">
                <Link href="/roles/assignment">Role Assignment</Link>
              </Menu.Item>,
            ]
          : []),
      ]}
    </Menu>
  );

  const coursesMenu = (
    <Menu>
      {[
        <Menu.Item key="courses:1">
          <Link href="/courses">View Courses</Link>
        </Menu.Item>,
        ...(userPermissions.includes("View Course Progress")
          ? [
              <Menu.Item key="courses:2">
                <Link href="/courses/submissions">View Course Progress</Link>
              </Menu.Item>,
            ]
          : []),
      ]}
    </Menu>
  );

  const userProfileMenu = (
    <Menu>
      {[
        <Menu.Item key="profile:1">
          <Link href="/profile">Profile Details</Link>
        </Menu.Item>,
        ...(userPermissions.includes("Admin Panel")
          ? [
              <Menu.Item key="profile:2">
                <Link href="/admin">Admin Page</Link>
              </Menu.Item>,
            ]
          : []),
      ]}
    </Menu>
  );

  const wagesMenu = (
    <Menu>
      {[
        ...(userPermissions.includes("View Salaries")
          ? [
              <Menu.Item key="wages:1">
                <Link href="/wages">Employee Salaries</Link>
              </Menu.Item>,
            ]
          : []),
        <Menu.Item key="wages:2">
          <Link href={`/wages/${activeUserId}`}>My Salary</Link>
        </Menu.Item>,
      ]}
    </Menu>
  );

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathKey = currentPath.split("/")[1];
      console.log(pathKey);
      setSelectedKey(pathKey);
    }
  }, [currentPath]);

  const menuItems = [
    {
      label: (
        <Link className="svg-container" href="/home">
          {/* ... */}
        </Link>
      ),
      key: "logo",
      disabled: true,
    },
    {
      label: (
        <Link href="/home">
          <HomeOutlined /> Home
        </Link>
      ),
      key: "home",
    },
    ...(userPermissions.includes("View Roles") || userPermissions.includes("Assign Roles") ? [{
      label: (
        <Dropdown overlay={roleMenu} trigger={["hover"]} className="role_dropdown_main">
          <a className="dropdown-hover" onClick={(e) => e.preventDefault()}>
            <TeamOutlined /> Roles <DownOutlined className="down-icon" />
          </a>
        </Dropdown>
      ),
      key: "roles",
    }] : []),
    {
      label: (
        <Dropdown overlay={wagesMenu} trigger={["hover"]} className="role_dropdown_main">
          <a className="dropdown-hover" onClick={(e) => e.preventDefault()}>
            <DollarOutlined /> Salaries <DownOutlined className="down-icon" />
          </a>
        </Dropdown>
      ),
      key: "wages",
    },
    {
      label: (
        <Dropdown overlay={coursesMenu} trigger={["hover"]} className="role_dropdown_main">
          <a className="dropdown-hover" onClick={(e) => e.preventDefault()}>
            <TeamOutlined /> Courses <DownOutlined className="down-icon" />
          </a>
        </Dropdown>
      ),
      key: "courses",
    },
  ];

  const userMenuItems = [
    {
      label: (
        <Dropdown
          overlay={userProfileMenu}
          trigger={["hover"]}
          className="role_dropdown_main"
        >
          <a className="dropdown-hover" onClick={(e) => e.preventDefault()}>
            <UserOutlined /> Profile <DownOutlined className="down-icon" />
          </a>
        </Dropdown>
      ),
      key: "profile",
    },
    {
      label: (
        <div
          onClick={logout}
          style={{ cursor: "pointer" }}
          className="logout_menu_item"
        >
          <LogoutOutlined /> Log Out
        </div>
      ),
      key: "logout",
    },
  ];

  return (
    console.log(currentPath),
    console.log(currentPath.replace(/\/\d+$/, "")),
    (
      <div style={{ height: "100vh" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            // height: "5.5rem",
          }}
        >
          {/* Main Menu */}
          <Menu
            style={{ width: "86%", paddingTop: "15px", height: "5rem" }}
            className="guideify_navbar"
            mode="horizontal"
            items={menuItems}
            selectedKeys={[selectedKey]}
          />

          {/* User Menu */}
          <Menu
            className="navbar_user_menu"
            style={{ width: "14%", paddingTop: "15px", height: "5rem" }}
            mode="horizontal"
            items={userMenuItems}
          />
        </div>
        {currentPath.includes("admin") ? (
          <div style={{ height: "89.5vh" }}>{children}</div>
        ) : currentPath.includes("courses/view") ? (
          <div style={{ height: "calc(100vh - 100px)" }}>{children}</div>
        ) : (
          <div style={{ margin: "30px", height: "80vh" }}>{children}</div>
        )}
      </div>
    )
  );
};

export default Layout;
