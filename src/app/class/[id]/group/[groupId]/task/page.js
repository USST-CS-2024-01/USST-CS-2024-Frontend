"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { task, group } from "@/api"
import { Tooltip } from "antd"
import {
    CalendarOutlined,
    TrophyOutlined,
    UserOutlined
} from "@ant-design/icons"
import { timestampToTime } from "@/util/string"
import TaskPanel from "./task_panel"

export default function GroupTaskDeliveryPage({ params }) {
    const { data: meMember } = useSWR('me-task', () => group.getMyGroupMember(id))
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data: tasks, error, isLoading } = useSWR(refreshKey, () => {
        return task.getGroupTaskChain(params.id, params.groupId)
    })
    const [selectedTask, setSelectedTask] = useState(null)
    const { id, groupId } = params

    useEffect(() => {
        if (selectedTask) return;

        const current_task_id = tasks?.current_task_id;
        if (!current_task_id) return;

        const task = tasks?.task_chain?.find((task) => task.id === current_task_id)
        setSelectedTask(task)
    }, [tasks, selectedTask])

    return <div className="p-5">
        <h2 className="text-2xl font-bold mb-5 p-5">
            任务交付
        </h2>

        <div className="flex">
            <div>
                {tasks?.task_chain?.map((task, index) => {
                    return <div
                        className={`mb-3 bg-white flex flex-col w-64 px-2 hover:shadow-md transition duration-300 ease-in-out cursor-pointer ${selectedTask?.id === task?.id ? 'border border-blue-500' : ''}`}
                        key={task?.id}
                    >
                        <div className="p-2 font-bold border-b flex items-center pl-0">
                            <span className="ml-2 truncate">#{index + 1} {task?.name}</span>
                            {
                                (task?.deadline > 0 && task?.deadline < Date.now() / 1000)
                                &&
                                <span className="ml-2 text-red-500">
                                    <Tooltip title="已过截止时间">
                                        <CalendarOutlined />
                                    </Tooltip>
                                </span>
                            }
                        </div>
                        <div className="pb-3">
                            <ul className="mt-2 text-sm text-gray-600 px-2">
                                <li className="flex items-center gap-2">
                                    <Tooltip title="交付者">
                                        <UserOutlined />
                                    </Tooltip>
                                    <span>{task?.role?.role_name || '未分配'}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Tooltip title="截止时间">
                                        <CalendarOutlined />
                                    </Tooltip>
                                    <span>{task?.deadline ? timestampToTime(task?.deadline * 1000) : '未设置截止'}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Tooltip title="成绩占比">
                                        <TrophyOutlined />
                                    </Tooltip>
                                    <span>{task?.grade_percentage?.toFixed(2)}%</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                })}
            </div>

            <div className="bg-white p-5 rounded max-w-[800px] flex-grow ml-5">
                {
                    selectedTask && <TaskPanel
                        classId={id}
                        groupId={groupId}
                        task={selectedTask}
                        me={meMember}
                    />
                }
            </div>
        </div>
    </div>
}