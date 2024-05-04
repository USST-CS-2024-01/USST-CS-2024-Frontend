"use client"
import { ProTable } from "@ant-design/pro-components"
import { Avatar, Button, Modal, Tooltip, message } from "antd"
import { useRef, useState } from "react"
import { clazz } from "@/api"
import {
    ImportOutlined,
    ExclamationCircleFilled
} from '@ant-design/icons';
import UserAvatar, { getColor } from "@/components/avatar"
import ImportModal from "./import_modal"
import { getUser } from "@/store/session"
import useSWR from "swr"

export default function StudentList({ id }) {
    const actionRef = useRef();
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const { data: me } = useSWR('me', getUser)
    const { confirm } = Modal;

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
        }
    };

    const USER_COLUMNS = [
        {
            title: '成员ID',
            dataIndex: 'id',
            ellipsis: true,
            disable: true,
            hideInSearch: true,
            width: 80,
            align: 'center'
        },
        {
            title: '学生',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            render: (text, record) => {
                record = record?.user
                return <div className='flex items-center'>
                    <UserAvatar user={record} />
                    <div className='flex flex-col'>
                        <span className='ml-2'>{record?.name}（UID：{record?.id}）</span>
                        <span className='ml-2 text-xs text-gray-500'>{record?.employee_id}</span>
                    </div>
                </div>
            }
        },
        {
            title: '组队状态',
            dataIndex: 'status',
            ellipsis: true,
            hideInSearch: true,
            valueType: 'select',
            width: 120,
            align: 'center',
            valueEnum: {
                approved: {
                    text: '已组队',
                    status: 'Success'
                },
                leader_review: {
                    text: '待队长同意',
                    status: 'Processing'
                },
                member_review: {
                    text: '待同意邀请',
                    status: 'Processing'
                },
                undefined: {
                    text: '未组队',
                    status: 'Default'
                },
            }
        },
        {
            title: 'Git账号',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            width: 100,
            render: (text, record, _, action) => {
                const usernames = record?.repo_usernames;

                return <div className='flex items-center'>
                    <Avatar.Group maxCount={2}>
                        {
                            usernames?.map((username, index) => (
                                <Tooltip title={username} key={index}>
                                    <Avatar key={index} size={32} style={{ backgroundColor: getColor(username) }}>
                                        {username[0].toUpperCase()}
                                    </Avatar>
                                </Tooltip>
                            ))
                        }
                    </Avatar.Group>
                </div>
            }
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            align: 'center',
            width: 80,
            render: (text, record, _, action) => {
                return <div className='flex justify-center'>
                    <Button
                        type="text"
                        danger
                        size='small'
                        onClick={async () => {
                            messageApi.open({
                                key: 'delete_student',
                                type: 'loading',
                                content: '正在删除...'
                            })
                            try {
                                await clazz.deleteClassMember(id, [record.user_id])
                                messageApi.open({
                                    key: 'delete_student',
                                    type: 'success',
                                    content: '删除成功'
                                })
                                actionRef.current?.reload();
                            } catch (error) {
                                messageApi.open({
                                    key: 'delete_student',
                                    type: 'error',
                                    content: error?.message || '删除失败'
                                })
                            }
                        }}
                        key="delete"
                        disabled={me?.user_type !== 'admin'}
                    >删除</Button>
                </div>
            },
        },
    ];


    return <>
        {contextHolder}
        <ProTable
            rowSelection={rowSelection}
            actionRef={actionRef}
            className="mt-5"
            columns={USER_COLUMNS}
            cardBordered
            request={async (params, sort, filter) => {
                const data = await clazz.getClassMember(id);
                return {
                    total: data?.total,
                    data: data?.data?.filter(item => !item.is_teacher),
                    success: true
                };
            }}
            editable={false}
            columnsState={{
                persistenceKey: 'scs:manage:clazz-manage-teacher-list-table',
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
            toolBarRender={() => [
                <ImportModal
                    key="import"
                    onImport={async (userList) => {
                        const userDict = {}
                        userList.forEach(id => {
                            userDict[id] = false
                        })
                        const res = await clazz.importClassMember(id, userDict)
                        actionRef.current?.reload();

                        return res
                    }}
                >,
                    <Button
                        type="primary"
                        key="button"
                        icon={<ImportOutlined />}
                        disabled={me?.user_type !== 'admin'}
                    >
                        导入学生
                    </Button>
                </ImportModal>
            ]}
            tableAlertOptionRender={() => {
                return (
                    <Button
                        type="text"
                        danger
                        disabled={me?.user_type !== 'admin'}
                        onClick={() => {
                            confirm({
                                title: '确认删除',
                                icon: <ExclamationCircleFilled />,
                                content: '确认删除选中的学生吗？',
                                async onOk() {
                                    messageApi.open({
                                        key: 'delete_student',
                                        type: 'loading',
                                        content: '正在删除...'
                                    })

                                    try {
                                        await clazz.deleteClassMember(id, selectedRows.map(item => item.user_id))
                                        messageApi.open({
                                            key: 'delete_student',
                                            type: 'success',
                                            content: '删除成功'
                                        })
                                    } catch (error) {
                                        messageApi.open({
                                            key: 'delete_student',
                                            type: 'error',
                                            content: error?.message || '删除失败'
                                        })
                                    }

                                    setSelectedRowKeys([])
                                    setSelectedRows([])
                                    actionRef.current?.reload();
                                },
                                okText: '确认',
                                cancelText: '取消',
                                centered: true,
                                okType: 'danger',
                                danger: true,
                            });
                        }}
                    >
                        批量删除
                    </Button>
                );
            }}
        />
    </>
}