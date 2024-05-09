"use client"

import { group, clazz } from "@/api"
import FileList from "@/components/file_list"
import FileSelectPanel from "@/components/file_select_panel"
import { ProForm, ProFormDateTimePicker, ProFormItem, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Button, Modal, message } from "antd"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { PlusOutlined } from '@ant-design/icons'

export default function GroupTaskModal({ classId, groupId, taskId, open, onUpdate, onClose, me }) {
    const [form] = ProForm.useForm()
    const [attachment, setAttachment] = useState([])
    const [messageApi, contextHolder] = message.useMessage();
    const [updating, setUpdating] = useState(false)
    const { data: taskDetail, error, isLoading } = useSWR(taskId, () => {
        if (taskId === null) {
            return null
        }
        return group.getGroupTaskDetail(classId, groupId, taskId)
    })
    const [permissionLevel, setPermissionLevel] = useState(0)

    useEffect(() => {
        if (!taskId) {
            setPermissionLevel(2)
            return
        }

        if (!me) return;
        if (me?.user?.user_type === 'teacher') {
            setPermissionLevel(2)
            return;
        }
        const isManager = me?.roles?.some((role) => role.is_manager)
        if (isManager) {
            setPermissionLevel(2)
            return;
        }
        if (me?.user?.id === taskDetail?.publisher) {
            setPermissionLevel(2)
            return;
        }

        const assignee_ids = taskDetail?.assignees?.map((item) => item.id)
        const role_ids = me?.roles?.map((item) => item.id)
        if (assignee_ids?.some((item) => role_ids.includes(item))) {
            setPermissionLevel(1)
            return;
        }

        setPermissionLevel(0)
    }, [me, taskDetail, taskId])

    const onCloseModal = () => {
        form.resetFields()
        onClose()
    }

    const onFinish = async (values) => {
        if (values.deadline) {
            values.deadline = new Date(values.deadline).getTime() / 1000
        } else {
            delete values.deadline
        }
        values.related_files = attachment.map((item) => item.id)
        delete values.attachment

        if (permissionLevel < 2) {
            delete values.name
            delete values.details
            delete values.deadline
            delete values.assignees
            delete values.priority
        }

        try {
            setUpdating(true)
            if (taskId) {
                await group.updateGroupTask(classId, groupId, taskId, values)
            } else {
                await group.createGroupTask(classId, groupId, values)
            }
            messageApi.success('操作成功')
            onCloseModal()
            onUpdate()
        } catch (e) {
            messageApi.error(e.message || '操作失败')
        }
        setUpdating(false)
    }

    useEffect(() => {
        if (!taskDetail) return

        form.setFieldsValue({
            ...taskDetail
        })
        form.setFieldValue('assignees', taskDetail.assignees.map((item) => item.id))
        form.setFieldValue('deadline', taskDetail.deadline ? new Date(taskDetail.deadline * 1000) : null)
        
        setAttachment(taskDetail.related_files)
    }, [taskDetail, form])

    return <>
        {contextHolder}
        <Modal
            open={open}
            title={taskId ? '编辑待办' : '新建待办'}
            onCancel={onCloseModal}
            footer={null}
            centered
            maskClosable={false}
            width={1024}
        >
            <ProForm
                form={form}
                onFinish={onFinish}
                submitter={false}
            >
                <div className="flex justify-between gap-5 mt-5">
                    <div className="flex-1">
                        <ProFormText
                            name="name"
                            label="任务名称"
                            placeholder="请输入任务名称"
                            rules={[{ required: true, message: '请输入任务名称' }, { max: 100, message: '任务名称不能超过100个字符' }]}
                            disabled={permissionLevel < 2}
                        />
                        <ProFormTextArea
                            name="details"
                            label="任务描述"
                            placeholder="请输入任务描述"
                            rules={[{ max: 5000, message: '任务描述不能超过5000个字符' }, { required: true, message: '请输入任务描述' }]}
                            rows={10}
                            disabled={permissionLevel < 2}
                        />
                        <ProFormDateTimePicker
                            name="deadline"
                            label="截止时间"
                            placeholder="请选择截止时间"
                            disabled={permissionLevel < 2}
                        />
                        <ProFormSelect
                            name="priority"
                            label="优先级"
                            placeholder="请选择优先级"
                            options={[
                                { label: '低', value: 0 },
                                { label: '中', value: 1 },
                                { label: '高', value: 2 },
                                { label: '紧急', value: 3 }
                            ]}
                            rules={[{ required: true, message: '请选择优先级' }]}
                            disabled={permissionLevel < 2}
                        />
                        <ProFormSelect
                            name="assignees"
                            label="执行者"
                            placeholder="请选择执行者"
                            mode="multiple"
                            rules={[{ required: true, message: '请选择执行者' }]}
                            request={async () => {
                                const result = await clazz.getRoleList(classId)
                                return result.map((item) => ({ label: item.role_name, value: item.id }))
                            }}
                            disabled={permissionLevel < 2}
                        />
                    </div>
                    <div className="flex-1">
                        {taskId && <ProFormSelect
                            name="status"
                            label="任务状态"
                            placeholder="请选择任务状态"
                            rules={[{ required: true, message: '请选择任务状态' }]}
                            options={[
                                { label: '待开始', value: 'pending' },
                                { label: '进行中', value: 'normal' },
                                { label: '已完成', value: 'finished' },
                            ]}
                            disabled={permissionLevel < 1}
                        />}
                        <ProFormItem
                            name="attachment"
                            label="附件"
                        >
                            <div className="flex flex-col gap-2">
                                {permissionLevel >= 1 && <FileSelectPanel condition={{
                                    group_id: groupId,
                                }} onFileSelect={(files) => {
                                    // 将选中的文件并入附件列表，若文件已存在则忽略
                                    setAttachment((prev) => {
                                        const newAttachment = prev.slice()
                                        for (const file of files) {
                                            if (!prev.find((item) => item.id === file.id)) {
                                                newAttachment.push(file)
                                            }
                                        }
                                        return newAttachment
                                    })
                                }}>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                    >
                                        添加附件
                                    </Button>
                                </FileSelectPanel>}
                                <FileList
                                    files={attachment}
                                    onChange={(files) => {
                                        setAttachment(files)
                                    }}
                                    disabled={permissionLevel < 1}
                                />
                            </div>
                        </ProFormItem>
                    </div>
                </div>

                {
                    permissionLevel >= 1 && <ProFormItem>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button onClick={onCloseModal}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" loading={updating}>
                                提交
                            </Button>
                        </div>
                    </ProFormItem>
                }
            </ProForm>
        </Modal>
    </>
}