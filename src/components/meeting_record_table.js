"use client"

import UserAvatar from "@/components/avatar";
import { Avatar, Button, Tag, Tooltip, message } from "antd";
import {
    CloudSyncOutlined,
    DownloadOutlined
} from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import { file, group } from "@/api";
import { timestampToTime } from "@/util/string";

export default function MeetingRecordTable({ classId, groupId, taskId }) {
    const [messageApi, contextHolder] = message.useMessage();
    const MEETING_COLUMNS = [
        {
            title: '搜索会议',
            dataIndex: 'kw',
            hideInTable: true,
            search: {
                transform: (value) => {
                    return {
                        kw: value,
                    };
                },
            },
        },
        {
            title: '会议主题',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            align: "center",
        },
        {
            title: '会议类型',
            dataIndex: 'meeting_type',
            width: 100,
            align: "center",
            editable: false,
            hideInSearch: true,
            renderText: (text, record, _, action) => {
                switch (text) {
                    case 'document_only':
                        return <Tag color="blue">文档会议</Tag>
                    case 'tencent_meeting':
                        return <Tag color="green">腾讯会议</Tag>
                    case 'zoom_meeting':
                        return <Tag color="purple">Zoom</Tag>
                    default:
                        return <Tag color="red">未知</Tag>
                }
            },
        },
        {
            title: '与会者',
            dataIndex: 'attendees',
            ellipsis: true,
            hideInSearch: true,
            width: 120,
            align: "center",
            editable: false,
            render: (text, record, _, action) => {
                return <Avatar.Group maxCount={5}>
                    {record.participants.map((attendee) => {
                        return <UserAvatar key={attendee.id} user={attendee} />
                    })}
                </Avatar.Group>
            },
        },
        {
            title: '会议时间',
            dataIndex: 'start_time',
            hideInSearch: true,
            width: 200,
            align: "center",
            editable: false,
            renderText: (text, record, _, action) => {
                const start = timestampToTime(record.start_time * 1000)
                const end = timestampToTime(record.end_time * 1000)
                return <div >
                    <div className="text-gray-500">从 {start}</div>
                    <div className="text-gray-500">至 {end}</div>
                </div>
            },
        },
        {
            title: '操作',
            dataIndex: 'summary',
            ellipsis: true,
            hideInSearch: true,
            width: 100,
            align: "center",
            editable: false,
            render: (text, record, _, action) => {
                return <div className="flex justify-center gap-2">
                    <Tooltip title={'查看会议纪要'} key={'edit'}>
                        <Button
                            shape="circle"
                            icon={<CloudSyncOutlined />}
                            onClick={() => {
                                messageApi.open({
                                    key: 'edit_file',
                                    type: 'loading',
                                    content: '加载中...'
                                })
                                file.getOnlineEditLink(record?.meeting_summary?.id).then((url) => {
                                    messageApi.open({
                                        key: 'edit_file',
                                        type: 'success',
                                        content: '请在新窗口中打开编辑'
                                    })
                                    if (url) {
                                        window.open(url)
                                    }
                                }).catch((e) => {
                                    messageApi.open({
                                        key: 'edit_file',
                                        type: 'error',
                                        content: e?.message || '获取编辑链接失败'
                                    })
                                })
                            }}
                        >
                        </Button>
                    </Tooltip>
                    <Tooltip title={'下载'} key={'download'}>
                        <Button
                            shape="circle"
                            icon={<DownloadOutlined />}
                            onClick={() => {
                                messageApi.open({
                                    key: 'download_file',
                                    type: 'loading',
                                    content: '加载中...'
                                })
                                file.downloadFile(record?.meeting_summary?.id).then((url) => {
                                    messageApi.open({
                                        key: 'download_file',
                                        type: 'success',
                                        content: '下载中...'
                                    })
                                    if (url) {
                                        window.open(url)
                                    }
                                }).catch((e) => {
                                    messageApi.open({
                                        key: 'download_file',
                                        type: 'error',
                                        content: e?.message || '下载失败'
                                    })
                                })
                            }}
                        >
                        </Button>
                    </Tooltip>
                </div>
            },
        },
    ];

    return <>
        {contextHolder}
        <ProTable
            scroll={{ y: 300 }}
            columns={MEETING_COLUMNS}
            rowKey="id"
            request={async (params, sort) => {
                params.task_id = taskId;
                const data = await group.getGroupMeetingList(
                    classId,
                    groupId,
                    params
                )
                return data;
            }}
            search={false}
            settings={false}
            actions={false}
            menu={false}
            options={false}
            pagination={{
                pageSize: 10,
            }}
            size="small"
            ghost={true}
        />


    </>
}