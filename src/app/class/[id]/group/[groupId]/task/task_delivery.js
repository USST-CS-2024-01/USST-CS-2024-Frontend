"use client";
import { clazz, task as taskApi } from "@/api";
import UserAvatar from "@/components/avatar";
import { Alert, Button, Input, Tag, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";


export default function TaskDelivery({ classId, groupId, task, me }) {
    const [isManager, setIsManager] = useState(false)
    const { data: canDeliver, error: cantDeliverError, isLoading: cantDeliverLoading } = useSWR('task-delivery-can-deliver', async () => {
        const data = await taskApi.checkTaskCanDelivery(classId, groupId, task.id)
        return data
    })

    return <>
        {canDeliver && <Alert
            showIcon
            type="success"
            message="检测通过，您当前可以交付任务！"
        />}
        {cantDeliverError && <Alert
            showIcon
            type="error"
            message="检测未通过，您当前无法交付任务！"
            description={cantDeliverError?.message}
        />}
    </>
}