"use client"
import { Breadcrumb, Button, Dropdown, Input, Modal, Popconfirm, Spin, Tag, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { ProForm, ProFormText, ProTable } from '@ant-design/pro-components';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next/navigation';
import { file, user } from '@/api/index';
import { message } from 'antd';
import { bytesToSize } from '@/util/string';
import { renderFileIcon } from '@/util/file';
import {
    DownloadOutlined,
    EditOutlined,
    DeleteOutlined,
    CloudSyncOutlined,
    PlusOutlined,
    UploadOutlined,
    FileOutlined
} from '@ant-design/icons';

export default function FileList() {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [me, setMe] = useState({});
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = ProForm.useForm();
    const [downloading, setDownloading] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileId, setFileId] = useState(null);
    const [fileNewName, setFileNewName] = useState(null);

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    const uploadActions = [
        {
            label: '上传文件',
            key: 'upload_file',
            icon: <UploadOutlined />,
            onClick: () => {
                // TODO
                console.log('upload_file')
            }
        },
        {
            label: '创建空白文件',
            key: 'create_file',
            icon: <FileOutlined />,
            onClick: () => {
                // TODO
                console.log('create_file')
            }
        }
    ]

    const FILE_COLUMNS = [
        {
            title: '搜索文件',
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
            title: '文件名',
            dataIndex: 'name',
            ellipsis: true,
            sorter: true,
            hideInSearch: true,
            disable: true,
            render(text, record, _, action) {
                return <>
                    <Tooltip title={record.name}>
                        <div className="flex items-center gap-1 break-all break-words truncate">
                            <span className="text-lg">
                                {renderFileIcon(record.name)}
                            </span>
                            <span className="break-all break-words">
                                {record.name}
                            </span>
                        </div>
                    </Tooltip>
                </>
            }
        },
        {
            title: '类型',
            dataIndex: 'file_type',
            valueType: 'select',
            valueEnum: {
                document: {
                    text: '文档',
                },
                other: {
                    text: '其他',
                },
            },
            width: 80,
            align: "center",
            sorter: true,
            editable: false,
            renderText: (text, record, _, action) => {
                switch (text) {
                    case 'document':
                        return <Tag color='blue'>文档</Tag>;
                    default:
                        return <Tag color='default'>其他</Tag>;
                }
            }
        },
        {
            title: '大小',
            dataIndex: 'file_size',
            ellipsis: true,
            hideInSearch: true,
            width: 80,
            align: "center",
            editable: false,
            renderText: (text, record, _, action) => {
                return bytesToSize(text)
            },
            sorter: true,
        }, 
        {
            title: '最近修改',
            dataIndex: 'modify_date',
            ellipsis: true,
            hideInSearch: true,
            width: 200,
            align: "center",
            editable: false,
            renderText: (text, record, _, action) => {
                return new Date(text * 1000).toLocaleString()
            },
            sorter: true,
        },
        {
            title: '上传时间',
            dataIndex: 'create_date',
            ellipsis: true,
            hideInSearch: true,
            width: 200,
            align: "center",
            editable: false,
            renderText: (text, record, _, action) => {
                return new Date(text * 1000).toLocaleString()
            },
            sorter: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 180,
            align: "center",
            disable: true,
            render: (text, record, _, action) => {
                const action_list = [
                ]

                if (record.file_type === 'document') {
                    action_list.push(
                        <Tooltip title={'在线编辑'} key={'edit'}>
                            <Button
                                type='primary'
                                shape="circle"
                                icon={<CloudSyncOutlined />}
                                onClick={() => {
                                    if (downloading) {
                                        return
                                    }

                                    messageApi.open({
                                        key: 'edit_file',
                                        type: 'loading',
                                        content: '加载中...'
                                    })
                                    file.getOnlineEditLink(record.id).then((url) => {
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
                    )
                }

                action_list.push(
                    ...[<Tooltip title={'重命名'} key={'rema,e'}>
                        <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setFileId(record.id)
                                setFileNewName(record.name)
                                setIsModalOpen(true)
                            }}
                        >
                        </Button>
                    </Tooltip>,
                    <Tooltip title={'下载'} key={'download'}>
                        <Button
                            shape="circle"
                            icon={<DownloadOutlined />}
                            onClick={() => {
                                if (downloading) {
                                    return
                                }

                                setDownloading(true)
                                messageApi.open({
                                    key: 'download_file',
                                    type: 'loading',
                                    content: '加载中...'
                                })
                                file.downloadFile(record.id).then((url) => {
                                    setDownloading(false)
                                    messageApi.open({
                                        key: 'download_file',
                                        type: 'success',
                                        content: '已开始下载'
                                    })
                                    if (url) {
                                        window.open(url)
                                    }
                                }).catch((e) => {
                                    setDownloading(false)
                                    messageApi.open({
                                        key: 'download_file',
                                        type: 'error',
                                        content: e?.message || '获取下载链接失败'
                                    })
                                })
                            }}
                        >
                        </Button>
                    </Tooltip>,
                    <Popconfirm
                        key={'delete'}
                        title="确定删除这个文件吗?"
                        onConfirm={async () => {
                            messageApi.open({
                                key: 'delete_file',
                                type: 'loading',
                                content: '正在删除...'
                            })
                            try {
                                await file.deleteFile(record.id)
                                messageApi.open({
                                    key: 'delete_file',
                                    type: 'success',
                                    content: '删除成功'
                                })
                                action.reload()
                            } catch (e) {
                                messageApi.open({
                                    key: 'delete_file',
                                    type: 'error',
                                    content: e?.message || '删除失败'
                                })
                            }
                        }}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title={'删除'}>
                            <Button
                                shape="circle"
                                icon={<DeleteOutlined />}
                                danger
                            >
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                    ]
                );

                return <>
                    <div className="flex gap-2 content-end justify-end">
                        {action_list}
                    </div>
                </>
            },
        },
    ];

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb} />
            <h1 className={"text-2xl font-bold mt-2"}>我的文件</h1>
            {contextHolder}

            <Modal
                title="文件重命名"
                open={isModalOpen}
                onOk={async () => {
                    if (renaming) {
                        return
                    }

                    if (fileNewName.trim() === '') {
                        messageApi.open({
                            key: 'rename_file',
                            type: 'error',
                            content: '文件名不能为空'
                        })
                        return
                    }

                    setRenaming(true)
                    messageApi.open({
                        key: 'rename_file',
                        type: 'loading',
                        content: '正在重命名...'
                    })
                    try {
                        await file.updateFile(fileId, {
                            file_name: fileNewName.trim()
                        })
                        messageApi.open({
                            key: 'rename_file',
                            type: 'success',
                            content: '重命名成功'
                        })
                        setIsModalOpen(false)

                    } catch (e) {
                        messageApi.open({
                            key: 'rename_file',
                            type: 'error',
                            content: e?.message || '重命名失败'
                        })
                    }
                    setRenaming(false)
                }}
                onCancel={() => setIsModalOpen(false)}
            >
                <Input value={fileNewName} onChange={(e) => setFileNewName(e.target.value)} />
            </Modal>

            <ProTable
                className="mt-5"
                columns={FILE_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    let me_id = me?.id
                    if (!me_id) {
                        const data = await user.getMeUser();
                        setMe(data);
                        me_id = data.id
                    }
                    params.user_id = me_id;
                    return await file.getFileList(params, sort, filter);
                }}
                editable={false}
                columnsState={{
                    persistenceKey: 'scs:manage:file-list-table',
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
                pagination={{
                    pageSize: 20,
                }}
                dateFormatter="string"
                toolBarRender={() => [
                    <Dropdown menu={{ items: uploadActions }} trigger={['click']} key={"upload"}>
                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                        >
                            新增文件
                        </Button>
                    </Dropdown>
                ]}
            />
        </div>
    )
}