"use client";
import { clazz, task as taskApi, file as fileApi, repo_record } from "@/api";
import UserAvatar from "@/components/avatar";
import { bytesToSize, timestampToTime } from "@/util/string";
import { Alert, Button, Input, Popconfirm, Select, Steps, Tag, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    CloudSyncOutlined,
    FileAddOutlined,
    GithubOutlined,
    BarChartOutlined
} from "@ant-design/icons";
import {
    renderFileIcon
} from "@/util/file";
import GitSelectionModal from "./git_selection_modal";
import GitStatModal from "./git_stat_modal";
import FileSelectPanel from "@/components/file_select_panel";


function extractOriginalFileName(fileName) {
    // 使用正则表达式匹配前缀并将其替换为空字符串
    const regex = /^delivery_\d+_\d+_[\da-fA-F-]+_/;
    return fileName.replace(regex, '');
}



export default function TaskDelivery({ classId, groupId, task, me }) {
    const [isManager, setIsManager] = useState(false)
    const { data: canDeliver, error: cantDeliverError, isLoading: cantDeliverLoading } = useSWR('task-delivery-can-deliver', async () => {
        const data = await taskApi.checkTaskCanDelivery(classId, groupId, task.id)
        return data
    })
    const [refreshKey, setRefreshKey] = useState(`delivery-${Date.now()}`)
    const { data: deliveryList, error, isLoading } = useSWR(refreshKey, async () => {
        const data = await taskApi.getTaskDeliveryList(classId, groupId, task.id)
        return data?.data || []
    })
    const [deliveryItemList, setDeliveryItemList] = useState([])
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (!selectedDelivery) return
        setDeliveryItemList(selectedDelivery?.delivery_items)
    }, [selectedDelivery])

    useEffect(() => {
        if (!deliveryList?.length) return
        setSelectedDelivery(deliveryList[0])

    }, [deliveryList])


    return <>
        {contextHolder}
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

        <div className="flex justify-end gap-3 py-5">
            <Select options={
                deliveryList?.map(delivery => ({
                    label: <div>
                        {delivery?.delivery_status === 'draft' && <Tag color="blue">草稿</Tag>}
                        {delivery?.delivery_status === 'leader_review' && <Tag color="orange">组长审核</Tag>}
                        {delivery?.delivery_status === 'teacher_review' && <Tag color="orange">教师审核</Tag>}
                        {delivery?.delivery_status === 'leader_rejected' && <Tag color="red">组长驳回</Tag>}
                        {delivery?.delivery_status === 'teacher_rejected' && <Tag color="red">教师驳回</Tag>}
                        {delivery?.delivery_status === 'teacher_approved' && <Tag color="green">已完成</Tag>}
                        {timestampToTime(delivery?.delivery_time * 1000)}
                    </div>,
                    value: delivery?.id
                }))
            }
                placeholder="选择交付记录"
                className="w-56"
                onChange={value => setSelectedDelivery(deliveryList.find(delivery => delivery.id === value))}
                value={selectedDelivery?.id}
            />
            <Button
                onClick={() => setRefreshKey(`delivery-${Date.now()}`)}
                type="primary"
                icon={<EditOutlined />}
            >
                新建草稿
            </Button>
        </div>

        <div className="px-5 pt-5">
            <Steps
                current={0}
                items={[
                    {
                        title: '交付物提交',
                    },
                    {
                        title: '组长审核',
                    },
                    {
                        title: '教师审核',
                    },
                    {
                        title: '完成',
                    },
                ]}
            />

            <div className="mt-8 gap-3 flex">
                <FileSelectPanel condition={{
                    group_id: groupId,
                }} onFileSelect={async (files) => {
                    // 将选中的文件并入附件列表，若文件已存在则忽略
                    messageApi.open({
                        key: 'file-select-panel',
                        type: 'loading',
                        content: '正在添加文件...'
                    })
                    const total = files.length
                    let count = 0

                    for (const file of files) {
                        try {
                            await taskApi.addTaskDeliveryDraftItem(
                                classId,
                                groupId,
                                task.id,
                                {
                                    item_type: 'file',
                                    item_id: file.id
                                }
                            )
                            count++
                            messageApi.open({
                                key: 'file-select-panel',
                                type: 'loading',
                                content: `正在添加文件...(${count}/${total})`
                            })
                        } catch (e) {
                            continue;
                        }
                    }

                    messageApi.open({
                        key: 'file-select-panel',
                        type: 'success',
                        content: `成功添加 ${count} 个文件` + (count < total ? `，${total - count} 个文件添加失败` : '')
                    })
                    setRefreshKey(`delivery-${Date.now()}`)
                }}>
                    <Button
                        type="dashed"
                        icon={<FileAddOutlined />}
                    >
                        添加文件
                    </Button>
                </FileSelectPanel>
                <GitSelectionModal
                    classId={classId}
                    groupId={groupId}
                    onSelect={async (data) => {
                        messageApi.open({
                            key: 'git-selection-modal',
                            content: '正在添加交付物...',
                            type: 'loading',
                        })

                        try {
                            await taskApi.addTaskDeliveryDraftItem(
                                classId,
                                groupId,
                                task.id,
                                {
                                    item_type: 'repo',
                                    item_id: data.id
                                }
                            )
                            messageApi.open({
                                key: 'git-selection-modal',
                                content: '添加成功',
                                type: 'success',
                            })
                            setRefreshKey(`delivery-${Date.now()}`)
                        } catch (e) {
                            messageApi.open({
                                key: 'git-selection-modal',
                                content: e.message || '添加失败',
                                type: 'error',
                            })
                        }
                    }}
                >
                    <Button
                        type="dashed"
                        icon={<GithubOutlined />}
                    >
                        添加Git仓库
                    </Button>
                </GitSelectionModal>
            </div>
            <div className="mt-5 border border-gray-200 rounded-md">
                {deliveryItemList?.map(item => {
                    return <div key={item.id} className="flex items-center gap-3 py-3 hover:bg-gray-100 transition duration-300 ease-in-out p-3">
                        {item?.item_type === 'file' && <div className="flex items-center gap-3 justify-between w-full">
                            <div>
                                <div>
                                    <span>{renderFileIcon(item?.file?.name)}</span>
                                    <span className="ml-2">{extractOriginalFileName(item?.file?.name)}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {"创建于 "}
                                    {timestampToTime(item?.file?.create_date * 1000)}
                                    {" 大小 "}
                                    {bytesToSize(item?.file?.file_size)}
                                </div>
                            </div>
                            <div>
                                {item?.file?.file_type === 'document' && <Button
                                    onClick={() => {
                                        fileApi.getOnlineEditLink(item?.file?.id).then((url) => {
                                            if (url) {
                                                window.open(url)
                                            }
                                        })
                                    }}
                                    type="link"
                                    icon={<CloudSyncOutlined />}
                                />}
                                <Button
                                    onClick={() => {
                                        fileApi.downloadFile(item?.file?.id).then((url) => {
                                            if (url) {
                                                window.open(url)
                                            }
                                        })
                                    }}
                                    type="link"
                                    icon={<DownloadOutlined />}
                                />
                                <Popconfirm
                                    title="确定要删除这个文件吗？"
                                    placement="left"
                                    onConfirm={async () => {
                                        try {
                                            await taskApi.deleteTaskDeliveryDraftItem(
                                                classId,
                                                groupId,
                                                task.id,
                                                item.id
                                            )
                                            setRefreshKey(`delivery-${Date.now()}`)
                                        } catch (e) {
                                            message.error(e.message || '删除失败')
                                        }
                                    }}
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        type="link"
                                    />
                                </Popconfirm>
                            </div>
                        </div>}

                        {item?.item_type === 'repo' && <div className="flex items-center gap-3 justify-between w-full">
                            <div>
                                <div>
                                    <span><GithubOutlined /></span>
                                    <span className="ml-2"> {item?.repo?.repo_url.split('/').pop()}</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {item?.repo?.repo_url}
                                </span>
                            </div>
                            <div>
                                <GitStatModal
                                    record={item?.repo}
                                >
                                    <Button
                                        type="link"
                                        icon={<BarChartOutlined />}
                                    />
                                </GitStatModal>
                                <Button
                                    type="link"
                                    icon={<DownloadOutlined />}
                                    onClick={() => {
                                        repo_record.downloadRepoRecordArchive(classId, groupId, item?.repo?.id).then((url) => {
                                            if (url) {
                                                window.open(url)
                                            }
                                        })
                                    }}
                                />
                                <Popconfirm
                                    title="确定要删除这个Git仓库吗？"
                                    placement="left"
                                    onConfirm={async () => {
                                        try {
                                            await taskApi.deleteTaskDeliveryDraftItem(
                                                classId,
                                                groupId,
                                                task.id,
                                                item.id
                                            )
                                            setRefreshKey(`delivery-${Date.now()}`)
                                        } catch (e) {
                                            message.error(e.message || '删除失败')
                                        }
                                    }}
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        type="link"
                                    />
                                </Popconfirm>
                            </div>
                        </div>}
                    </div>
                })}
            </div>

            <div className="mt-5">
            </div>
        </div>
    </>
}