"use client";
import { DashboardOutlined, SettingOutlined, UserOutlined, ProfileOutlined, AuditOutlined } from '@ant-design/icons';

export const MANAGE_MENU = [
    {
        key: 'dashboard',
        label: '仪表盘',
        icon: <DashboardOutlined />,
        href: '/manage'
    },
    {
        key: 'user_profile',
        label: '个人信息',
        icon: <UserOutlined />,
        href: '/manage/user/profile'
    },
    {
        key: 'system_config',
        label: '系统配置',
        icon: <SettingOutlined />,
        roles: ['admin'],
        children: [
            {
                key: 'system_config:site_config',
                label: '参数配置',
                href: '/manage/system/site_config',
                icon: <ProfileOutlined />,
                roles: ['admin'],
            },
            {
                key: 'system_config:logs',
                label: '日志管理',
                href: '/manage/system/logs',
                icon: <AuditOutlined />,
                roles: ['admin'],
            },
        ]
    },
];

export function getMenuItems(me, menu) {
    const role = me.user_type;
    menu = menu || manage_menu;


    const menuItems = [];

    for (const item of menu) {
        if (item.roles && !item.roles.includes(role)) {
            continue;
        }

        let subItem = {
            key: item.key,
            label: item.label,
            icon: item.icon,
            href: item.href,
        }
        if (item.children) {
            subItem.children = getMenuItems(me, item.children);
        }
        menuItems.push(subItem);
    }

    return menuItems;
}


export function getSelectedKeys(route, menu) {
    for (const item of menu) {
        if (item.children) {
            const keys = getSelectedKeys(route, item.children);
            if (keys.length > 0) {
                return keys;
            }
        }
        if (item.href === route) {
            return [item.key];
        }
    }
    return []
}

export function getRedirectPath(me, menu, key) {
    for (const item of menu) {
        if (item.key === key) {
            return item.href;
        }
        if (item.children) {
            const path = getRedirectPath(me, item.children, key);
            if (path) {
                return path;
            }
        }
    }
}

export function getOpenKeys(route, menu) {
    for (const item of menu) {
        if (item.children) {
            const keys = getOpenKeys(route, item.children);
            if (keys.length > 0) {
                return [item.key];
            }
        }
        if (item.href === route) {
            return [item.key];
        }
    }
    return []
}

export function hasAccess(me, href, menu) {
    for (const item of menu) {
        if (item.href === href) {
            if (item.roles && !item.roles.includes(me.user_type)) {
                return false;
            }
            return true;
        }
        if (item.children) {
            if (hasAccess(me, href, item.children)) {
                return true;
            }
        }
    }
}

export function getBreadcrumb(route, menu) {
    for (const item of menu) {
        if (item.children) {
            const crumbs = getBreadcrumb(route, item.children);
            if (crumbs.length > 0) {
                crumbs.unshift(item);
                return crumbs;
            }
        }
        if (item.href === route) {
            return [item];
        }
    }
    return []
}

export function getBreadcrumbItems(route, menu, router) {
    const l = getBreadcrumb(route, menu);
    return l.map((item, index) => {
        return {
            key: item.key,
            title: item.label,
            href: item.href,
            onClick: () => {
                if (item.href) {
                    router.push(item.href);
                }
            }
        }
    });
}