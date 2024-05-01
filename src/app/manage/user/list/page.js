"use client"
import { Breadcrumb, Button, Popconfirm, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { user } from '@/api/index';
import { PlusOutlined } from '@ant-design/icons';

export default function UserList() {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()

    const USER_COLUMNS = [
        {
            title: '搜索用户',
            dataIndex: 'kw',
            hideInTable: true,
            search: {
                transform: (value) => {
                    return {
                        kw: value,
                    };
                },
            },
        },
        {
            title: '用户ID',
            dataIndex: 'id',
            ellipsis: true,
            disable: true,
            sorter: true,
            hideInSearch: true,
        },
        {
            title: '用户名',
            dataIndex: 'username',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '邮箱地址',
            dataIndex: 'email',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '姓名',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '学工号',
            dataIndex: 'employee_id',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '用户类型',
            dataIndex: 'user_type',
            valueType: 'select',
            valueEnum: {
                student: {
                    text: '学生',
                },
                teacher: {
                    text: '教师',
                },
                admin: {
                    text: '管理员',
                },
            },
            hideInTable: true
        },
        {
            title: '用户类型',
            dataIndex: 'user_type',
            hideInSearch: true,
            render(text, record, _, action) {
                switch (record?.user_type) {
                    case 'teacher':
                        return <Tag color='cyan'>教师</Tag>
                    case 'student':
                        return <Tag color='blue'>学生</Tag>
                    case 'admin':
                        return <Tag color='geekblue'>管理员</Tag>
                    default:
                        return <Tag>未知</Tag>
                }
            },
            sorter: true,
        },
        {
            title: '账号状态',
            dataIndex: 'account_status',
            valueType: 'select',
            valueEnum: {
                active: {
                    text: '正常',
                    status: 'Success'
                },
                inactive: {
                    text: '未激活',
                    status: 'Default'
                },
                locked: {
                    text: '锁定',
                    status: 'Error'
                },
            },
            sorter: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => {
                return [
                    <a
                        key="editable"
                        onClick={() => {
                            router.push(`/manage/user/edit/${record.id}`);
                        }}
                    >
                        编辑
                    </a>,
                    <Popconfirm
                        key="actionGroup"
                        title="删除用户"
                        description="用户的所有信息将被删除，且无法恢复，确定删除吗？"
                        onConfirm={async () => {
                            await user.deleteUser(record.id);
                            action.reload();
                        }}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger size='small'>删除</Button>
                    </Popconfirm>,
                ]
            },
        },
    ];

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb} />
            <h1 className={"text-2xl font-bold mt-2"}>用户管理</h1>

            <ProTable
                className="mt-5"
                columns={USER_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    return await user.getUserList(params, sort, filter);
                }}
                editable={false}
                columnsState={{
                    persistenceKey: 'scs:manage:user-list-table',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: { fixed: 'right', disable: true },
                    },
                    onChange(value) {
                        console.log('value: ', value);
                    },
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                pagination={{
                    pageSize: 20,
                }}
                dateFormatter="string"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            router.push('/manage/user/edit/new');
                            // globalThis.location.href = '/manage/user/edit/new';
                        }}
                        type="primary"
                    >
                        新建
                    </Button>,
                ]}
            />
        </div>
    )
}
