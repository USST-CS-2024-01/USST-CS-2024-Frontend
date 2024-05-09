"use client"
import { group, file } from "@/api";
import useSWR from "swr";
import { Avatar, Button, Modal, Popconfirm, Tag, Tooltip, message } from 'antd';
import { ProForm, ProFormDateTimeRangePicker, ProFormSelect, ProFormText, ProTable } from "@ant-design/pro-components";
import UserAvatar from "@/components/avatar";
import {
    CloudSyncOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useEffect, useRef, useState } from "react";
import { timestampToTime } from "@/util/string";

export default function GroupMeetingPage({ params }) {
    const { id, groupId } = params;
    const { data: meMember } = useSWR('me-group-meeting', () => group.getMyGroupMember(id))
    const [messageApi, contextHolder] = message.useMessage();
    const [meeting, setMeeting] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form] = ProForm.useForm()

    const actionRef = useRef();

    useEffect(() => {
        if (!meeting) {
            form.resetFields();
            return;
        }

        form.setFieldsValue({
            ...meeting,
            time: [meeting.start_time * 1000, meeting.end_time * 1000]
        })
    }, [meeting, form])

    const closeModal = () => {
        setIsModalOpen(false)
        setMeeting(null)
    }

    const onFinish = async (values) => {
        const updateForm = {
            name: values.name,
            meeting_type: values.meeting_type,
            meeting_link: values.meeting_link,
            start_time: Math.floor(new Date(values.time[0]).getTime() / 1000),
            end_time: Math.floor(new Date(values.time[1]).getTime() / 1000)
        }

        if (!values.meeting_link) {
            delete updateForm.meeting_link
        }

        if (meeting) {
            messageApi.open({
                key: 'update_meeting',
                type: 'loading',
                content: '正在更新...'
            })

            try {
                await group.updateGroupMeeting(id, groupId, meeting.id, updateForm)
                messageApi.open({
                    key: 'update_meeting',
                    type: 'success',
                    content: '更新成功'
                })
                actionRef.current.reload()
                closeModal()
            } catch (e) {
                messageApi.open({
                    key: 'update_meeting',
                    type: 'error',
                    content: e?.message || '更新失败'
                })
            }
        } else {
            messageApi.open({
                key: 'create_meeting',
                type: 'loading',
                content: '正在创建...'
            })

            try {
                await group.createGroupMeeting(id, groupId, updateForm)
                messageApi.open({
                    key: 'create_meeting',
                    type: 'success',
                    content: '创建成功'
                })
                actionRef.current.reload()
                closeModal()
            } catch (e) {
                messageApi.open({
                    key: 'create_meeting',
                    type: 'error',
                    content: e?.message || '创建失败'
                })
            }
        }
    }

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
            render(text, record, _, action) {
                return <div className="flex gap-1 items-center">
                    {record.start_time > Date.now() / 1000 && <Tag color="green">未开始</Tag>}
                    {record.start_time < Date.now() / 1000 && record.end_time < Date.now() / 1000 && <Tag color="red">已结束</Tag>}
                    {record.start_time < Date.now() / 1000 && record.end_time > Date.now() / 1000 && <Tag color="blue">进行中</Tag>}
                    <span>{record.name}</span>
                </div>
            }
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
            title: '会议纪要',
            dataIndex: 'summary',
            ellipsis: true,
            hideInSearch: true,
            width: 100,
            align: "center",
            editable: false,
            render: (text, record, _, action) => {
                return <Tooltip title={'编辑会议纪要'} key={'edit'}>
                    <Button
                        type='primary'
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
            valueType: 'option',
            key: 'option',
            width: 180,
            align: "center",
            disable: true,
            render: (text, record, _, action) => {
                const action_list = []

                if (record.start_time < Date.now() / 1000 && Date.now() / 1000 < record.end_time) {
                    action_list.push(<Button
                        key={'attend'}
                        type="link"
                        onClick={async () => {
                            messageApi.open({
                                key: 'attend',
                                type: 'loading',
                                content: '正在加入会议...'
                            })

                            try {
                                await group.attendGroupMeeting(id, groupId, record.id)
                                messageApi.open({
                                    key: 'attend',
                                    type: 'success',
                                    content: '加入会议成功'
                                })
                                action.reload()

                                if (record?.meeting_link) {
                                    window.open(record?.meeting_link)
                                } else {
                                    file.getOnlineEditLink(record?.meeting_summary?.id).then((url) => {
                                        if (url) {
                                            window.open(url)
                                        }
                                    })
                                }
                            } catch (e) {
                                messageApi.open({
                                    key: 'attend',
                                    type: 'error',
                                    content: e?.message || '加入会议失败'
                                })
                            }
                        }}
                        size="small"
                    >
                        进入会议
                    </Button>);
                }
                action_list.push(
                    ...[
                        <Button
                            key={'edit'}
                            type="link"
                            size="small"
                            onClick={() => {
                                setMeeting(record)
                                setIsModalOpen(true)
                            }}
                        >
                            编辑
                        </Button>,
                        <Popconfirm
                            placement="left"
                            key={'delete'}
                            title="确定取消会议吗?"
                            onConfirm={async () => {
                                messageApi.open({
                                    key: 'delete_file',
                                    type: 'loading',
                                    content: '正在取消...'
                                })
                                try {
                                    await group.deleteGroupMeeting(id, groupId, record.id)
                                    messageApi.open({
                                        key: 'delete_file',
                                        type: 'success',
                                        content: '取消成功'
                                    })
                                    action.reload()
                                } catch (e) {
                                    messageApi.open({
                                        key: 'delete_file',
                                        type: 'error',
                                        content: e?.message || '取消失败'
                                    })
                                }
                            }}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button
                                type="link"
                                danger
                                size="small"
                            >
                                取消
                            </Button>
                        </Popconfirm>
                    ]
                );

                return <>
                    <div className="flex content-end justify-start">
                        {action_list}
                    </div>
                </>
            },
        },
    ];


    return <>
        {contextHolder}
        <Modal
            open={isModalOpen}
            title={'预定会议'}
            onCancel={closeModal}
            footer={null}
            centered
            maskClosable={false}
        >
            <ProForm
                form={form}
                onFinish={onFinish}
            >
                <ProFormText
                    name="name"
                    label="会议主题"
                    placeholder="请输入会议主题"
                    required
                    rules={[{ required: true, message: '请输入会议主题' }, { max: 50, message: '会议主题不能超过50个字符' }]}
                />
                <ProFormSelect
                    name="meeting_type"
                    label="会议类型"
                    placeholder="请选择会议类型"
                    required
                    options={[
                        { label: '文档会议', value: 'document_only' },
                        { label: '腾讯会议', value: 'tencent_meeting' },
                        { label: 'Zoom', value: 'zoom_meeting' },
                        { label: '其他', value: 'other' }
                    ]}
                    rules={[{ required: true, message: '请选择会议类型' }]}
                />
                <ProFormText
                    name="meeting_link"
                    label="会议链接"
                    placeholder="请输入会议链接"
                    rules={[{ max: 500, message: '会议链接不能超过500个字符' }]}
                />
                <ProFormDateTimeRangePicker
                    name="time"
                    label="会议时间"
                    placeholder="请设置会议时间"
                    required
                    rules={[{ required: true, message: '请选择会议时间' }]}
                />
            </ProForm>
        </Modal>


        <div className="p-5">
            <ProTable
                className="mt-5"
                columns={MEETING_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    return await group.getGroupMeetingList(id, groupId, params)
                }}
                editable={false}
                actionRef={actionRef}
                columnsState={{
                    persistenceKey: 'scs:class:group:meeting-table',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: { fixed: 'right', disable: true },
                    },
                    onChange(value) {
                        console.log('value: ', value);
                    },
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                dateFormatter="string"
                toolBarRender={() => [
                    <Button
                        key="upload"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setMeeting(null)
                            setIsModalOpen(true)
                        }}
                    >
                        预定会议
                    </Button>
                ]}
            />
        </div>
    </>
}