"use client"
import { message } from "antd"
import { useEffect, useState } from "react"
import { group } from "@/api"
import useSWR from "swr"
import { notFound } from "next/navigation"
import CardAction from "@/components/card_action"
import { getUser } from "@/store/session"
import { useRouter } from "next-nprogress-bar"

export default function ActionPanel({ classId, groupId, onUpdate }) {
    const [messageApi, contextHolder] = message.useMessage();
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data: me } = useSWR('me', getUser)
    const { data: myMember } = useSWR('myMember', () => group.getMyGroupMember(classId))
    const { data, error, isLoading } = useSWR(refreshKey, (key) => {
        if (groupId === 'new') {
            notFound();
        }
        return group.getClassGroup(classId, groupId)
    })
    const router = useRouter()
    const [isLeader, setIsLeader] = useState(false)

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

    const Audit = <CardAction
        title={data?.status === 'normal' ? '撤销审核' : '审核'}
        description={"通过审核后，该小组的成员将无法修改，只有所有的小组都审核通过，且没有未组队的学生时，才能开始教学。"}
        buttonTitle={data?.status === 'normal' ? '撤销审核' : '审核'}
        onClick={async () => {
            try {
                if (data?.status === 'normal') {
                    messageApi.open({
                        key: 'update_group',
                        type: 'loading',
                        content: '正在更新...'
                    })
                    await group.revokeAuditGroup(classId, groupId)
                    setRefreshKey(Date.now())
                    messageApi.open({
                        key: 'update_group',
                        type: 'success',
                        content: '撤销成功'
                    })
                } else {
                    messageApi.open({
                        key: 'update_group',
                        type: 'loading',
                        content: '正在更新...'
                    })
                    await group.auditGroup(classId, groupId)
                    setRefreshKey(Date.now())
                    messageApi.open({
                        key: 'update_group',
                        type: 'success',
                        content: '审核成功'
                    })
                }

                if (onUpdate) {
                    onUpdate()
                }
            } catch (e) {
                messageApi.open({
                    key: 'update_group',
                    type: 'error',
                    content: e.message || '操作失败'
                })
            }
        }}
    />
    const Disband = <CardAction
        title={"解散小组"}
        description={"解散小组后，小组内的所有成员将被移除，且无法恢复。"}
        buttonTitle={"解散"}
        onClick={async () => {
            try {
                messageApi.open({
                    key: 'delete_group',
                    type: 'loading',
                    content: '正在解散...'
                })
                await group.deleteClassGroup(classId, groupId)
                messageApi.open({
                    key: 'delete_group',
                    type: 'success',
                    content: '解散成功'
                })
                router.push(`/class/${classId}/grouping`)
            } catch (e) {
                messageApi.open({
                    key: 'delete_group',
                    type: 'error',
                    content: e.message || '解散失败'
                })
            }
        }}
        danger
    />

    const Quit = <CardAction
        title={"退出小组"}
        description={"退出小组后，您将不再是该小组的成员，且无法恢复。"}
        buttonTitle={"退出"}
        onClick={async () => {
            try {
                messageApi.open({
                    key: 'quit_group',
                    type: 'loading',
                    content: '正在退出...'
                })
                await group.deleteGroupMember(classId, groupId, myMember.id)
                messageApi.open({
                    key: 'quit_group',
                    type: 'success',
                    content: '退出成功'
                })
                router.push(`/class/${classId}/grouping`)
            } catch (e) {
                messageApi.open({
                    key: 'quit_group',
                    type: 'error',
                    content: e.message || '退出失败'
                })
            }
        }}
        danger
    />

    return <>
        {contextHolder}
        <div className={"mt-5 p-5 bg-white rounded-md max-w-[600px]"}>
            <h2 className={"text-lg font-bold"}>小组操作</h2>

            {me?.user_type !== 'student' && Audit}
            {isLeader && Disband}
            {!isLeader && Quit}
        </div>
    </>
}