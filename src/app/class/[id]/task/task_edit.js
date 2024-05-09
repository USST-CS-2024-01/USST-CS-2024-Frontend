"use client";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { clazz, task } from '@/api/index';
import { ProForm, ProFormDateTimePicker, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import MonacoEditor from '@monaco-editor/react'
import FileSelectPanel from "../../../../components/file_select_panel";
import { Button, Popconfirm, message } from "antd";
import {
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import FileList from "../../../../components/file_list";


export default function TaskEdit({ taskInfo, onEdit, onDelete }) {
    const [form] = ProForm.useForm()
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data, error, isLoading } = useSWR(refreshKey, () => {
        if (taskInfo.id === 'new') {
            return null
        }
        return task.getClassTask(
            taskInfo.class_id,
            taskInfo.id
        )
    })

    const [description, setDescription] = useState('')
    const [attachment, setAttachment] = useState([])
    const [messageApi, contextHolder] = message.useMessage();
    const { id } = taskInfo

    const onFinish = async (values) => {
        console.log(values)

        values.deadline = Math.floor(Number(values.deadline / 1000));
        if (!values.deadline || isNaN(values.deadline)) {
            values.deadline = 0
        }
        values.publish_time = Math.floor(Date.now() / 1000)
        // console.log(values)

        try {
            if (id === 'new') {
                await task.createClassTask(taskInfo.class_id, values)
            } else {
                await task.updateClassTask(taskInfo.class_id, id, values)
            }
            setRefreshKey(Date.now())
            messageApi.success('操作成功')
        } catch (e) {
            messageApi.error(e.message || '操作失败')
        }

        if (onEdit) {
            onEdit()
        }
    }

    const resetForm = useCallback(() => {
        if (!data) {
            form.resetFields()
            setDescription('')
            setAttachment([])
            return
        }

        form.setFieldsValue(data)
        form.setFieldValue('deadline', new Date(data.deadline * 1000))
        setDescription(data.content)
        setAttachment(data.attached_files)
    }, [data, form])

    useEffect(() => {
        setRefreshKey(Date.now())
    }, [taskInfo])

    useEffect(() => {
        resetForm()
    }, [data, form, resetForm])

    useEffect(() => {
        form.setFieldValue('attached_files', attachment.map((item) => item.id))
    }, [attachment, form])

    return (
        <div className="max-w-[800px]">
            <div className="flex justify-between items-center pb-5">
                <h1 className="text-xl font-bold">{id === 'new' ? '新建任务' : '编辑任务'}</h1>
                <Popconfirm
                    title="您确定要删除该任务吗？"
                    onConfirm={() => {
                        if (id === 'new') {
                            return
                        }
                        task.deleteClassTask(taskInfo.class_id, id).then(() => {
                            messageApi.success('删除成功')
                            if (onDelete) {
                                onDelete()
                            }
                        }).catch((e) => {
                            messageApi.error(e.message || '删除失败')
                        })
                    }}
                    placement="left"
                    okType="danger"
                >
                    <Button
                        danger
                        disabled={id === 'new' || taskInfo.locked}
                        icon={<DeleteOutlined />}
                    >
                        删除任务
                    </Button>
                </Popconfirm>
            </div>

            {contextHolder}
            <ProForm form={form} onReset={() => {
                resetForm()
            }} onFinish={onFinish}>
                <ProFormText
                    label="任务名称"
                    name="name"
                    required
                    placeholder="任务名称，长度不超过500个字符"
                    rules={[{ required: true, max: 500 }]}
                />
                <ProFormSelect
                    label="任务交付者"
                    name="specified_role"
                    required
                    tooltip="需要在预设的班级角色中，选择一个角色作为任务交付者，设置后只有该角色的学生可以提交任务"
                    request={async () => {
                        const result = await clazz.getRoleList(taskInfo.class_id);
                        return result.map((item) => ({ label: item.role_name, value: item.id }))
                    }}
                    rules={[{ required: true }]}
                />
                <ProFormDigit
                    label="成绩占比"
                    name="grade_percentage"
                    required
                    placeholder={"成绩占比，范围0-100，支持小数点后两位"}
                    tooltip="设置任务的成绩占比，范围0-100，支持小数点后两位"
                    fieldProps={{ precision: 2 }}
                    rules={[{ required: true }, { type: 'number', min: 0, max: 100 }]}
                />
                <ProForm.Item
                    label="任务简介"
                    name="content"
                    required
                    tooltip="任务简介，长度不超过10000个字符，支持markdown格式"
                    rules={[{ required: true, max: 1000 }]}
                >
                    <div className="border-[rgb(217, 217, 217)] rounded-md border border-[1px] overflow-hidden">
                        <MonacoEditor
                            language="markdown"
                            theme="vs-light"
                            value={description}
                            height={400}
                            width={'100%'}
                            options={{
                                selectOnLineNumbers: true,
                            }}
                            onChange={(value) => {
                                form.setFieldsValue({ content: value })
                                setDescription(value)
                            }}
                        />
                    </div>
                </ProForm.Item>
                <ProForm.Item
                    label="附件"
                    name="attached_files"
                    tooltip="任务的附件，支持上传文件，上传的附件将保存至班级空间。"
                >
                    <div className="flex flex-col gap-2">
                        <FileSelectPanel condition={{
                            class_id: taskInfo.class_id,
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
                        </FileSelectPanel>
                        <FileList files={attachment} onChange={(files) => {
                            setAttachment(files)
                        }} />
                    </div>
                </ProForm.Item>
                <ProFormDateTimePicker
                    label="截止时间"
                    name="deadline"
                    tooltip="设置任务截止时间后，超过该时间的提交将被视为迟交（但不会阻止提交）"
                    onChange={(value) => {
                        form.setFieldsValue({ deadline: new Date(value).getTime() })
                    }}
                />
            </ProForm>
        </div>
    )
}