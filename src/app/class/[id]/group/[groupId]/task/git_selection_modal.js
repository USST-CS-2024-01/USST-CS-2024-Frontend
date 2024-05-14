"use client"

import { Button, Input, Modal, Tooltip, message } from "antd"
import { act, useRef, useState } from "react"
import {
    LinkOutlined,
    DownloadOutlined,
    DeleteOutlined,
    PlusOutlined,
    ReloadOutlined,
    BarChartOutlined
} from "@ant-design/icons"
import { ProTable } from "@ant-design/pro-components"
import { repo_record } from "@/api"
import Link from "next/link"
import GitStatModal from "./git_stat_modal"

export default function GitSelectionModal({ classId, groupId, onSelect, children }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedRepo, setSelectedRepo] = useState([])
    const [newRepoUrl, setNewRepoUrl] = useState('')
    const [messageApi, contextHolder] = message.useMessage();

    const actionRef = useRef();

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRepo(selectedRows);
        },
        type: 'radio',
    };

    const createRepoRecord = async () => {
        if (!newRepoUrl) {
            messageApi.error('请输入仓库地址')
            return
        }

        if (!newRepoUrl.startsWith('http') && !newRepoUrl.startsWith('git@')) {
            messageApi.error('仓库地址格式错误')
            return
        }

        try {
            const data = await repo_record.createRepoRecord(classId, groupId, {
                repo_url: newRepoUrl
            })
            messageApi.success('创建成功')
            actionRef.current.reload()
            setNewRepoUrl('')
        } catch (e) {
            messageApi.error(e?.message || '创建失败')
        }
    }

    const GIT_COLUMNS = [
        {
            title: 'Git 仓库',
            dataIndex: 'repo_url',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            render(text, record, _, action) {
                return <>
                    <Tooltip title={record.repo_url}>
                        <div>
                            {record.repo_url.split('/').pop()}
                            {record.repo_url.startsWith('http') &&
                                <a
                                    href={record.repo_url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="ml-1"
                                >
                                    <LinkOutlined />
                                </a>
                            }
                        </div>
                    </Tooltip>

                </>
            }
        },
        {
            title: '分析状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                'pending': { text: '队列中', status: 'Processing' },
                'completed': { text: '已完成', status: 'Success' },
                'failed': { text: '分析失败', status: 'Error' },
            },
            width: 120,
        },
        {
            title: '创建时间',
            dataIndex: 'create_time',
            valueType: 'dateTime',
            width: 180,
            hideInSearch: true,
            renderText: (text, record) => {
                return record.create_time * 1000
            }
        },
        {
            title: '分析时间',
            dataIndex: 'stat_time',
            valueType: 'dateTime',
            width: 180,
            hideInSearch: true,
            renderText: (text, record) => {
                return record.stat_time * 1000
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
                const action_list = [
                ];

                if (record.status === 'completed') {
                    action_list.unshift(<Tooltip title={'归档下载'} key={'download'}>
                        <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() => {
                                messageApi.open({
                                    key: 'download_file',
                                    type: 'loading',
                                    content: '加载中...'
                                })
                                repo_record.downloadRepoRecordArchive(
                                    classId,
                                    groupId,
                                    record?.id
                                ).then((url) => {
                                    messageApi.open({
                                        key: 'download_file',
                                        type: 'success',
                                        content: '已开始下载'
                                    })
                                    if (url) {
                                        window.open(url)
                                    }
                                }).catch((e) => {
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
                        <>
                            {record && <GitStatModal
                                record={record}
                            >
                                <Tooltip title={'查看统计'} key={'view'}>
                                    <Button
                                        type="link"
                                        icon={<BarChartOutlined />}
                                    />

                                </Tooltip>
                            </GitStatModal>}
                        </>
                    )
                }

                if (record.status !== 'completed') {
                    action_list.push(<Tooltip title={'删除'} key={'delete'}>
                        <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                                Modal.confirm({
                                    title: '删除 Git 仓库统计记录',
                                    content: '确定删除该 Git 仓库统计记录吗？',
                                    centered: true,
                                    onOk: async () => {
                                        try {
                                            await repo_record.deleteRepoRecord(
                                                classId,
                                                groupId,
                                                record?.id
                                            )
                                            messageApi.success('删除成功')
                                            actionRef.current.reload()
                                        } catch (e) {
                                            messageApi.error(e?.message || '删除失败')
                                        }
                                    }
                                })
                            }}
                        >
                        </Button>
                    </Tooltip>)
                }

                return <>
                    <div className="flex gap-0 content-end justify-end">
                        {action_list}
                    </div>
                </>
            },
        },
    ];


    return <>
        {contextHolder}
        <div onClick={(e) => {
            e.stopPropagation()
            setIsModalOpen(true)
        }}>
            {children}
        </div>

        <Modal
            centered
            open={isModalOpen}
            onCancel={() => {
                setIsModalOpen(false)
                setSelectedRowKeys([])
                setSelectedRepo([])
            }}
            title="选择 Git 仓库"
            footer={null}
            width={800}
        >
            <div className="text-gray-500 text-sm mb-4 mt-4">
                创建仓库统计记录前，请务必阅读
                <Link
                    href="https://docs.icode9.com/docs/icode9/faq/git-statistics"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-500"
                >
                    帮助文档
                </Link>
                ，以确保您的仓库邀请了正确的 Git 账号或开放了公开访问权限，否则可能导致分析失败。
            </div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center flex-1">
                    <div
                        className="mr-2"
                    >仓库地址：</div>
                    <Input
                        placeholder="输入仓库地址以新建 Git 仓库统计记录"
                        style={{ width: 300 }}
                        value={newRepoUrl}
                        onChange={(e) => setNewRepoUrl(e.target.value)}
                    />
                    <Button
                        className="ml-2"
                        icon={<PlusOutlined />}
                        onClick={createRepoRecord}
                    >新建</Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="dashed"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            actionRef.current.reload();
                        }}
                    >
                        刷新
                    </Button>
                </div>
            </div>
            <ProTable
                scroll={{ y: 300 }}
                columns={GIT_COLUMNS}
                rowKey="id"
                request={async (params, sort) => {
                    const data = await repo_record.getRepoRecordList(
                        classId,
                        groupId,
                        params,
                        sort
                    );
                    return data;
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

            <div className="mt-4 flex justify-end">
                <Button 
                    type="primary"
                    onClick={() => {
                        onSelect(selectedRepo[0])
                        setIsModalOpen(false)
                        setSelectedRowKeys([])
                        setSelectedRepo([])
                    }}
                    disabled={selectedRepo.length === 0}
                >
                    选择 ( {selectedRepo.length} / 1 个)
                </Button>
            </div>
        </Modal>
    </>
}