"use client"
import { Breadcrumb, Button, Tooltip, Avatar, Alert, Modal, Tag, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { group } from '@/api/index';
import { message } from 'antd';
import {
    PlusOutlined,
    TeamOutlined,
    UserAddOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import useSWR from 'swr';
import UserAvatar from '@/components/avatar';

export default function GroupStudentPage({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();
    const { id } = params;
    const [refreshKey1, setRefreshKey1] = useState(Date.now());
    const [refreshKey2, setRefreshKey2] = useState(Date.now() + 1000);
    const { data: myMember } = useSWR(refreshKey2, () => group.getMyGroupMember(id))
    const { data: groupData, error, isLoading } = useSWR(refreshKey1, () => group.getClassGroupList(id))
    const [myGroup, setMyGroup] = useState(null)
    const [groups, setGroups] = useState([])
    const { confirm } = Modal;

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, id))
    }, [router, id])

    useEffect(() => {
        setMyGroup(null)
        setGroups(groupData?.data)

        if (!myMember || !groupData) return;
        if (!myMember.group_id) return;
        let group = groupData.data.find((item) => item.id === myMember.group_id)

        if (myMember?.status === 'member_review') {
            let l = groupData?.data
            // 将group移动到最前
            l = l.filter((item) => item.id !== myMember.group_id)
            l.unshift(group)
            setGroups(l)
        }

        if (myMember?.status !== 'approved') return;
        group.leader = group.members.find((item) => item.roles.find((role) => role.is_manager)).user
        group.pending = group.members.filter((item) => item.status === 'leader_review')
        setMyGroup(group)

    }, [myMember, groupData])

    const applyJoin = async (groupId) => {
        confirm({
            title: '申请加入小组',
            content: '确定要申请加入该小组吗？',
            centered: true,
            onOk: async () => {
                messageApi.open({
                    key: 'apply_join',
                    type: 'loading',
                    content: '正在申请...'
                })
                try {
                    await group.addGroupMember(id, groupId, myMember.id)
                    setRefreshKey1(Date.now());
                    setRefreshKey2(Date.now() + 1000);
                    messageApi.open({
                        key: 'apply_join',
                        type: 'success',
                        content: '申请成功'
                    })
                } catch (e) {
                    messageApi.open({
                        key: 'apply_join',
                        type: 'error',
                        content: e.message
                    })
                }
            }
        });
    }

    const approveOrReject = async (groupId, approve) => {
        confirm({
            title: approve ? '同意邀请' : '拒绝邀请',
            content: approve ? '确定要同意该邀请吗？' : '确定要拒绝该邀请吗？',
            centered: true,
            onOk: async () => {
                messageApi.open({
                    key: 'approve_or_reject',
                    type: 'loading',
                    content: '正在处理...'
                })
                try {
                    if (approve) {
                        await group.acceptGroupMember(id, groupId, myMember.id)
                    } else {
                        await group.deleteGroupMember(id, groupId, myMember.id)
                    }
                    setRefreshKey1(Date.now());
                    setRefreshKey2(Date.now() + 1000);
                    messageApi.open({
                        key: 'approve_or_reject',
                        type: 'success',
                        content: approve ? '同意成功' : '拒绝成功'
                    })
                } catch (e) {
                    messageApi.open({
                        key: 'approve_or_reject',
                        type: 'error',
                        content: e.message
                    })
                }
            }
        });
    }

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb} />
            <h1 className={"text-2xl font-bold mt-2"}>组队管理</h1>
            {contextHolder}
            <Spin spinning={isLoading}>
                <div className={"py-5 max-w-[1024px"}>
                    {!myGroup &&
                        <>
                            {myMember?.status !== 'member_review' &&
                                <Alert
                                    description="您尚未加入小组，快去创建或加入小组吧！"
                                    type="info"
                                    showIcon
                                    style={{
                                        maxWidth: '800px',
                                    }}
                                />
                            }
                            {myMember?.status === 'member_review' &&
                                <Alert
                                    description="您收到了小组邀请，请尽快处理！"
                                    type="warning"
                                    showIcon
                                    style={{
                                        maxWidth: '800px',
                                    }}
                                />
                            }
                            <div className={"flex justify-start mt-5"}>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        router.push(`/class/${id}/grouping/edit/new`)
                                    }}
                                >
                                    新建小组
                                </Button>
                            </div>
                        </>
                    }

                    {myGroup &&
                        <>
                            <h2 className={"text-lg font-bold mt-5"}>我的小组</h2>
                            <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 mt-1"}>
                                <div
                                    className={"mt-2 py-2 pb-5 bg-white rounded hover:shadow-md transition duration-300 ease-in-out cursor-pointer select-none"}
                                    onClick={() => {
                                        router.push(`/class/${id}/grouping/edit/${myGroup?.id}`)
                                    }}
                                >
                                    <div className={"flex items-center px-5"}>
                                        {myGroup?.status === 'pending' && <Tag color='orange'>组队中</Tag>}
                                        {myGroup?.status === 'normal' && <Tag color='green'>组队完成</Tag>}
                                        <h3 className={"text-lg font-bold"}>
                                            {myGroup?.name}
                                        </h3>
                                        {myGroup?.pending?.length > 0 && <span className={"text-xs text-red-500 ml-1"}>
                                            （{myGroup.pending.length}人申请加入）
                                        </span>}
                                    </div>
                                    <div className={"flex items-center gap-1 mt-2 px-5"}>
                                        <UserAvatar user={myGroup?.leader} />
                                        <div className='flex flex-col'>
                                            <span className='ml-2'>{myGroup?.leader?.name}</span>
                                            <span className='ml-2 text-xs text-gray-500'>{myGroup?.leader?.employee_id}</span>
                                        </div>
                                    </div>
                                    <div className={"flex items-center px-5 mt-2"}>
                                        <Tooltip title={"小组成员"}>
                                            <span className={"text-2xl mr-2 text-gray-500"}>
                                                <TeamOutlined />
                                            </span>
                                        </Tooltip>
                                        <Avatar.Group maxCount={5}>
                                            {myGroup?.members
                                                .filter(item => item.status === 'approved')
                                                .map((item) => {
                                                    item = item.user;
                                                    return <Tooltip title={item.name} key={item.id}>
                                                        <UserAvatar user={item} />
                                                    </Tooltip>
                                                })
                                            }
                                        </Avatar.Group>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    <h2 className={"text-lg font-bold mt-5"}>班级小组</h2>
                    <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 mt-1"}>
                        {groups?.map((group, index) => {
                            let leader = null;
                            if (group.members) {
                                leader = group.members.find((item) => item.roles.find((role) => role.is_manager))
                            }
                            if (leader) {
                                leader = leader?.user;
                            }

                            return <div
                                className={"mt-2 py-2 pb-5 bg-white rounded hover:shadow-md transition duration-300 ease-in-out cursor-pointer select-none"}
                                key={group.id}
                            >
                                <div className={"flex items-center px-5"}>
                                    {group?.status === 'pending' && <Tag color='orange'>组队中</Tag>}
                                    {group?.status === 'normal' && <Tag color='green'>组队完成</Tag>}
                                    <h3 className={"text-lg font-bold"}>
                                        {group.name}
                                    </h3>
                                </div>
                                <div className={"flex items-center gap-1 mt-2 px-5"}>
                                    <UserAvatar user={leader} />
                                    <div className='flex flex-col'>
                                        <span className='ml-2'>{leader?.name}</span>
                                        <span className='ml-2 text-xs text-gray-500'>{leader?.employee_id}</span>
                                    </div>
                                </div>
                                <div className={"flex items-center px-5 mt-2"}>
                                    <Tooltip title={"小组成员"}>
                                        <span className={"text-2xl mr-2 text-gray-500"}>
                                            <TeamOutlined />
                                        </span>
                                    </Tooltip>
                                    <Avatar.Group maxCount={5}>
                                        {group.members
                                            .filter(item => item.status === 'approved')
                                            .map((item) => {
                                                item = item.user;
                                                return <Tooltip title={item.name} key={item.id}>
                                                    <UserAvatar user={item} />
                                                </Tooltip>
                                            })
                                        }
                                    </Avatar.Group>
                                </div>
                                {
                                    (
                                        myMember?.status !== 'approved' &&
                                        !(myMember?.group_id === group.id && myMember?.status === 'member_review')
                                    ) &&
                                    <div className={"flex justify-end px-5 mt-3"}>
                                        <Button
                                            size="small"
                                            type="primary"
                                            ghost
                                            icon={<UserAddOutlined />}
                                            onClick={() => {
                                                applyJoin(group.id)
                                            }}
                                            disabled={
                                                myMember?.group_id === group.id &&
                                                myMember?.status !== 'approved'
                                            }
                                        >
                                            {myMember?.group_id === group.id ? '等待审核' : '申请加入'}
                                        </Button>
                                    </div>
                                }

                                {
                                    (myMember?.group_id === group.id && myMember?.status === 'member_review')
                                    &&
                                    <div className={"flex justify-center gap-5 px-5 mt-3"} >
                                        <Button
                                            size="small"
                                            type="primary"
                                            ghost
                                            icon={<CheckOutlined />}
                                            onClick={() => {
                                                approveOrReject(group.id, true)
                                            }}
                                        >
                                            同意邀请
                                        </Button>

                                        <Button
                                            size="small"
                                            type="primary"
                                            danger
                                            ghost
                                            icon={<CloseOutlined />}
                                            onClick={() => {
                                                approveOrReject(group.id, false)
                                            }}
                                        >
                                            拒绝邀请
                                        </Button>
                                    </div>
                                }
                            </div>
                        })}
                    </div>
                </div>
            </Spin>
        </div>
    )
}