"use client";
import { Button, Modal, Tooltip } from "antd";
import { useRef, useState } from "react";
import { bytesToSize, timestampToTime } from '@/util/string';
import { renderFileIcon } from '@/util/file';
import { CloudSyncOutlined, DownloadOutlined } from '@ant-design/icons';
import { file } from "@/api";
import { message, Input } from "antd";
import { ProTable } from "@ant-design/pro-components";
import UploadButton from "@/components/upload_button";


export default function FileSelectPanel({ condition, onFileSelect, children }) {
    const [isFileSelectModalOpen, setIsFileSelectModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [downloading, setDownloading] = useState(false);
    const [kw, setKw] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const { Search } = Input;
    const actionRef = useRef();

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedFile(selectedRows);
        }
    };

    const FILE_COLUMNS = [
        {
            title: '文件名',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            render(text, record, _, action) {
                return <>
                    <Tooltip title={record.name}>
                        <div>
                            <div className="flex items-center gap-2 break-all break-words truncate">
                                <span className="text-lg">
                                    {renderFileIcon(record.name)}
                                </span>
                                <div>
                                    <span className="break-all break-words">
                                        {record.name}
                                    </span>
                                    <div className="text-xs text-gray-500 flex gap-3">
                                        <span className="min-w-20">
                                            大小 {bytesToSize(record.file_size)}
                                        </span>
                                        <span>
                                            修改于 {timestampToTime(record.modify_date * 1000)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Tooltip>
                </>
            }
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 80,
            align: "center",
            disable: true,
            render: (text, record, _, action) => {
                const action_list = [<Tooltip title={'下载'} key={'download'}>
                    <Button
                        type="link"
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
                </Tooltip>];

                if (record.file_type === 'document') {
                    action_list.push(
                        <Tooltip title={'在线编辑'} key={'edit'}>
                            <Button
                                type="link"
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
                return <>
                    <div className="flex gap-0 content-end justify-start">
                        {action_list}
                    </div>
                </>
            },
        },
    ];


    return <>
        {contextHolder}
        <Modal
            title="选择文件"
            centered
            okText={"选择" + (selectedFile.length > 0 ? `(${selectedFile.length})` : '')}
            maskClosable={false}
            closeIcon={false}
            open={isFileSelectModalOpen}
            onOk={() => {
                if (onFileSelect) {
                    onFileSelect(selectedFile);
                }
                setIsFileSelectModalOpen(false);
                setSelectedFile([]);
                setSelectedRowKeys([]);
            }}
            onCancel={() => {
                setIsFileSelectModalOpen(false);
                setSelectedFile([]);
                setSelectedRowKeys([]);
            }}
            width={800}
        >
            <div className="pt-5 pb-5">
                <div className="flex justify-between gap-3 mb-3">
                    <Search
                        placeholder="搜索文件"
                        onSearch={(value) => {
                            setKw(value.trim());
                            actionRef.current?.reload();
                        }}
                        style={{ width: 200 }}
                        allowClear
                    />
                    <UploadButton
                        onCancel={() => {}}
                        onUploaded={() => {
                            actionRef.current?.reload();
                        }}
                        uploadAs={(() => {
                            if (condition?.class_id) {
                                return {
                                    owner_type: 'clazz',
                                    owner_id: condition.class_id
                                }
                            }
                            if (condition?.user_id) {
                                return {
                                    owner_type: 'user',
                                    owner_id: condition.user_id
                                }
                            }
                            if (condition?.group_id) {
                                return {
                                    owner_type: 'group',
                                    owner_id: condition.group_id
                                }
                            }
                        })()}
                    />
                </div>
                <ProTable
                    scroll={{ y: 300 }}
                    columns={FILE_COLUMNS}
                    rowKey="id"
                    request={async (params) => {
                        params = {
                            ...params,
                            ...condition
                        }
                        if (kw.length > 0) {
                            params.kw = kw;
                        }
                        const data = await file.getFileList(params);
                        return {
                            data: data?.data || [],
                            total: data?.total || 0,
                            success: true,
                        };
                    }}
                    rowSelection={rowSelection}
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
                    actionRef={actionRef}
                />
            </div>
        </Modal>
        <div onClick={() => setIsFileSelectModalOpen(true)} className="w-fit">
            {children}
        </div>
    </>
}