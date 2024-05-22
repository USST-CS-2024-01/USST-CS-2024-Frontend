"use client"
import { ProDescriptions } from "@ant-design/pro-components"
import { Modal, message } from "antd"
import { useEffect, useState } from "react"
import { clazz } from "@/api"
import useSWR from "swr"
import { notFound } from "next/navigation"
import CardAction from "@/components/card_action"

export default function ActionPanel({ id }) {
    const [messageApi, contextHolder] = message.useMessage();
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data, error, isLoading } = useSWR(refreshKey, (key) => {
        if (id === 'new') {
            notFound();
        }
        return clazz.getClass(id)
    })


    return <>
        {contextHolder}
        <div className={"mt-5 p-5 bg-white rounded-md max-w-[600px]"}>
            <ProDescriptions
                column={2}
                title={"班级信息"}
            >
                <ProDescriptions.Item
                    label="班级名称"
                    span={2}
                >
                    {data?.name}
                </ProDescriptions.Item>
                <ProDescriptions.Item
                    label="学生人数"
                >
                    {data?.stu_count}
                </ProDescriptions.Item>
                <ProDescriptions.Item
                    label="教师人数"
                >
                    {data?.tea_count}
                </ProDescriptions.Item>
                <ProDescriptions.Item
                    label="班级状态"
                    valueEnum={{
                        not_started: {
                            text: '未开始',
                            status: 'Default'
                        },
                        grouping: {
                            text: '分组中',
                            status: 'Processing'
                        },
                        teaching: {
                            text: '教学中',
                            status: 'Success'
                        },
                        finished: {
                            text: '已结束',
                            status: 'Error'
                        },
                    }}
                >
                    {data?.status}
                </ProDescriptions.Item>
            </ProDescriptions>


            {data?.status === 'not_started' && <>
                <CardAction
                    title={"启动班级"}
                    description={<>
                        将班级的状态切换至分组中，学生可以开始组队。<br />
                        <b>请注意，启动后，将无法修改班级角色信息！</b>
                    </>}
                    buttonTitle={"启动"}
                    onClick={async () => {
                        messageApi.open({
                            key: 'update',
                            type: 'loading',
                            content: '正在启动...'
                        })
                        try {
                            await clazz.switchToGroupStage(id);
                            messageApi.open({
                                key: 'update',
                                type: 'success',
                                content: '启动成功'
                            })
                            setRefreshKey(refreshKey + 1)
                        } catch (error) {
                            messageApi.open({
                                key: 'update',
                                type: 'error',
                                content: error?.message || '启动失败'
                            })
                        }
                    }}
                />
            </>}


            {data?.status === 'grouping' && <>
                <CardAction
                    title={"开始授课"}
                    danger
                    description={<>
                        将班级的状态切换至授课中，学生可以开始交付任务。<br />
                        <b>请注意，启动后，所有的分组信息都将无法修改，且管理员无法添加成员至班级！</b><br />
                        <b>该操作不可逆，请谨慎操作！</b>
                    </>}
                    buttonTitle={"启动"}
                    onClick={async () => {
                        Modal.confirm({
                            title: '确认开始授课',
                            content: '确认开始授课后，将无法修改组队信息，请确保已经完成组队工作！',
                            danger: true,
                            centered: true,
                            okType: 'danger',
                            onOk: async () => {
                                messageApi.open({
                                    key: 'update',
                                    type: 'loading',
                                    content: '正在启动...'
                                })
                                try {
                                    await clazz.switchToTeachingStage(id);
                                    messageApi.open({
                                        key: 'update',
                                        type: 'success',
                                        content: '启动成功'
                                    })
                                    setRefreshKey(refreshKey + 1)
                                } catch (error) {
                                    messageApi.open({
                                        key: 'update',
                                        type: 'error',
                                        content: error?.message || '启动失败'
                                    })
                                }
                            }
                        })
                    }}
                />
            </>}

            {data?.status === 'teaching' && <>
                <CardAction
                    title={"归档班级"}
                    description={<>
                        将班级归档，归档后的班级将无法再进行任何操作，学生和教师仍然可以查看班级信息。
                    </>}
                    buttonTitle={"归档"}
                    onClick={async () => {
                        messageApi.open({
                            key: 'update',
                            type: 'loading',
                            content: '正在归档...'
                        })
                        try {
                            await clazz.switchToArchiveStage(id);
                            messageApi.open({
                                key: 'update',
                                type: 'success',
                                content: '归档成功'
                            })
                            setRefreshKey(refreshKey + 1)
                        } catch (error) {
                            messageApi.open({
                                key: 'update',
                                type: 'error',
                                content: error?.message || '归档失败'
                            })
                        }
                    }}
                    danger
                />
            </>}

            {data?.status === 'finished' && <>
                <CardAction
                    title={"取消归档班级"}
                    description={<>
                        将班级从归档状态恢复。
                    </>}
                    buttonTitle={"取消归档"}
                    onClick={async () => {
                        messageApi.open({
                            key: 'update',
                            type: 'loading',
                            content: '正在取消归档...'
                        })
                        try {
                            await clazz.revertArchiveStage(id);
                            messageApi.open({
                                key: 'update',
                                type: 'success',
                                content: '取消归档成功'
                            })
                            setRefreshKey(refreshKey + 1)
                        } catch (error) {
                            messageApi.open({
                                key: 'update',
                                type: 'error',
                                content: error?.message || '取消归档失败'
                            })
                        }
                    }}
                />
            </>}
        </div>
    </>
}