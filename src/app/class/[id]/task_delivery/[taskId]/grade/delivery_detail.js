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
import GitStatModal from "@/components/git_stat_modal";
import { ProForm, ProFormCheckbox, ProFormDigit, ProFormRadio, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import MeetingRecordTable from "@/components/meeting_record_table";
import { comment } from "postcss";


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


export default function DeliveryDetail({ classId, groupId, delivery, task, taskId, onRefresh }) {
    const [deliveryItemList, setDeliveryItemList] = useState([])
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = ProForm.useForm();
    const [approve, setApprove] = useState(null)

    useEffect(() => {
        if (!delivery) return
        setDeliveryItemList(delivery?.delivery_items)
        setApprove(null);

        if (delivery.delivery_status === 'teacher_rejected') {
            form.setFieldsValue({
                comment: delivery.delivery_comments,
                score: null,
                result: 'rejected'
            })
            setApprove('rejected')
        }

        if (delivery.delivery_status === 'teacher_approved') {
            form.setFieldsValue({
                comment: "",
                score: delivery.task_grade_percentage,
                result: 'approved'
            })
            setApprove('approved')
        }

    }, [delivery, form])


    return <>
        {contextHolder}

        {(delivery?.delivery_status === 'leader_rejected' ||
            delivery?.delivery_status === 'teacher_rejected') &&
            <div className="p-5 pb-0">
                <div className="mt-5 border bg-red-50 rounded-md">
                    <h3 className="text-red-600 font-bold p-3 pb-0 text-base">驳回原因</h3>
                    <div className="p-3 text-red-600 pb-3">
                        {delivery?.delivery_comments}
                    </div>
                </div>
            </div>
        }

        <div className="px-5 pt-10">
            <Steps
                current={STAGE_MAP[delivery?.delivery_status]}
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
                    delivery?.delivery_status === 'leader_rejected' ||
                        delivery?.delivery_status === 'teacher_rejected' ?
                        'error' :
                        delivery?.delivery_status === 'teacher_approved' ?
                            'finish' : 'process'
                }
            />

            <div className="flex justify-between items-center mt-8">
                <h2 className="text-gray-600 font-bold text-lg">交付材料</h2>
                <div className="flex gap-3 items-center">
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => {
                            // TODO 批量下载
                        }}
                        type="dashed"
                    >
                        下载全部
                    </Button>
                </div>
            </div>
            <div className="mt-5 border border-gray-200 rounded-md">
                {(deliveryItemList?.length === 0 || !deliveryItemList) && <div className="py-5">
                    <Empty
                        description="无交付物"
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
                            </div>
                        </div>}
                    </div>
                })}
            </div>

            <div className="mt-5">
                <div className="flex mb-3 items-center gap-2">
                    <h2 className="text-gray-600 font-bold text-lg">会议记录</h2>
                </div>
                <MeetingRecordTable
                    classId={classId}
                    groupId={groupId}
                    taskId={taskId}
                />
            </div>

            {
                (
                    delivery?.delivery_status === 'teacher_review' ||
                    delivery?.delivery_status === 'leader_review' ||
                    delivery?.delivery_status === 'teacher_approved'
                )
                && <div className="mt-5">
                    <h2 className="text-gray-600 font-bold mb-3 text-lg">审核</h2>

                    {delivery?.delivery_status === 'teacher_approved' && <div className="mb-3">
                        <Alert
                            message="您已通过对该交付的审核，但可对其驳回。若驳回，该交付将无法再次修改，需重新提交交付，同时，需要重新为学生评分。"
                            type="info"
                            showIcon />
                    </div>
                    }

                    <ProForm form={form} onFinish={async (values) => {
                        Modal.confirm({
                            title: '确认审核',
                            content: '确定审核吗？',
                            centered: true,
                            onOk: async () => {
                                try {
                                    if (approve === 'approved') {
                                        await taskApi.approveTaskDeliveryAudit(classId, groupId, taskId, values?.score)
                                    } else {
                                        await taskApi.rejectTaskDeliveryAudit(classId, groupId, taskId, values.comment)
                                    }
                                    message.success('提交成功')
                                    onRefresh && onRefresh()
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
                        {approve === 'approved' && <ProFormDigit
                            name="score"
                            label="评分"
                            placeholder="请输入评分, 0-100"
                            required
                            rules={[{ required: true, message: '请输入评分' }]}
                            min={0}
                            max={100}
                            fieldProps={{ precision: 2 }}
                        />}
                        {approve === 'rejected' && <ProFormTextArea
                            name="comment"
                            label="拒绝理由"
                            placeholder="若拒绝，请填写拒绝理由"
                            required
                            rules={[{ required: true, message: '请填写拒绝理由' }]}
                        />}
                    </ProForm>
                </div>}
        </div>
    </>
}