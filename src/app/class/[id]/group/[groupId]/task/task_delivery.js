"use client";
import { task as taskApi, file as fileApi, repo_record } from "@/api";
import { bytesToSize, timestampToTime } from "@/util/string";
import { Alert, Button, Empty, Input, Modal, Popconfirm, Select, Steps, Tag, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    CloudSyncOutlined,
    FileAddOutlined,
    GithubOutlined,
    BarChartOutlined,
    ToTopOutlined
} from "@ant-design/icons";
import {
    renderFileIcon
} from "@/util/file";
import GitSelectionModal from "./git_selection_modal";
import GitStatModal from "@/components/git_stat_modal";
import FileSelectPanel from "@/components/file_select_panel";
import MeetingRecordTable from "@/components/meeting_record_table";
import { ProForm, ProFormCheckbox, ProFormRadio, ProFormText, ProFormTextArea } from "@ant-design/pro-components";


function extractOriginalFileName(fileName) {
    // 使用正则表达式匹配前缀并将其替换为空字符串
    const regex = /^delivery_\d+_\d+_[\da-fA-F-]+_/;
    return fileName.replace(regex, '');
}

const STAGE_MAP = {
    draft: 0,
    leader_review: 1,
    leader_rejected: 1,
    teacher_review: 2,
    teacher_rejected: 2,
    teacher_approved: 3,
}


