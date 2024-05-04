"use client"
import { ProTable } from "@ant-design/pro-components"
import { Avatar, Button, Modal, Tag, Tooltip, message } from "antd"
import { useEffect, useRef, useState } from "react"
import { group } from "@/api"
import {
    ExclamationCircleFilled,
    DeleteOutlined,
    CloseOutlined,
    UserAddOutlined,
    CheckOutlined,
    EditOutlined
} from '@ant-design/icons';
import UserAvatar, { getColor } from "@/components/avatar"
import { getUser } from "@/store/session"
import useSWR from "swr"
import UserSelectModal from "@/components/class_member_select_modal"
import EditMemberModal from "./edit_member_modal"

export default function GroupMemberList({ classId, groupId }) {
    const actionRef = useRef();
    const [messageApi, contextHolder] = message.useMessage();
    const { data: me } = useSWR('me', getUser)
    const { data: myMember } = useSWR('myMember', () => group.getMyGroupMember(classId))
    const [isLeader, setIsLeader] = useState(false)
    const { confirm } = Modal;

    useEffect(() => {
        if (!me) {
            return
        }
        let leader = myMember?.roles.find((role) => role.is_manager)
        if (leader) {
            setIsLeader(true)
        }

        if (me.user_type !== 'student') {
            setIsLeader(true)
            return;
        }
    }, [me, myMember])

    const removeMember = async (memberId) => {
        confirm({
            title: '删除成员',
            icon: <ExclamationCircleFilled />,
            content: '确定要删除该成员吗？',
            centered: true,
            onOk: async () => {
                messageApi.open({
                    key: 'delete_student',
                    type: 'loading',
                    content: '正在删除...'
                })
                try {
                    await group.deleteGroupMember(classId, groupId, memberId)
                    messageApi.open({
                        key: 'delete_student',
                        type: 'success',
                        content: '删除成功'
                    })
                    actionRef.current?.reload();
                } catch (error) {
                    messageApi.open({
                        key: 'delete_student',
                        type: 'error',
                        content: error?.message || '删除失败'
                    })
                }
            }
        });
    }

    const acceptMember = async (memberId) => {
        confirm({
            title: '同意邀请',
            icon: <ExclamationCircleFilled />,
            content: '确定要同意该成员的邀请吗？',
            centered: true,
            onOk: async () => {
                messageApi.open({
                    key: 'accept_student',
                    type: 'loading',
                    content: '正在处理...'
                })
                try {
                    await group.acceptGroupMember(classId, groupId, memberId)
                    messageApi.open({
                        key: 'accept_student',
                        type: 'success',
                        content: '处理成功'
                    })
                    actionRef.current?.reload();
                } catch (error) {
                    messageApi.open({
                        key: 'accept_student',
                        type: 'error',
                        content: error?.message || '处理失败'
                    })
                }
            }
        });
    }

    const USER_COLUMNS = [
        {
            title: '序号',
            dataIndex: 'index',
            valueType: 'index',
            width: 48,
            align: "center",
            disable: true,
        },
        {
            title: '学生',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            width: 150,
            render: (text, record) => {
                record = record?.user
                return <div className='flex items-center'>
                    <UserAvatar user={record} />
                    <div className='flex flex-col'>
                        <span className='ml-2'>{record?.name}</span>
                        <span className='ml-2 text-xs text-gray-500'>{record?.employee_id}</span>
                    </div>
                </div>
            }
        },
        {
            title: '组队状态',
            dataIndex: 'status',
            ellipsis: true,
            valueType: 'select',
            width: 120,
            align: 'center',
            disable: true,
            valueEnum: {
                approved: {
                    text: '已组队',
                    status: 'Success'
                },
                leader_review: {
                    text: '待审核',
                    status: 'Processing'
                },
                member_review: {
                    text: '待同意邀请',
                    status: 'Processing'
                },
            }
        },
        {
            title: '组内角色',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            render: (text, record) => {
                const roles = record?.roles || []
                return <div className='flex items-center'>
                    {
                        roles.map((role, index) => {
                            return <Tooltip title={role.role_description} key={index}>
                                <Tag color={role.is_manager ? 'red' : 'blue'}>{role.role_name}</Tag>
                            </Tooltip>
                        })
                    }
                </div>
            }
        },
        {
            title: 'Git账号',
            dataIndex: 'github',
            ellipsis: true,
            hideInSearch: true,
            width: 100,
            render: (text, record, _, action) => {
                const usernames = record?.repo_usernames;

                return <div className='flex items-center'>
                    <Avatar.Group maxCount={2}>
                        {
                            usernames?.map((username, index) => (
                                <Tooltip title={username} key={index}>
                                    <Avatar key={index} size={32} style={{ backgroundColor: getColor(username) }}>
                                        {username[0].toUpperCase()}
                                    </Avatar>
                                </Tooltip>
                            ))
                        }
                    </Avatar.Group>
                </div>
            }
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            align: 'center',
            width: 160,
            disable: true,
            render: (text, record, _, action) => {
                return <div className='flex justify-start'>
                    {
                        (
                            (isLeader && record?.status === 'leader_review') ||
                            (record?.status !== 'approved' && me?.user_type !== 'student')
                        ) &&
                        <Button
                            type="text"
                            size='small'
                            onClick={() => acceptMember(record.id)}
                            icon={<CheckOutlined />}
                        >
                            同意
                        </Button>
                    }

                    {
                        ((isLeader || me.user_type !== 'student') && record?.status === 'approved') &&
                        <EditMemberModal
                            classId={classId}
                            groupId={groupId}
                            groupMember={record}
                            onEdit={() => actionRef.current?.reload()}
                        >
                            <Button
                                type="text"
                                size='small'
                                icon={<EditOutlined />}
                            >
                                编辑
                            </Button>
                        </EditMemberModal>
                    }

                    <Button
                        type="text"
                        danger
                        size='small'
                        onClick={() => removeMember(record.id)}
                        icon={record?.status === 'approved' ? <DeleteOutlined /> : <CloseOutlined />}
                        disabled={!isLeader}
                    >
                        {record?.status === 'approved' && '删除'}
                        {record?.status === 'leader_review' && '拒绝'}
                        {record?.status === 'member_review' && '取消'}
                    </Button>
                </div>
            },
        },
    ];


    return <>
        {contextHolder}

        <ProTable
            actionRef={actionRef}
            className="mt-5"
            columns={USER_COLUMNS}
            cardBordered
            request={async (params, sort, filter) => {
                const g = await group.getClassGroup(classId, groupId);
                let members = g?.members;
                if (params.status) {
                    members = members.filter((item) => item.status === params.status)
                }

                return {
                    total: members?.length,
                    data: members,
                    success: true
                };
            }}
            editable={false}
            columnsState={{
                persistenceKey: 'scs:class:group-member-list-table',
                persistenceType: 'localStorage',
                defaultValue: {
                    option: { fixed: 'right', disable: true },
                },
                onChange(value) {
                    console.log('value: ', value);
                },
            }}
            rowKey="id"
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
                <UserSelectModal
                    key={'add'}
                    classId={classId}
                    groupId={groupId}
                    title="邀请组员"
                    onSelect={async (memberId) => {
                        messageApi.open({
                            key: 'add_student',
                            type: 'loading',
                            content: '正在邀请...'
                        })
                        try {
                            await group.addGroupMember(classId, groupId, memberId)
                            messageApi.open({
                                key: 'add_student',
                                type: 'success',
                                content: '邀请成功'
                            })
                            actionRef.current?.reload();
                        } catch (error) {
                            messageApi.open({
                                key: 'add_student',
                                type: 'error',
                                content: error?.message || '邀请失败'
                            })
                        }
                    }}
                >
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                    >
                        邀请组员
                    </Button>
                </UserSelectModal>
            ]}
        />
    </>
}