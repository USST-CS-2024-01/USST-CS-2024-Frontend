"use client"

import { group } from "@/api"
import { timestampToTime } from "@/util/string"
import { Button, Popconfirm, Spin, Tag, Tooltip } from "antd"
import { useEffect, useState } from "react"
import {
    UserOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    DeleteOutlined
} from "@ant-design/icons"
import useSWR from "swr"

const PriorityMap = {
    1: '中',
    2: '高',
    3: '紧急'
}

export default function GroupTaskList({ classId, groupId, status, me, onlyMe, onSelect, kw, forceRefreshKey }) {
    const [refreshKey, setRefreshKey] = useState(Math.random() * 1000)
    const { data: tasks, error, isLoading } = useSWR(refreshKey, async () => {
        const data = await group.getGroupTaskList(classId, groupId, status, kw)
        const meRoles = me?.roles || []
        const tasks = data?.data?.map((item) => {
            item.isMyTask = item.assignees?.some((role) => {
                return meRoles.some((myRole) => myRole.id === role.id)
            })
            return item
        })

        if (onlyMe) {
            return tasks.filter((item) => item.isMyTask)
        }
        return tasks
    })

    useEffect(() => {
        setRefreshKey(Math.random() * 1000)
    }, [kw, onlyMe, forceRefreshKey])

    return <>
        <Spin spinning={isLoading}>
            <h3>
                <span className="font-bold">
                    {status === 'pending' && '待开始'}
                    {status === 'normal' && '进行中'}
                    {status === 'finished' && '已完成'}
                </span>
                <span className="text-gray-400">（{tasks?.length || 0}）</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 mt-4">
                {tasks?.map((task) => {
                    return <div
                        key={task.id}
                        className="bg-white p-4 rounded border hover:shadow cursor-pointer transition duration-300 ease-in-out"
                        onClick={() => onSelect(task)}
                    >
                        <div className="flex items-start flex-col">
                            <div className="mb-3 flex justify-between items-center gap-2">
                                <h4 className="truncate font-semibold">
                                    {task.isMyTask && <Tag color="purple" className="font-normal">我的任务</Tag>}
                                    {task.name}
                                    {(task?.deadline && task?.deadline < Date.now() / 1000)
                                        && <span className="text-red-500 inline-block">
                                            <Tooltip title="已过截止时间" className="ml-2">
                                                <CalendarOutlined />
                                            </Tooltip>
                                        </span>}
                                </h4>
                                <div onClick={(e) => e.stopPropagation()}>
                                    {task?.publisher === me?.user?.id && <Popconfirm
                                        title="确定要删除这个待办吗？"
                                        onConfirm={async () => {
                                            await group.deleteGroupTask(classId, groupId, task.id)
                                            setRefreshKey(Math.random() * 1000)
                                        }}
                                    >
                                        <Tooltip title="删除待办">
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Tooltip>
                                    </Popconfirm>}
                                </div>
                            </div>
                            <div>
                                {/* <div className="mb-2">
                                    {task?.status === 'pending' && <Tag color="orange">待开始</Tag>}
                                    {task?.status === 'normal' && <Tag color="orange">进行中</Tag>}
                                    {task?.status === 'finished' && <Tag color="green">已完成</Tag>}
                                </div> */}
                                {task?.priority > 0 && <div className="mb-2">
                                    <Tag color="red">优先级：{PriorityMap[task.priority]}</Tag>
                                </div>}
                                {task?.deadline && <div className="mb-2">
                                    <Tag color="blue">截止时间：{timestampToTime(task.deadline * 1000)}</Tag>
                                </div>}
                            </div>
                            <div className="mt-2 text-gray-500">
                                <Tooltip title="执行者" className="mr-2">
                                    <UserOutlined />
                                </Tooltip>
                                {task?.assignees?.map((role) => {
                                    return <Tag key={role.id} color="blue">{role.role_name}</Tag>
                                })}
                            </div>
                            <div className="mt-1 text-gray-500">
                                <Tooltip title="发布时间" className="mr-2">
                                    <ClockCircleOutlined />
                                </Tooltip>
                                <span>
                                    {timestampToTime(task.publish_time * 1000)}
                                </span>
                            </div>
                        </div>
                    </div>
                })}
            </div>
        </Spin>
    </>
}