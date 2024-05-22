import { task } from "@/api";
import { Tag } from "antd";
import useSWR from "swr";

export default function TaskStatusBadge({ classId, groupId, taskId }) {
    const { data: delivery } = useSWR(`task-delivery-${classId}-${groupId}-${taskId}`, async () => {
        try {
            const data = await task.getTaskDeliveryList(classId, groupId, taskId);
            return data?.data[0] || null;
        } catch (error) {
            return null;
        }
    });

    return (
        <div>
            {!delivery && <Tag color="default">未提交</Tag>}
            {delivery?.delivery_status === "draft" && <Tag color="default">未提交</Tag>}
            {delivery?.delivery_status === "leader_review" && <Tag color="processing">组长审核</Tag>}
            {delivery?.delivery_status === "teacher_review" && <Tag color="processing">教师审核</Tag>}
            {delivery?.delivery_status === "teacher_rejected" && <Tag color="error">教师驳回</Tag>}
            {delivery?.delivery_status === "leader_rejected" && <Tag color="error">组长驳回</Tag>}
            {delivery?.delivery_status === "teacher_approved" && <Tag color="success">已完成</Tag>}
        </div>
    )
}