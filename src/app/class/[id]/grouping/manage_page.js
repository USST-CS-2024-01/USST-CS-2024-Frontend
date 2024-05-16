"use client"
import { Breadcrumb, Button, Tooltip, Avatar, Popconfirm } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { ProTable, StatisticCard } from '@ant-design/pro-components';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { group, clazz } from '@/api/index';
import { message } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import useSWR from 'swr';
import { getUser } from '@/store/session';
import UserAvatar from '@/components/avatar';

const { Divider } = StatisticCard;

export default function GroupManagePage({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();
    const actionRef = useRef();
    const { data: me } = useSWR('me', getUser);
    const { id } = params;
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data: classMember } = useSWR(refreshKey, () => clazz.getClassMember(id))
    const [analyze, setAnalyze] = useState({});

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, id))
    }, [router, id])

    useEffect(() => {
        if (!classMember) {
            return;
        }
        const students = classMember.data.filter((item) => item.is_teacher === false);
        const analyze = {
            total: students.length,
            pending: students.filter((item) => item.status === null).length,
            applying: students.filter((item) => item.status === 'leader_review' || item.status === 'member_review').length,
            approved: students.filter((item) => item.status === 'approved').length,
        }
        setAnalyze(analyze);
    }, [classMember])

    const GROUP_COLUMNS = [
        {
            title: '组号',
            dataIndex: 'index',
            valueType: 'index',
            width: 48,
            align: "center",
        },
        {
            title: '小组名',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
        },
        {
            title: '组长',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            width: 180,
            render: (text, record) => {
                let leader = null;
                console.log('record:',record)
                if (record.members) {
                    leader = record.members.find((item) => item.roles.find((role) => role.is_manager))
                }
                if (leader) {
                    leader = leader?.user;
                }

                return <div className='flex items-center'>
                    <UserAvatar user={leader} />
                    <div className='flex flex-col'>
                        <span className='ml-2'>{leader?.name}（UID：{leader?.id}）</span>
                        <span className='ml-2 text-xs text-gray-500'>{leader?.employee_id}</span>
                    </div>
                </div>
            }
        },
        {
            title: '成员',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            width: 180,
            render: (text, record) => {
                return <Avatar.Group maxCount={5}>
                    {record.members
                        .filter(item => item.status === 'approved')
                        .map((item) => {
                            item = item.user;
                            return <Tooltip title={item.name} key={item.id}>
                                <UserAvatar user={item} />
                            </Tooltip>
                        })}
                </Avatar.Group>
            }
        },
        {
            title: '组队状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                pending: { text: '待审核', status: 'Processing' },
                normal: { text: '组队完成', status: 'Success' },
            },
            width: 120,
            align: "center",
            editable: false,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 150,
            align: "center",
            disable: true,
            render: (text, record, _, action) => {
                const action_list = [
                    <Tooltip title="编辑" key="edit">
                        <Button
                            type="text"
                            onClick={() => {
                                router.push(`/class/${id}/grouping/edit/${record.id}`)
                            }}
                            icon={<EditOutlined />}
                        />
                    </Tooltip>,
                    <Tooltip title="查看" key="view">
                        <Button
                            type="text"
                            onClick={() => {
                                router.push(`/class/${id}/group/${record.id}`)
                            }}
                            icon={<EyeOutlined />}
                        />
                    </Tooltip>,
                    <Tooltip
                        title={record.status === 'pending' ? '审核' : '撤销审核'}
                        key="approve"
                    >
                        <Popconfirm
                            title={record.status === 'pending' ? '确认审核通过？' : '确认撤销审核？'}
                            placement='left'
                            onConfirm={async () => {
                                messageApi.open({
                                    key: 'update',
                                    type: 'loading',
                                    content: '正在操作...'
                                })
                                try {
                                    if (record.status === 'normal') {
                                        await group.revokeAuditGroup(id, record.id)
                                    } else {
                                        await group.auditGroup(id, record.id)
                                    }
                                    messageApi.open({
                                        key: 'update',
                                        type: 'success',
                                        content: '操作成功'
                                    })
                                    actionRef.current.reload();
                                } catch (error) {
                                    messageApi.open({
                                        key: 'update',
                                        type: 'error',
                                        content: error?.message || '操作失败'
                                    })
                                }
                            }}
                        >
                            <Button
                                type="text"
                                icon={record.status === 'pending' ? <CheckOutlined /> : <CloseOutlined />}
                                danger={record.status === 'normal'}
                            />
                        </Popconfirm>
                    </Tooltip>,
                    <Tooltip title="解散小组" key="disband">
                        <Popconfirm
                            title="确认解散小组？"
                            placement='left'
                            onConfirm={async () => {
                                messageApi.open({
                                    key: 'delete',
                                    type: 'loading',
                                    content: '正在操作...'
                                })
                                try {
                                    await group.deleteClassGroup(id, record.id)
                                    messageApi.open({
                                        key: 'delete',
                                        type: 'success',
                                        content: '操作成功'
                                    })
                                    actionRef.current.reload();
                                } catch (error) {
                                    messageApi.open({
                                        key: 'delete',
                                        type: 'error',
                                        content: error?.message || '操作失败'
                                    })
                                }
                            }}
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                            />
                        </Popconfirm>
                    </Tooltip>,
                ]
                return <>
                    <div className="flex content-center justify-center">
                        {action_list}
                    </div>
                </>
            },
        },
    ];

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb} />
            <h1 className={"text-2xl font-bold mt-2"}>组队管理</h1>
            {contextHolder}

            <div className="mt-5">
                <StatisticCard.Group>
                    <StatisticCard
                        statistic={{
                            title: '班级总人数',
                            value: analyze.total || '-',
                        }}
                    />
                    <Divider />
                    <StatisticCard
                        statistic={{
                            title: '未组队',
                            value: analyze.pending || '-',
                            status: 'error',
                        }}
                    />
                    <StatisticCard
                        statistic={{
                            title: '组队申请中',
                            value: analyze.applying || '-',
                            status: 'processing',
                        }}
                    />
                    <StatisticCard
                        statistic={{
                            title: '完成组队',
                            value: analyze.approved || '-',
                            status: 'success',
                        }}
                    />
                </StatisticCard.Group>
            </div>

            <ProTable
                className="mt-5"
                columns={GROUP_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    const resultSet = await group.getClassGroupList(id);
                    if (params?.status) {
                        resultSet.data = resultSet.data.filter((item) => item.status === params.status)
                    }
                    return resultSet;
                }}
                editable={false}
                actionRef={actionRef}
                columnsState={{
                    persistenceKey: 'scs:class:grouping-list-table',
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
                toolBarRender={() => me?.user_type === 'student' || [
                    <Button
                        key="create"
                        type="primary"
                        onClick={() => {
                            router.push(`/class/${id}/grouping/edit/new`)
                        }}
                        icon={<PlusOutlined />}
                    >
                        创建小组
                    </Button>
                ]}
            />
        </div>
    )
}