"use client";

import { Segmented } from "antd";
import {
    FileDoneOutlined,
    SignatureOutlined,
    UploadOutlined
} from "@ant-design/icons";
import TaskBasicInfo from "./task_basic_info";
import { useState } from "react";
import TaskGroupMemberScore from "./task_group_member_score";
import TaskDelivery from "./task_delivery";

export default function TaskPanel({ classId, groupId, task, me }) {
    const [segment, setSegment] = useState('description')

    return <div>
        <h1 className="text-xl font-bold pb-3">
            {task?.name} ({task?.grade_percentage}%)
        </h1>
        <Segmented
            options={[
                { label: '任务介绍', value: 'description', icon: <FileDoneOutlined /> },
                { label: '组内评分', value: 'score', icon: <SignatureOutlined /> },
                { label: '任务交付', value: 'delivery', icon: <UploadOutlined /> }
            ]}
            value={segment}
            onChange={setSegment}
        />
        <div className="mt-5">
            {segment === 'description' && <TaskBasicInfo task={task} />}
            {segment === 'score' && <TaskGroupMemberScore task={task} classId={classId} groupId={groupId} me={me} />}
            {segment === 'delivery' && <TaskDelivery task={task} classId={classId} groupId={groupId} me={me} />}
        </div>
    </div>
}