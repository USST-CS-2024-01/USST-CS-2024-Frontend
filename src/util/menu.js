"use client";
import {
    DashboardOutlined,
    SettingOutlined,
    UserOutlined,
    ProfileOutlined,
    AuditOutlined,
    UsergroupAddOutlined,
    IdcardOutlined,
    ReadOutlined,
    FileTextOutlined,
    SnippetsOutlined,
    CarryOutOutlined,
    ProjectOutlined,
    TeamOutlined,
    TrophyOutlined,
    FolderOpenOutlined,
    FormOutlined
} from '@ant-design/icons';

export const CLASS_MENU = [
    {
        key: 'home',
        label: '看板',
        icon: <CarryOutOutlined />,
        href: '/class/{id}'
    },
    {
        key: 'todo',
        label: '待办事项',
        icon: <ProjectOutlined />,
        href: '/class/{id}/todo'
    },
    {
        key: 'task',
        label: '任务',
        icon: <FormOutlined />,
        href: '/class/{id}/task'
    },
    {
        key: 'file',
        label: '团队空间',
        icon: <FolderOpenOutlined />,
        href: '/class/{id}/file'
    },
    {
        key: 'team',
        label: '我的团队',
        icon: <TeamOutlined />,
        href: '/class/{id}/team'
    },
    {
        key: 'score',
        label: '成绩',
        icon: <TrophyOutlined />,
        href: '/class/{id}/score'
    }
];

export const MANAGE_MENU = [
    {
        key: 'dashboard',
        label: '仪表盘',
        icon: <DashboardOutlined />,
        href: '/manage'
    },
    {
        key: 'class',
        label: '班级',
        icon: <ReadOutlined />,
        children: [
            {
                key: 'my_class',
                label: '我的班级',
                icon: <ReadOutlined />,
                href: '/manage/class/my_class'
            },
            {
                key: 'class_template',
                label: '班级模板',
                icon: <SnippetsOutlined />,
                href: '/class/1/',
                roles: ['admin'],
            },
            {
                key: 'class_management',
                label: '班级管理',
                icon: <SettingOutlined />,
                href: '/manage/class/list',
                roles: ['admin'],
                children: [
                    {
                        key: 'class_edit',
                        label: '班级编辑',
                        href: '/manage/class/edit/*',
                        roles: ['admin'],
                        hidden: true
                    },
                    {
                        key: 'class_delete',
                        label: '班级删除',
                        href: '/manage/class/delete/*',
                        roles: ['admin'],
                        hidden: true
                    }
                ]
            }
        ]
    },
    {
        key: 'file',
        label: '我的文件',
        icon: <FileTextOutlined />,
        href: '/manage/file/my',
    },
    {
        key: 'user',
        label: '用户',
        icon: <UserOutlined />,
        children: [{
            key: 'user_profile',
            label: '个人信息',
            icon: <IdcardOutlined />,
            href: '/manage/user/profile'
        },
        {
            key: 'user_management',
            label: '用户管理',
            icon: <UsergroupAddOutlined />,
            href: '/manage/user/list',
            roles: ['admin'],
            children: [{
                key: 'user_edit',
                label: '用户编辑',
                href: '/manage/user/edit/*',
                roles: ['admin'],
                hidden: true
            }]
        }]
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
    menu = menu || MANAGE_MENU;


    const menuItems = [];

    for (const item of menu) {
        if (item.hidden) {
            continue;
        }

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
            if (!subItem?.children?.length) {
                subItem.children = undefined;
            }
        }
        menuItems.push(subItem);
    }

    return menuItems;
}



function match(pattern, text, id) {
    if (!pattern || !text) {
        return false;
    }
    if (id > 0) {
        pattern = pattern.replaceAll('{id}', id);
    }
    // console.log('pattern', pattern, 'text', text);
    if (pattern?.indexOf('*') > -1) {
        pattern = pattern.replace('*', '');
        // console.log(text?.startsWith(pattern));
        return text?.startsWith(pattern);
    }
    return pattern === text;
}


export function getSelectedKeys(route, menu, id) {
    for (const item of menu) {
        if (item.children) {
            const keys = getSelectedKeys(route, item.children, id);
            if (keys.length > 0) {
                return keys;
            }
        }
        if (match(item.href, route, id)) {
            return [item.key];
        }
    }
    return []
}

export function getRedirectPath(me, menu, key, id) {
    for (const item of menu) {
        if (key === item.key) {
            if (id) {
                return item.href.replaceAll('{id}', id);
            }
            return item.href;
        }
        if (item.children) {
            const path = getRedirectPath(me, item.children, key, id);
            if (path) {
                if (id) {
                    return path.replaceAll('{id}', id);
                }
                return path;
            }
        }
    }
}


export function getOpenKeys(route, menu, id) {
    for (const item of menu) {
        if (item.children) {
            const keys = getOpenKeys(route, item.children, id);
            if (keys.length > 0) {
                return [item.key];
            }
        }
        if (match(item.href, route, id)) {
            return [item.key];
        }
    }
    return []
}

export function hasAccess(me, href, menu, id) {
    for (const item of menu) {
        if (match(item.href, href, id)) {
            if (item.roles && !item.roles.includes(me.user_type)) {
                return false;
            }
            return true;
        }
        if (item.children) {
            if (hasAccess(me, href, item.children, id)) {
                return true;
            }
        }
    }
    return true;
}

export function getBreadcrumb(route, menu, id) {
    for (const item of menu) {
        if (item.children) {
            const crumbs = getBreadcrumb(route, item.children, id);
            if (crumbs.length > 0) {
                crumbs.unshift(item);
                return crumbs;
            }
        }
        if (match(item.href, route, id)) {
            return [item];
        }
    }
    return []
}

export function getBreadcrumbItems(route, menu, router, id) {
    const l = getBreadcrumb(route, menu, id);
    return l.map((item, index) => {
        return {
            key: item.key,
            title: item.label,
            href: index < l.length - 1 ? '#' : undefined,
            onClick: () => {
                const href = index < l.length - 1 ? item.href : undefined;
                if (href) {
                    router.push(href);
                }
            }
        }
    });
}