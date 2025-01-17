"use client";

import { clazz, task } from "@/api";
import UserAvatar from "@/components/avatar";
import { useDebounceFn } from "@ant-design/pro-components";
import { Input, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";


export default function ScorePanel({ classId, groupId, taskId, disabled }) {
    const [refreshKey, setRefreshKey] = useState(`task-delivery-${classId}-${taskId}-${groupId}-score-${Date.now()}`)
    const { data: scoreList, isLoading } = useSWR(refreshKey, async () => {
        try {
            const data = await task.getScoreDetailOfTaskForGroupMember(
                classId, groupId, taskId
            );
            return data?.data;
        } catch (error) {
            return []
        }
    });
    const { data: groupMembers } = useSWR(`task-delivery-group-members-${classId}-${groupId}`, async () => {
        const data = await clazz.getClassMember(classId);
        const members = data?.data?.filter((item) => Number(item.group_id) === Number(groupId))
            .filter((item) => !item.is_teacher);
        return members;
    });

    const { data: inGroupScore } = useSWR(`task-delivery-group-score-${classId}-${groupId}-${taskId}`, async () => {
        const result = await task.getTaskMemberScore(classId, groupId, taskId)
        const group_manager_score = result?.data?.group_manager_score || {}
        const group_member_scores = result?.data?.group_member_scores || {}

        const averageManagerScore = Object.values(group_manager_score).reduce((acc, score) => acc + score, 0) / Object.keys(group_manager_score).length
        console.log("averageManagerScore", averageManagerScore)
        const scoreList = {
            member: {
                ...group_member_scores,
            },
            manager: {
                score: averageManagerScore,
                detail: group_manager_score
            }
        }
        return scoreList
    })

    const [tmpMemberScore, setTmpMemberScore] = useState({})

    const updateScore = useDebounceFn(async (score, user_id) => {
        await task.scoreTaskForGroupMember(
            classId, groupId, taskId, user_id, score
        );
        console.log("Score Updated", user_id, score)
    }, { wait: 3000 })

    useEffect(() => {
        setRefreshKey(`task-delivery-${classId}-${taskId}-${groupId}-score-${Date.now()}`)
    }, [classId, taskId, groupId])

    useEffect(() => {
        if (!scoreList) return;
        const tmp = {}
        scoreList.forEach((item) => {
            tmp[item.user_id] = item.score
        })
        setTmpMemberScore(tmp)
    }, [scoreList])

    return <div className="flex flex-col gap-4">
        {groupMembers?.map((member) => {
            const isManager = member?.roles?.find((role) => role?.is_manager)
            let managerScoreDetail = "";
            for (const [key, value] of Object.entries(inGroupScore?.manager?.detail || {})) {
                const user = groupMembers.find((member) => member?.user?.id == key)
                managerScoreDetail += `${user?.user?.name}: ${value}`
                if (key !== Object.keys(inGroupScore?.manager?.detail || {}).pop()) {
                    managerScoreDetail += ", "
                }
            }
            return <div key={member.id} className="flex justify-between items-center">
                <div className="flex-1 flex-row">
                    <div className="flex items-center gap-3 w-48">
                        <UserAvatar user={member?.user} size={32} />
                        <Tooltip title={member?.roles?.map((role) => role?.role_name).join(', ')}>
                            <div className="flex flex-col">
                                <span>
                                    {member?.user?.name} (互评：
                                    {isManager ? <Tooltip 
                                        title={managerScoreDetail}
                                        placement="right">
                                        <span>{inGroupScore?.manager?.score || 0}</span>
                                    </Tooltip> : <span>
                                        {inGroupScore?.member[member?.user?.id] || 0}
                                    </span>
                                    })
                                </span>
                                <span>{member?.user?.employee_id}</span>
                            </div>
                        </Tooltip>
                    </div>

                </div>

                <div className="flex-1 items-center gap-2 flex">
                    <Input
                        type="number"
                        max={100}
                        min={0}
                        value={tmpMemberScore[member?.user?.id] || 0}
                        suffix='/100'
                        style={{ width: 100 }}
                        onChange={(e) => {
                            const value = e.target.value
                            const score = Number(value)
                            if (score >= 0 && score <= 100) {
                                setTmpMemberScore({
                                    ...tmpMemberScore,
                                    [member?.user?.id]: score
                                })
                                updateScore.run(score, member?.user?.id)
                            }
                        }}
                        disabled={disabled}
                    />
                </div>

            </div>
        })}

    </div>
}