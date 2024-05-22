"use client"
import { Avatar, Breadcrumb, Button, Empty, Segmented, Spin, Tag, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { clazz, task, group } from '@/api/index';
import useSWR from 'swr';
import {
    CalendarOutlined,
    EditOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { timestampToTime } from '@/util/string';
import { ProTable } from '@ant-design/pro-components';
import TaskProgressList from './task_progress_list';
import { message } from 'antd';
import { doTaskRecordArchive } from '@/util/archive_download';

export default function TaskDeliveryManage({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const { id: classId } = params
    const { data: groups } = useSWR(`task-delivery-${classId}`, async (key) => {
        const data = await group.getClassGroupList(classId);
        return data?.data || []
    })
    const [messageApi, contextHolder] = message.useMessage();

    const TASK_COLUMNS = [
        {
            title: '序号',
            dataIndex: 'index',
            valueType: 'index',
            width: 64,
            align: "center",
            disable: true,
        },
        {
            title: '任务名称',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            width: 200,
            render: (text, record) => {
                return <>
                    <span>
                        {record.name}
                        {
                            (record.deadline > 0 && record.deadline < Date.now() / 1000)
                            &&
                            <span className="ml-2 text-red-500">
                                <Tooltip title="已过截止时间">
                                    <CalendarOutlined />
                                </Tooltip>
                            </span>
                        }
                    </span>
                </>
            }
        },
        {
            title: '截止时间',
            dataIndex: 'deadline',
            hideInSearch: true,
            width: 200,
            align: 'center',
            renderText: (text) => {
                return timestampToTime(text * 1000)
            }
        },
        {
            title: '提交进度',
            dataIndex: 'progress',
            hideInSearch: true,
            align: 'center',
            render: (text, record, _, action) => {
                return <TaskProgressList
                    classId={classId}
                    taskId={record.id}
                    groups={groups}
                    taskInfo={record}
                />
            }
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            align: 'center',
            width: 150,
            render: (text, record, _, action) => {
                return <div className='flex justify-center gap-1'>
                    <Tooltip title="批改">
                        <Button
                            type="text"
                            key="editable"
                            onClick={() => {
                                router.push(`/class/${classId}/task_delivery/${record.id}/grade`);
                            }}
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title="归档下载">
                        <Button
                            type="text"
                            key="editable"
                            onClick={() => {
                                console.log(classId, record.id)
                                messageApi.open({
                                    key: 'download_all',
                                    type: 'loading',
                                    content: '即将开始下载，请勿关闭页面',
                                })
                                doTaskRecordArchive(classId, record.id, ({ status, message, progress }) => {
                                    if (status === 'error') {
                                        messageApi.error({
                                            key: 'download_all',
                                            content: message
                                        })
                                    }

                                    if (status === 'progress') {
                                        messageApi.loading({
                                            key: 'download_all',
                                            content: `正在下载，请勿关闭页面：${message} (${progress}%)`
                                        })
                                    }
                                }).then((url) => {
                                    if (url) {
                                        window.open(url)
                                    }
                                    messageApi.success({
                                        key: 'download_all',
                                        content: '下载完成'
                                    })
                                }).catch((e) => {
                                    messageApi.error({
                                        key: 'download_all',
                                        content: e?.message || '下载失败'
                                    })
                                })
                            }}
                            icon={<DownloadOutlined />}
                        />
                    </Tooltip>
                </div>
            },
        },
    ];

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, classId))
    }, [router, classId])


    return <div className={"p-10"}>
        {contextHolder}
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>小组交付管理</h1>

        <div className={"mt-5"}>
            监控各个小组进度，批改与审核小组交付。
        </div>

        <div className="flex mt-5 max-w-[1200px]">
            <ProTable
                className="mt-5"
                columns={TASK_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    try {
                        return await task.getClassTaskChain(classId)
                    } catch (e) {
                        return {
                            success: false,
                            data: [],
                            total: 0
                        }
                    }
                }}
                editable={false}
                columnsState={{
                    persistenceKey: 'scs:manage:clazz-task-delivery-table',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: { fixed: 'right', disable: true },
                    },
                    onChange(value) {
                        console.log('value: ', value);
                    },
                }}
                rowKey="id"
                search={false}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                pagination={{
                    pageSize: 20,
                }}
                dateFormatter="string"
            />

        </div>
    </div>
}