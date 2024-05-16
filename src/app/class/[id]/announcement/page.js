"use client"
import {Breadcrumb, Button, Modal, Popconfirm, Tag, Tooltip, message, Typography} from 'antd';
import {useEffect, useState, useRef, useCallback} from 'react';
import {ProForm, ProFormText, ProFormTextArea, ProTable} from '@ant-design/pro-components';
import {CLASS_MENU, getBreadcrumbItems} from '@/util/menu';
import {useRouter} from 'next-nprogress-bar';
import {ZoomInOutlined, EditOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import useSWR from 'swr';
import {getUser} from '@/store/session';
import {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncementList,
    setReadAnnouncement,
    updateAnnouncement
} from "@/api/announcement";
import UserAvatar from "@/components/avatar";
import FileSelectPanel from "@/components/file_select_panel";
import FileList from "@/components/file_list";
import Link from "next/link";

const {Title, Paragraph} = Typography;

export default function ClassAnnouncementList({params}) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();
    const [attachment, setAttachment] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [announcementId, setAnnouncementId] = useState(null);
    const [announcementData, setAnnouncementData] = useState({});
    const [activeKey, setActiveKey] = useState('unread');
    const actionRef = useRef();
    const {data: me} = useSWR('me', getUser);
    const {confirm} = Modal;
    const {id} = params;
    const [form] = ProForm.useForm();

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, id));
    }, [router, id]);

    const ANNOUNCEMENT_COLUMNS = [
        {
            title: '公告标题',
            dataIndex: 'title',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            render: (text, record) => (
                <>
                    {record.read === false && <Tag color="red">未读</Tag>}
                    <a
                        className={"text-blue-500 hover:underline"}
                        href="#"
                        onClick={() => {
                            setAnnouncementData(record);
                            setIsViewModalOpen(true);
                        }}>
                        {record?.title}
                    </a>
                </>
            )
        },
        {
            title: '发布人',
            dataIndex: 'publisher',
            ellipsis: true,
            hideInSearch: true,
            width: 150,
            disable: true,
            render: (text, record) => {
                let publisher = record.publisher_user;

                return (
                    <div className='flex items-center'>
                        <UserAvatar user={publisher}/>
                        <div className='flex flex-col'>
                            <span className='ml-2'>{publisher?.name}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            title: '发布时间',
            dataIndex: 'publish_time',
            ellipsis: true,
            hideInSearch: true,
            width: 200,
            align: "center",
            editable: false,
            renderText: (text) => {
                return new Date(text * 1000).toLocaleString();
            },
            sorter: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 120,
            align: "center",
            disable: true,
            render: (text, record) => (
                me?.user_type !== 'student' && (
                    <div className="flex gap-2 content-end justify-end">
                        <Tooltip title={'编辑公告'} key={'edit'}>
                            <Button
                                icon={<EditOutlined/>}
                                type={"text"}
                                onClick={() => {
                                    setAnnouncementId(record.id);
                                    form.setFieldValue('title', record.title);
                                    form.setFieldValue('content', record.content);
                                    setAttachment(record.attachment || []);
                                    setIsModalOpen(true);
                                }}
                                disabled={me?.user_type === 'student'}
                            >
                            </Button>
                        </Tooltip>
                        <Popconfirm
                            placement="left"
                            key={'delete'}
                            title="确定删除这个公告吗?"
                            onConfirm={async () => {
                                messageApi.open({
                                    key: 'delete_announcement',
                                    type: 'loading',
                                    content: '正在删除...'
                                });
                                try {
                                    await deleteAnnouncement(record.id);
                                    messageApi.open({
                                        key: 'delete_announcement',
                                        type: 'success',
                                        content: '删除成功'
                                    });
                                    actionRef.current.reload();
                                } catch (e) {
                                    messageApi.open({
                                        key: 'delete_announcement',
                                        type: 'error',
                                        content: e?.message || '删除失败'
                                    });
                                }
                            }}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Tooltip title={'删除'}>
                                <Button
                                    icon={<DeleteOutlined/>}
                                    type={"text"}
                                    danger
                                    disabled={me?.user_type === 'student'}
                                >
                                </Button>
                            </Tooltip>
                        </Popconfirm>
                    </div>
                )
            ),
        },
    ];

    const onFinish = async (data) => {
        data.attachments = attachment.map(file => file.id);

        if (announcementId) {
            await updateAnnouncement(announcementId, data);
        } else {
            await createAnnouncement(Number(id), data);
        }
        setIsModalOpen(false);
        actionRef.current.reload();
    };

    const resetForm = useCallback(() => {
        form.resetFields();
        setAttachment([]);
    }, [form]);

    useEffect(() => {
        if (!isModalOpen) {
            resetForm();
        }
    }, [isModalOpen, resetForm]);

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb}/>
            <h1 className={"text-2xl font-bold mt-2"}>班级公告</h1>
            {contextHolder}

            <Modal
                title={announcementId ? '编辑公告' : '新建公告'}
                centered
                open={isModalOpen}
                onOk={form.submit}
                onCancel={() => {
                    form.resetFields();
                    setIsModalOpen(false);
                }}
            >
                <ProForm
                    form={form}
                    onFinish={onFinish}
                    initialValues={{title: '', content: ''}}
                    submitter={false}
                >
                    <ProFormText
                        name="title"
                        label="公告标题"
                        placeholder="请输入公告标题"
                        rules={[{required: true, message: '请输入公告标题'}]}
                    />
                    <ProFormTextArea
                        name="content"
                        label="公告内容"
                        placeholder="请输入公告内容"
                        rules={[{required: true, message: '请输入公告内容'}]}
                        fieldProps={{
                            rows: 5
                        }}
                    />
                    <ProForm.Item
                        label="附件"
                        name="attached_files"
                        tooltip="公告的附件，支持上传文件，上传的附件将保存至班级空间。"
                    >
                        <div className="flex flex-col gap-2">
                            <FileSelectPanel condition={{
                                class_id: params.id,
                            }} onFileSelect={(files) => {
                                setAttachment((prev) => {
                                    const newAttachment = prev.slice();
                                    for (const file of files) {
                                        if (!prev.find((item) => item.id === file.id)) {
                                            newAttachment.push(file);
                                        }
                                    }
                                    return newAttachment;
                                });
                            }}>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined/>}
                                >
                                    添加附件
                                </Button>
                            </FileSelectPanel>
                            <FileList files={attachment} onChange={(files) => {
                                setAttachment(files);
                            }}/>
                        </div>
                    </ProForm.Item>
                </ProForm>
            </Modal>

            <Modal
                title={announcementData?.title}
                centered
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalOpen(false)}>
                        关闭
                    </Button>,
                    announcementData.read === false && <Button key="mark_as_read" type="primary" onClick={async () => {
                        await setReadAnnouncement(announcementData.id);
                        actionRef.current.reload();
                        setIsViewModalOpen(false);
                    }
                    }>
                        标记为已读
                    </Button>
                ]}
            >
                <div className="bg-white mt-3 rounded-lg mb-5">
                    <Paragraph className="text-base text-gray-600 mb-4">{announcementData.content}</Paragraph>
                </div>
                {announcementData?.attachment?.length > 0 && (
                    <>
                        <h4 className="text-base font-semibold mb-2 text-gray-600">附件</h4>
                        <FileList files={announcementData?.attachment || []} disabled/>
                    </>
                )}
            </Modal>

            <ProTable
                className="mt-5"
                columns={ANNOUNCEMENT_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    const response = await getAnnouncementList(params, sort, filter);
                    return {
                        data: response.data.filter(announcement => {
                            if (activeKey === 'unread') {
                                return !announcement.read;
                            } else if (activeKey === 'read') {
                                return announcement.read;
                            }
                            return true;
                        }),
                        success: true
                    };
                }}
                editable={false}
                actionRef={actionRef}
                columnsState={{
                    persistenceKey: 'scs:class:announcement-list-table',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: {fixed: 'right', disable: true},
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
                    pageSize: 10,
                }}
                toolbar={{
                    menu: {
                        type: 'tab',
                        activeKey: activeKey,
                        items: [
                            // {
                            //     key: 'all',
                            //     label: '全部公告',
                            // },
                            {
                                key: 'unread',
                                label: '未读公告',
                            },
                            {
                                key: 'read',
                                label: '已读公告',
                            }
                        ],
                        onChange: (key) => {
                            setActiveKey(key);
                            actionRef.current.reload();
                        },
                    },
                }}
                dateFormatter="string"
                toolBarRender={() => me?.user_type === 'student' || [
                    <Button
                        key="add"
                        type="primary"
                        onClick={() => {
                            setAnnouncementId(null);
                            setIsModalOpen(true);
                        }}
                        disabled={me?.user_type === 'student'}
                        icon={<EditOutlined/>}
                    >
                        新建公告
                    </Button>
                ]}
            />
        </div>
    );
}
