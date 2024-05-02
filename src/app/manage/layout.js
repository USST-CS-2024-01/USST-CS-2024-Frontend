"use client"

import { Avatar, Dropdown, Layout, Menu } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSiteConfig } from "@/store/site_config";
import { user } from "@/api/index";
import { IdcardOutlined, LogoutOutlined } from "@ant-design/icons";
import { useRouter } from 'next-nprogress-bar';
import { getAvatar } from "@/store/avatar";
import { getSelectedKeys, getOpenKeys, getMenuItems, getRedirectPath, hasAccess, MANAGE_MENU } from "@/util/menu";
import { logout } from "@/store/session";

const { Header, Footer, Sider, Content } = Layout;
const window = globalThis;

const RootLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [siteConfig, setSiteConfig] = useState({});
    const [me, setMe] = useState({ name: 'username' });
    const router = useRouter();
    const [route, setRoute] = useState(globalThis?.__incrementalCache?.requestHeaders?.['x-invoke-path']);
    const [avatar, setAvatar] = useState();

    const [selectedKeys, setSelectedKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);
    const [menuItem, setMenuItem] = useState([]);

    useEffect(() => {
        setRoute(window.location.pathname);

        (async () => {
            setSiteConfig(
                await getSiteConfig()
            )

            const me = await user.getMeUser();
            const route = window.location.pathname;
            setMe(me);
            if (!hasAccess(me, route, MANAGE_MENU)) {
                router.push('/404');
            }

        })()

    }, [router]);

    useEffect(() => {
        if (me?.id === undefined) {
            return;
        }
        (async () => {
            let avatar = await getAvatar(me.id);
            setAvatar(avatar);
        })()
        setMenuItem(getMenuItems(me, MANAGE_MENU));
        setSelectedKeys(getSelectedKeys(route, MANAGE_MENU));
        openKeys.push(...getOpenKeys(route, MANAGE_MENU));
        setOpenKeys(openKeys);
    }, [me, route, openKeys]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (route != window.location.pathname) {
                setRoute(window.location.pathname);
                clearInterval(interval);
            }
        }, 1000);
    }, [route])

    const userDropdown = [
        {
            label: '个人信息',
            key: 'profile',
            icon: <IdcardOutlined />,
            onClick: () => {
                // window.location.href = '/manage/user/profile'
                router.push('/manage/user/profile');
            }
        },
        {
            type: 'divider',
        },
        {
            label: '退出登录',
            key: 'logout',
            icon: <LogoutOutlined />,
            onClick: () => {
                logout();
            },
            danger: true,
        }
    ];

    return (
        <Layout style={{
            minHeight: '100vh',
            backgroundColor: 'transparent',
        }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{
                borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
            }} theme='light'>
                <div className={"h-16 flex items-center justify-center flex-row flex-wrap px-5 pt-5"}>
                    <div>
                        <Image src="/icon.png" alt="Logo" width={50} height={50} />
                    </div>
                    <div className={collapsed ? "opacity-0" : "opacity-100"}>
                        <h2 className={"text-lg mt-2"}>{siteConfig['course:title']}</h2>
                    </div>
                </div>

                <Menu
                    mode="inline"
                    items={menuItem}
                    selectedKeys={selectedKeys}
                    defaultOpenKeys={openKeys}
                    onSelect={({ key }) => {
                        setSelectedKeys([key]);
                    }}
                    style={{
                        marginTop: collapsed ? '30px' : '80px',
                    }}
                    onClick={({ key }) => {
                        router.push(getRedirectPath(me, MANAGE_MENU, key));
                        // window.location.href = getRedirectPath(me, MANAGE_MENU, key);
                    }}
                />
            </Sider>
            <Layout style={{
                backgroundColor: 'transparent',
            }}>
                <Header style={{
                    boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
                    backgroundColor: 'white',
                    justifyContent: 'flex-end',
                }} className="flex items-center">
                    <Menu style={{
                        border: "none",
                    }} selectedKeys={[]} items={[
                        {
                            key: 'user',
                            label: (<Dropdown menu={{ items: userDropdown }}>
                                <div className="flex items-center gap-2 h-full">
                                    <Avatar src={avatar}>{me.name[0].toUpperCase()}</Avatar>
                                    <span className="text-base">{me.name}</span>
                                </div>
                            </Dropdown>)
                        }
                    ]}>

                    </Menu>
                </Header>
                <Content className="overflow-auto h-[calc(100vh-64px)]">
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default RootLayout;
