"use client"

import { Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import { user, group } from "@/api/index";
import { useRouter } from 'next-nprogress-bar';
import { getSelectedKeys, getOpenKeys, getMenuItems, getRedirectPath, hasAccess, GROUP_MENU } from "@/util/menu";
import useSWR from "swr";

const { Sider, Content } = Layout;
const window = globalThis;

const RootLayout = ({ params, children }) => {
    const [me, setMe] = useState({ name: 'username' });
    const router = useRouter();
    const [route, setRoute] = useState(globalThis?.__incrementalCache?.requestHeaders?.['x-invoke-path']);

    const { id, groupId } = params;
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data: groupInfo, error, isLoading } = useSWR(refreshKey, () => group.getClassGroup(id, groupId))

    const [selectedKeys, setSelectedKeys] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);
    const [menuItem, setMenuItem] = useState([]);

    useEffect(() => {
        setRoute(window.location.pathname);

        (async () => {
            const me = await user.getMeUser();
            const route = window.location.pathname;
            setMe(me);
            if (!hasAccess(me, route, GROUP_MENU)) {
                router.push('/404');
            }
        })()

    }, [router]);

    useEffect(() => {
        if (me?.id === undefined) {
            return;
        }
        setMenuItem(getMenuItems(me, GROUP_MENU, {id, groupId}));
        setSelectedKeys(getSelectedKeys(route, GROUP_MENU,  {id, groupId}));
        openKeys.push(...getOpenKeys(route, GROUP_MENU,  {id, groupId}));
        setOpenKeys(openKeys);
    }, [me, route, openKeys, id, groupId]);

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

    return (
        <Layout style={{
            minHeight: '100vh',
            backgroundColor: 'transparent',
        }}>
            <Sider style={{
                borderRight: '1px solid rgba(0, 0, 0, 0.1)',
            }} theme='light'>
                <h2 className="text-left text-base font-bold pt-5 pb-1 px-7">
                    小组空间
                </h2>
                <Menu
                    mode="inline"
                    items={menuItem}
                    selectedKeys={selectedKeys}
                    defaultOpenKeys={openKeys}
                    onSelect={({ key }) => {
                        setSelectedKeys([key]);
                    }}
                    style={{
                        marginTop: '10px'
                    }}
                    onClick={({ key }) => {
                        router.push(getRedirectPath(me, GROUP_MENU, key, {id, groupId}));
                    }}
                />
            </Sider>
            <Content className="overflow-auto h-[calc(100vh-64px)]">
                {children}
            </Content>
        </Layout>
    )
}

export default RootLayout;
