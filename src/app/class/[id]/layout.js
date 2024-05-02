"use client"

import { Avatar, Button, Dropdown, Layout, Menu } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import { user, clazz } from "@/api/index";
import { LeftOutlined, LogoutOutlined, HomeOutlined } from "@ant-design/icons";
import { useRouter } from 'next-nprogress-bar';
import { getAvatar } from "@/store/avatar";
import { getSelectedKeys, getOpenKeys, getMenuItems, getRedirectPath, hasAccess, CLASS_MENU } from "@/util/menu";
import { logout } from "@/store/session";
import useSWR from "swr";

const { Header, Sider, Content } = Layout;
const window = globalThis;

const RootLayout = ({ params, children }) => {
    const [collapsed, setCollapsed] = useState(true);
    const [me, setMe] = useState({ name: 'username' });
    const router = useRouter();
    const [route, setRoute] = useState(globalThis?.__incrementalCache?.requestHeaders?.['x-invoke-path']);
    const [avatar, setAvatar] = useState();

    const { id } = params;
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data: classInfo, error, isLoading } = useSWR(refreshKey, () => clazz.getClass(id))

    const [selectedKeys, setSelectedKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);
    const [menuItem, setMenuItem] = useState([]);

    useEffect(() => {
        setRoute(window.location.pathname);

        (async () => {
            const me = await user.getMeUser();
            const route = window.location.pathname;
            setMe(me);
            if (!hasAccess(me, route, CLASS_MENU)) {
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
        setMenuItem(getMenuItems(me, CLASS_MENU, id));
        setSelectedKeys(getSelectedKeys(route, CLASS_MENU, id));
        openKeys.push(...getOpenKeys(route, CLASS_MENU, id));
        setOpenKeys(openKeys);
    }, [me, route, openKeys, id]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (route != window.location.pathname) {
                setRoute(window.location.pathname);
                clearInterval(interval);
            }
        }, 1000);
    }, [route])

    useEffect(() => {
        if (error) {
            router.push('/manage/class/my_class');
        }
    }, [error, router])

    const userDropdown = [
        {
            label: '返回首页',
            key: 'back_home',
            icon: <HomeOutlined />,
            onClick: () => {
                router.push('/manage');
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
            <Header style={{
                boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
                backgroundColor: 'white',
                justifyContent: 'space-between',
                padding: '0 50px 0 5px',
            }} className="flex items-center justify-between">
                <div className="flex items-center ml-5 ">
                    <Button
                        icon={<LeftOutlined />}
                        type="text"
                        onClick={() => router.push('/manage/class/my_class')}
                    />
                    <Image src="/icon.png" alt="Logo" width={50} height={50} className="ml-8" />
                    <h2 className="text-base ml-1">{classInfo?.name || "ClassName"}</h2>
                </div>

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
            <Layout style={{
                backgroundColor: 'transparent',
            }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{
                    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
                }} theme='light'>
                    <Menu
                        mode="inline"
                        items={menuItem}
                        selectedKeys={selectedKeys}
                        openKeys={openKeys}
                        onOpenChange={(keys) => setOpenKeys(keys)}
                        onSelect={({ key }) => {
                            setSelectedKeys([key]);
                        }}
                        style={{
                            marginTop: '10px'
                        }}
                        onClick={({ key }) => {
                            router.push(getRedirectPath(me, CLASS_MENU, key, id));
                        }}
                    />
                </Sider>
                <Content>{children}</Content>
            </Layout>
        </Layout>
    )
}

export default RootLayout;