export default function TaskDelivery({ classId, groupId, task, me }) {
    const [isManager, setIsManager] = useState(false)
    const [isSubmitter, setIsSubmitter] = useState(false)
    const { data: deliverStatus } = useSWR('task-delivery-can-deliver', async () => {
        try {
            const data = await taskApi.checkTaskCanDelivery(classId, groupId, task.id)
            return {
                canDeliver: true,
                error: null
            }
        } catch (e) {
            return {
                canDeliver: false,
                error: e?.message || '未知错误'
            }
        }
    })
    const [refreshKey, setRefreshKey] = useState(`delivery-${Date.now()}`)
    const { data: deliveryList, error, isLoading } = useSWR(refreshKey, async () => {
        const data = await taskApi.getTaskDeliveryList(classId, groupId, task.id)
        return data?.data || []
    })
    const [deliveryItemList, setDeliveryItemList] = useState([])
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = ProForm.useForm();
    const [approve, setApprove] = useState(null)

    useEffect(() => {
        if (!me) return
        setIsManager(me?.roles?.some(role => role.is_manager))
        if (!task) return
        setIsSubmitter(me?.roles?.some(role => role.id === task?.specified_role))
    }, [me, task])

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
        <div className="flex justify-end gap-3">
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
                onClick={async () => {
                    try {
                        await taskApi.createTaskDeliveryDraft(classId, groupId, task.id)
                        setRefreshKey(`delivery-${Date.now()}`)
                    } catch (e) {
                        message.error(e.message || '新建草稿失败')
                    }
                }}
                type="primary"
                icon={<EditOutlined />}
                disabled={!isSubmitter}
            >
                新建草稿
            </Button>
        </div>

        {selectedDelivery?.delivery_status === 'draft' && <div className="p-5 pb-0">
            {(deliverStatus && deliverStatus.canDeliver) && <Alert
                showIcon
                type="success"
                message="当前可以交付任务"
            />}
            {(deliverStatus && !deliverStatus.canDeliver) && <Alert
                showIcon
                type="error"
                message="当前无法交付任务"
                description={deliverStatus?.error}
            />}
        </div>}

        {(selectedDelivery?.delivery_status === 'leader_rejected' ||
            selectedDelivery?.delivery_status === 'teacher_rejected') &&
            <div className="p-5 pb-0">
                <div className="mt-5 border bg-red-50 rounded-md">
                    <h3 className="text-red-600 font-bold p-3 pb-0 text-base">驳回原因</h3>
                    <div className="p-3 text-red-600 pb-1">
                        {selectedDelivery?.delivery_comments}
                    </div>

                    <div className="pt-0 pr-3 pb-3 text-gray-400 text-right">
                        *交付被驳回，请点击“新建草稿”重新提交
                    </div>
                </div>
            </div>
        }

        <div className="px-5 pt-10">
            <Steps
                current={STAGE_MAP[selectedDelivery?.delivery_status]}
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
                status={
                    selectedDelivery?.delivery_status === 'leader_rejected' ||
                        selectedDelivery?.delivery_status === 'teacher_rejected' ?
                        'error' :
                        selectedDelivery?.delivery_status === 'teacher_approved' ?
                            'finish' : 'process'
                }
            />

            <h2 className="text-gray-600 font-bold mt-8 text-lg">交付材料</h2>

            {(selectedDelivery?.delivery_status === 'draft' && isSubmitter) &&
                <div className="mt-3 gap-3 flex">
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
                </div>}
            <div className="mt-5 border border-gray-200 rounded-md">
                {(deliveryItemList?.length === 0 || !deliveryItemList) && <div className="py-5">
                    <Empty
                        description="暂无交付物"
                    />
                </div>}
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
                                {selectedDelivery?.delivery_status === 'draft' &&
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
                                    </Popconfirm>}
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
                                {selectedDelivery?.delivery_status === 'draft' &&
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
                                    </Popconfirm>}
                            </div>
                        </div>}
                    </div>
                })}
            </div>

            <div className="mt-5">
                <div className="flex mb-3 items-center gap-2">
                    <h2 className="text-gray-600 font-bold text-lg">会议记录</h2>
                    <span className="text-gray-400 text-sm">（会议纪要会自动提交，因此<b>无需在交付材料中手动添加</b>）</span>
                </div>
                <MeetingRecordTable
                    classId={classId}
                    groupId={groupId}
                    taskId={task.id}
                />
            </div>

            {(
                selectedDelivery?.delivery_status === 'leader_review' &&
                isManager
            )
                &&
                <div className="mt-5">
                    <h2 className="text-gray-600 font-bold mb-3 text-lg">审核</h2>
                    <ProForm form={form} onFinish={async (values) => {
                        Modal.confirm({
                            title: '确认审核',
                            content: '确定审核吗？',
                            centered: true,
                            onOk: async () => {
                                try {
                                    if (approve === 'approved') {
                                        await taskApi.approveTaskDeliveryAudit(classId, groupId, task.id)
                                    } else {
                                        await taskApi.rejectTaskDeliveryAudit(classId, groupId, task.id, values.comment)
                                    }
                                    message.success('提交成功')
                                    setRefreshKey(`delivery-${Date.now()}`)
                                } catch (e) {
                                    message.error(e.message || '提交失败')
                                }
                            }
                        });
                    }} onReset={() => {
                        setApprove(null)
                    }}>
                        <ProFormRadio.Group
                            name="result"
                            label="审核结果"
                            required
                            options={[
                                { label: '通过', value: 'approved' },
                                { label: '拒绝', value: 'rejected' },
                            ]}
                            rules={[{ required: true, message: '请选择审核结果' }]}
                            onChange={e => setApprove(e.target.value)}
                        />
                        {approve === 'rejected' && <ProFormTextArea
                            name="comment"
                            label="拒绝理由"
                            placeholder="若拒绝，请填写拒绝理由"
                            required
                            rules={[{ required: true, message: '请填写拒绝理由' }]}
                        />}
                    </ProForm>
                </div>
            }

            <div className="mt-5 flex justify-start">
                {selectedDelivery?.delivery_status === 'draft' && <div className="flex gap-3 items-end">
                    <Button
                        onClick={async () => {
                            Modal.confirm({
                                title: '确认提交',
                                content: '提交后将无法修改，确定提交吗？',
                                centered: true,
                                onOk: async () => {
                                    try {
                                        await taskApi.submitTaskDeliveryDraft(classId, groupId, task.id)
                                        message.success('提交成功')
                                        setRefreshKey(`delivery-${Date.now()}`)
                                    } catch (e) {
                                        message.error(e.message || '提交失败')
                                    }
                                }
                            })
                        }}
                        type="primary"
                        icon={<ToTopOutlined />}
                        disabled={!isSubmitter}
                    >
                        提交
                    </Button>
                    {!isSubmitter && <div className="text-gray-400 text-sm mt-2">您不是交付者，无法提交</div>}
                </div>}
            </div>
        </div>
    </>
}