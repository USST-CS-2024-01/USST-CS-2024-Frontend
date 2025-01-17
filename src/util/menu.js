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
    TagsOutlined,
    TeamOutlined,
    TrophyOutlined,
    FolderOpenOutlined,
    FormOutlined,
    HomeTwoTone,
    CarryOutTwoTone,
    BookTwoTone,
    FolderOpenTwoTone,
    PhoneTwoTone,
    NotificationOutlined,
    BuildOutlined,
    EditTwoTone
} from '@ant-design/icons';

export const CLASS_MENU = [
    {
        key: 'home',
        label: '看板',
        icon: <CarryOutOutlined />,
        href: '/class/{id}',
        roles: ['student']
    },
    {
        key: 'announcement',
        label: '班级公告',
        icon: <NotificationOutlined />,
        href: '/class/{id}/announcement',
    },
    {
        key: 'role',
        label: '班级角色',
        icon: <TagsOutlined />,
        href: '/class/{id}/role',
        roles: ['teacher', 'admin']
    },
    {
        key: 'task',
        label: '课程任务',
        icon: <FormOutlined />,
        href: '/class/{id}/task',
        roles: ['teacher', 'admin']
    },
    {
        key: 'task_delivery',
        label: '小组交付',
        icon: <BuildOutlined />,
        href: '/class/{id}/task_delivery',
        roles: ['teacher', 'admin'],
        children: [
            {
                key: 'task_grade',
                label: '批改',
                href: '/class/{id}/task_delivery/{taskId}/grade',
                hidden: true,
                roles: ['teacher', 'admin']
            },
        ]
    },
    {
        key: 'team',
        label: '组队管理',
        icon: <TeamOutlined />,
        href: '/class/{id}/grouping',
        children: [
            {
                key: 'team_edit',
                label: '小组编辑',
                href: '/class/{id}/grouping/edit/*',
                hidden: true
            },
        ]
    },
    {
        key: 'file',
        label: '班级空间',
        icon: <FolderOpenOutlined />,
        href: '/class/{id}/file'
    },
    {
        key: 'score',
        label: '成绩管理',
        icon: <TrophyOutlined />,
        href: '/class/{id}/score'
    },
    {
        key: 'setting',
        label: '班级设置',
        icon: <SettingOutlined />,
        href: '/manage/class/edit/{id}',
        roles: ['admin', 'teacher']
    }
];


export const GROUP_MENU = [
    {
        key: 'task',
        label: '任务交付',
        icon: <BookTwoTone />,
        href: '/class/{id}/group/{groupId}/task'
    },
    {
        key: 'group_task',
        label: '待办事项',
        icon: <CarryOutTwoTone />,
        href: '/class/{id}/group/{groupId}/group_task'
    },
    {
        key: 'group_meeting',
        label: '小组会议',
        icon: <PhoneTwoTone />,
        href: '/class/{id}/group/{groupId}/group_meeting'
    },
    {
        key: 'file',
        label: '小组空间',
        icon: <FolderOpenTwoTone />,
        href: '/class/{id}/group/{groupId}/file'
    },
    {
        key: 'edit',
        label: '编辑小组',
        icon: <EditTwoTone />,
        href: '/class/{id}/grouping/edit/{groupId}',
    }
];

export const MANAGE_MENU = [
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
                roles: ['admin', 'teacher'],
                children: [
                    {
                        key: 'class_edit',
                        label: '班级编辑',
                        href: '/manage/class/edit/*',
                        roles: ['admin', 'teacher'],
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


function replaceUrl(url, id) {
    // 如果 id 为数字，替换掉 pattern 中的 {id}
    if (id > 0 && (typeof id === 'number' || typeof id === 'string')) {
        url = url.replaceAll('{id}', id);
    }
    // 如果 id 为字典，替换掉 pattern 中字典中的 key
    if (id && typeof id === 'object') {
        for (const key in id) {
            url = url.replaceAll(`{${key}}`, id[key]);
        }
    }
    return url;
}


function match(pattern, text, id) {
    if (!pattern || !text) {
        return false;
    }
    pattern = replaceUrl(pattern, id);
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
                return replaceUrl(item.href, id);
            }
            return item.href;
        }
        if (item.children) {
            const path = getRedirectPath(me, item.children, key, id);
            if (path) {
                if (id) {
                    return replaceUrl(path, id);
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
                let href = index < l.length - 1 ? item.href : undefined;
                if (!href) return;
                if (id) {
                    href = replaceUrl(href, id);
                }
                router.push(href);
            }
        }
    });
}