"use client"

import { task } from "@/api";
import { useEffect, useState } from "react";
import useSWR from "swr"
import {
    CheckSquareTwoTone,
    MinusSquareTwoTone,
    BorderOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { timestampToTime } from "@/util/string";

const DELIVERY_COLOR_MAP = {
    draft: '#faad14',
    leader_review: '#faad14',
    leader_rejected: '#f5222d',
    teacher_review: '#faad14',
    teacher_rejected: '#f5222d',
}

const DELIVERY_STATUS_MAP = {
    draft: '草稿',
    leader_review: '组长审核中',
    leader_rejected: '组长驳回',
    teacher_review: '教师审核中',
    teacher_rejected: '教师驳回',
}

export default function TaskProgressList({ classId, taskId, groups, taskInfo }) {
    const [refreshKey, setRefreshKey] = useState(`task-delivery-${classId}-${taskId}-latest-${Date.now()}`)
    const { data: taskDelivery, isLoading } = useSWR(refreshKey, async () => {
        const data = await task.getTaskLatestDelivery(classId, taskId)
        return data
    })

    const [passedCount, setPassedCount] = useState(0)
    useEffect(() => {
        if (!taskDelivery) {
            return
        }
        const count = taskDelivery.data.filter((item) => item.delivery_status === 'teacher_approved').length
        setPassedCount(count)
    }, [taskDelivery])


    return <div className="flex items-end">
        {groups.map((group) => {
            const delivery = taskDelivery?.data?.find((item) => item.group_id === group.id)
            return <div key={group.id} className="text-xl">
                {isLoading && <div className="text-gray-400">
                    <LoadingOutlined />
                </div>}
                {!isLoading && <>
                    {!delivery && <div className="text-gray-400">
                        <Tooltip title={<div>
                            <div className="font-semibold">{group.name}</div>
                            <div>组员：{group.members.map((member) => {
                                const isLeader = member.roles.some((role) => role.is_manager)
                                return member?.user?.name + (isLeader ? '*' : '')
                            }).join(', ')}</div>
                            <div>无交付记录</div>
                        </div>}>
                            <BorderOutlined />
                        </Tooltip>
                    </div>}
                    {delivery?.delivery_status === 'teacher_approved' && <div>
                        <Tooltip title={<div>
                            <div className="font-semibold">{group.name}</div>
                            <div>组员：{group.members.map((member) => {
                                const isLeader = member.roles.some((role) => role.is_manager)
                                return member?.user?.name + (isLeader ? '*' : '')
                            }).join(', ')}</div>
                            <div>
                                最近交付：
                                {timestampToTime(delivery?.delivery_time * 1000)}
                                {delivery?.delivery_time > taskInfo?.deadline && <span className="text-red-500">（逾期）</span>}
                            </div>
                            <div>交付状态：<span className="text-green-500">已通过</span></div>
                        </div>}>
                            <CheckSquareTwoTone twoToneColor="#52c41a" />
                        </Tooltip>
                    </div>}
                    {(delivery && delivery?.delivery_status !== 'teacher_approved') && <div>
                        <Tooltip title={<div>
                            <div className="font-semibold">{group.name}</div>
                            <div>组员：{group.members.map((member) => {
                                const isLeader = member.roles.some((role) => role.is_manager)
                                return member?.user?.name + (isLeader ? '*' : '')
                            }).join(', ')}</div>
                            <div>
                                最近交付：
                                {timestampToTime(delivery?.delivery_time * 1000)}
                                {delivery?.delivery_time > taskInfo?.deadline && <span className="text-red-400">（逾期）</span>}
                            </div>
                            <div>交付状态：
                                <span style={{ color: DELIVERY_COLOR_MAP[delivery?.delivery_status] }}>
                                    {DELIVERY_STATUS_MAP[delivery?.delivery_status]}
                                </span>
                            </div>
                        </div>}>
                            <MinusSquareTwoTone twoToneColor={DELIVERY_COLOR_MAP[delivery?.delivery_status]} />
                        </Tooltip>
                    </div>}
                </>}
            </div>
        })}

        <div className="text-sm text-gray-600 ml-2">
            （{passedCount}/{groups.length}）
        </div>
    </div>
}