"use client";
import { clazz, task as taskApi } from "@/api";
import UserAvatar from "@/components/avatar";
import { Alert, Button, Input, Tag, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";


export default function TaskGroupMemberScore({ classId, groupId, task, me }) {
    const [isManager, setIsManager] = useState(false)
    const { data: classMembersData, error, isLoading } = useSWR('task-delivery-class-members', async () => {
        const data = await clazz.getClassMember(classId)
        const members = data?.data?.filter((item) => Number(item.group_id) === Number(groupId))
            .filter((item) => !item.is_teacher);
        return members
    })
    const [classMembers, setClassMembers] = useState([])
    const [refreshKey, setRefreshKey] = useState(Date.now())
    const { data: scoreData } = useSWR(refreshKey, async () => {
        const data = await taskApi.getTaskMemberScore(classId, groupId, task.id)
        return data
    })
    const [messageApi, contextHolder] = message.useMessage();
    const [refreshKey2, setRefreshKey2] = useState(Date.now() + Math.random() * 1000)
    const { data: finishedMembers } = useSWR(refreshKey2, async () => {
        const data = await taskApi.getCompletedMemberList(classId, groupId, task.id)
        return data?.data
    })

    useEffect(() => {
        const newMembers = classMembersData?.map((item) => {
            return {
                ...item,
                score: classMembers?.find((member) => member.id === item.id)?.score || 0
            }
        });
        setClassMembers(newMembers)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classMembersData])

    useEffect(() => {
        if (me?.user?.user_type && me?.user?.user_type !== 'student') {
            setIsManager(true)
        } else {
            const isManager = me?.roles?.some((role) => role.is_manager)
            setIsManager(isManager)
        }
    }, [me])

    useEffect(() => {
        if (!classMembers) return;
        if (scoreData) {
            const data = scoreData.data
            if (isManager) {
                const scoreMap = data?.group_member_scores;
                const newMembers = classMembers.map((item) => {
                    item.score = scoreMap[item?.user_id] || 0
                    return item
                })
                setClassMembers(newMembers)
            } else {
                const managerScore = data?.group_manager_score[me?.user?.id]
                const manager = classMembers.find((member) => member.roles.some((role) => role.is_manager))
                manager.score = managerScore || 0

                const newMembers = classMembers.map((item) => {
                    if (item.id === manager.id) {
                        return manager
                    }
                    return item
                })
                setClassMembers(newMembers)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isManager, scoreData])

    useEffect(() => {
        if (finishedMembers) {
            setClassMembers((members) => {
                return members.map((item) => {
                    const finished = finishedMembers.find((member) => member === item.user_id)
                    if (finished) {
                        item.finished = true
                    }
                    return item
                })
            })
        }
    }, [finishedMembers])

    return <>
        {contextHolder}
        {isManager ? <Alert
            message="组内评分"
            description="作为组长，您需要根据每个组员在该阶段的表现，为其打分；每位组员的满分为100分，您可以根据实际情况打分。该成绩不会影响小组的最终成绩，仅作为参考。在任务交付前，所有的组员都需要完成相应的组内评分。"
            showIcon
        /> : <Alert
            message="组内评分"
            description="作为组员，您需要根据组长在该阶段的表现，为其打分；组长的满分为100分，您可以根据实际情况打分。该成绩不会影响小组的最终成绩，仅作为参考。在任务交付前，所有的组员都需要完成相应的组内评分。"
            showIcon
        />}

        <div className="mt-5">
            <div className="flex flex-col gap-2">
                {classMembers?.map((member) => {
                    return <div key={member.id} className="flex justify-between">
                        <div className="flex flex-row">
                            <div className="flex items-center gap-3 w-48">
                                <UserAvatar user={member?.user} size={32} />
                                <div className="flex flex-col">
                                    <span>
                                        {member.finished ? <Tag color="green">已打分</Tag> : <Tag color="red">未打分</Tag>}
                                        {member?.user?.name}
                                    </span>
                                    <span>{member?.user?.employee_id}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-0.5 ml-5">
                                {member?.roles?.map((role) => {
                                    return <span key={role.id}>
                                        <Tooltip title={role?.role_description}>
                                            <Tag color={role?.is_manager ? 'red' : 'blue'}>{role?.role_name}</Tag>
                                        </Tooltip>
                                    </span>
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {
                                (
                                    (isManager && !member.roles.some((role) => role.is_manager)) ||
                                    (!isManager && member.roles.some((role) => role.is_manager))
                                ) &&
                                <>
                                    <span>评分：</span>
                                    <Input
                                        type="number"
                                        max={100}
                                        min={0}
                                        value={member.score}
                                        suffix='/100'
                                        style={{ width: 100 }}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            const score = Number(value)
                                            if (score >= 0 && score <= 100) {
                                                const newMembers = classMembers.map((item) => {
                                                    if (item.id === member.id) {
                                                        return {
                                                            ...item,
                                                            score: score
                                                        }
                                                    }
                                                    return item
                                                })
                                                setClassMembers(newMembers)
                                            }
                                        }}
                                    />
                                </>
                            }
                        </div>

                    </div>
                })}

                <div className="flex justify-end mt-5">
                    <Button
                        type="primary"
                        onClick={async () => {
                            let scoreDict = classMembers.reduce((acc, cur) => {
                                acc[cur?.user?.id] = cur.score
                                return acc
                            }, {})

                            if (isManager) {
                                delete scoreDict[me?.user?.id]
                            } else {
                                const manager = classMembers.find((member) => member.roles.some((role) => role.is_manager))
                                scoreDict = {
                                    [manager?.user?.id]: manager.score
                                }
                            }

                            try {
                                await taskApi.setTaskMemberScore(classId, groupId, task.id, {
                                    score_map: scoreDict
                                })
                                messageApi.success('保存成功')
                                setRefreshKey(Date.now())
                                setRefreshKey2(Date.now() + Math.random() * 1000)
                            } catch (error) {
                                messageApi.error(error.message || '保存失败')
                            }
                        }}
                    >保存</Button>
                </div>
            </div>
        </div>
    </>
}