"use client"
import { Avatar, Breadcrumb, Button, Popconfirm, Tag, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { clazz } from '@/api/index';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined
} from '@ant-design/icons';
import UserAvatar from '@/components/avatar';

export default function ClassManageList() {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()

    const USER_COLUMNS = [
        {
            title: '搜索班级',
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
            title: '班级ID',
            dataIndex: 'id',
            ellipsis: true,
            disable: true,
            sorter: true,
            hideInSearch: true,
            width: 80,
            align: 'center'
        },
        {
            title: '班级名称',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            sorter: true,
            render: (text, record) => {
                if (record.id !== 1) {
                    return text;
                }
                return <>
                    <Tooltip title="新建班级时，该班级的所有设置将被复制到新班级中。该班级不支持设置教师和学生。">
                        <Tag color='blue'>模板班级</Tag>
                    </Tooltip>
                    <span>
                        {record.name}
                    </span>
                </>
            }
        },
        {
            title: '班级状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                not_started: {
                    text: '未开始',
                    status: 'Default'
                },
                grouping: {
                    text: '分组中',
                    status: 'Processing'
                },
                teaching: {
                    text: '教学中',
                    status: 'Success'
                },
                finished: {
                    text: '已结束',
                    status: 'Error'
                },
            },
            sorter: true,
            width: 100
        },
        {
            title: '学生人数',
            dataIndex: 'stu_count',
            hideInSearch: true,
            width: 80,
            align: 'center'
        },
        {
            title: '教师团队',
            dataIndex: 'tea_list',
            hideInSearch: true,
            align: 'center',
            width: 180,
            render: (text, record, _, action) => {
                return <div className='pt-0 pb-0'>
                    <Avatar.Group
                        maxCount={2}
                    >
                        {record.tea_list.map((tea, index) => {
                            return <UserAvatar user={tea} key={index} size={32} />
                        })}
                        {record.tea_list.length === 0 && <Tag color='default'>未设置</Tag>}
                    </Avatar.Group>
                </div>
            }
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            align: 'center',
            width: 120,
            render: (text, record, _, action) => {
                return <div className='flex justify-center gap-1'>
                    <Tooltip title="查看班级">
                        <Button
                            type="text"
                            size='small'
                            onClick={() => {
                                router.push(`/class/${record.id}`);
                            }}
                            icon={<EyeOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title="编辑班级">
                        <Button
                            type="text"
                            key="editable"
                            size='small'
                            onClick={() => {
                                router.push(`/manage/class/edit/${record.id}`);
                            }}
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title="删除班级">
                        <Button
                            type="text"
                            danger
                            size='small'
                            onClick={() => {
                                router.push(`/manage/class/delete/${record.id}`);
                            }}
                            key="delete"
                            icon={<DeleteOutlined />}
                        />
                    </Tooltip>
                </div>
            },
        },
    ];

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb} />
            <h1 className={"text-2xl font-bold mt-2"}>班级管理</h1>

            <ProTable
                className="mt-5"
                columns={USER_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    return await clazz.getClassList(params, sort, filter);
                }}
                editable={false}
                columnsState={{
                    persistenceKey: 'scs:manage:clazz-manage-list-table',
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
                            router.push('/manage/class/edit/new');
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
