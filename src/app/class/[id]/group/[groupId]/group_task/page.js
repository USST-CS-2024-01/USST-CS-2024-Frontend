"use client"
import useSWR from "swr";
import GroupTaskList from "./group_task_list";
import { group } from "@/api";
import { Button, Checkbox, Input, Select, message } from 'antd';
import {
    SearchOutlined,
    PlusOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useDebounceFn } from "@ant-design/pro-components";
import GroupTaskModal from "./group_task_modal";

export default function GroupTaskPage({ params }) {
    const { id, groupId } = params;
    const { data: meMember } = useSWR('me-group-task', () => group.getMyGroupMember(id))
    const [messageApi, contextHolder] = message.useMessage();
    const [kw, setKw] = useState('')
    const [searchKw, setSearchKw] = useState('')
    const [onlyMe, setOnlyMe] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [forceRefreshKey, setForceRefreshKey] = useState(0)
    const [open, setOpen] = useState(false)

    const updateSearchKw = useDebounceFn((kw) => {
        setSearchKw(kw)
    }, 500)

    useEffect(() => {
        setOpen(!!selectedTask)
    }, [selectedTask])

    return <>
        {contextHolder}

        {selectedTask && <GroupTaskModal
            classId={id}
            groupId={groupId}
            taskId={selectedTask.id}
            open={open}
            onClose={() => {
                setOpen(false)
                setTimeout(() => {
                    setSelectedTask(null)
                }, 200);
            }}
            onUpdate={() => {
                setSelectedTask(null)
                setForceRefreshKey(forceRefreshKey + 1)
            }}
            me={meMember}
        />}

        <div className="p-5">
            <div className="bg-white p-5 rounded">
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <Input
                            placeholder="搜索代办事项"
                            prefix={<SearchOutlined />}
                            value={kw}
                            onChange={(e) => {
                                setKw(e.target.value)
                                updateSearchKw.run(e.target.value)
                            }}
                            allowClear
                        />
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setSelectedTask({
                                    id: null
                                })
                            }}
                        >
                            新建
                        </Button>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Checkbox
                            checked={onlyMe}
                            onChange={(e) => {
                                setOnlyMe(e.target.checked)
                            }}
                        >只看我的</Checkbox>
                    </div>
                </div>
                <div className="flex gap-5 mt-5">
                    {meMember && <>
                        <div className="flex-1">
                            <GroupTaskList
                                classId={id}
                                groupId={groupId}
                                me={meMember}
                                status={"pending"}
                                kw={searchKw}
                                onlyMe={onlyMe}
                                onSelect={(task) => { setSelectedTask(task) }}
                                forceRefreshKey={forceRefreshKey}
                            />
                        </div>
                        <div className="flex-1">
                            <GroupTaskList
                                classId={id}
                                groupId={groupId}
                                me={meMember}
                                status={"normal"}
                                kw={searchKw}
                                onlyMe={onlyMe}
                                onSelect={(task) => { setSelectedTask(task) }}
                                forceRefreshKey={forceRefreshKey}
                            />
                        </div>
                        <div className="flex-1">
                            <GroupTaskList
                                classId={id}
                                groupId={groupId}
                                me={meMember}
                                status={"finished"}
                                kw={searchKw}
                                onlyMe={onlyMe}
                                onSelect={(task) => { setSelectedTask(task) }}
                                forceRefreshKey={forceRefreshKey}
                            />
                        </div>
                    </>}
                </div>
            </div>
        </div>
    </>
}