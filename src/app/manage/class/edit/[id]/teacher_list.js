"use client"
import { ProTable } from "@ant-design/pro-components"
import { Button, Modal, message } from "antd"
import { useRef, useState } from "react"
import { clazz } from "@/api"
import {
    ImportOutlined,
    ExclamationCircleFilled
} from '@ant-design/icons';
import UserAvatar from "@/components/avatar"
import ImportModal from "./import_modal"

export default function TeacherList({ id }) {
    const actionRef = useRef();
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const { confirm } = Modal;

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
        }
    };

    const USER_COLUMNS = [
        {
            title: '用户ID',
            dataIndex: 'id',
            ellipsis: true,
            disable: true,
            hideInSearch: true,
            width: 80,
            align: 'center'
        },
        {
            title: '教师',
            dataIndex: 'name',
            ellipsis: true,
            hideInSearch: true,
            render: (text, record) => {
                return <div className='flex items-center'>
                    <UserAvatar user={record} />
                    <div className='flex flex-col'>
                        <span className='ml-2'>{record.name}（UID：{record.id}）</span>
                        <span className='ml-2 text-xs text-gray-500'>{record.employee_id}</span>
                    </div>
                </div>
            }
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            align: 'center',
            width: 120,
            render: (text, record, _, action) => {
                return <div className='flex justify-center'>
                    <Button
                        type="text"
                        danger
                        size='small'
                        onClick={async () => {
                            messageApi.open({
                                key: 'delete_teacher',
                                type: 'loading',
                                content: '正在删除...'
                            })
                            try {
                                await clazz.deleteClassMember(id, [record.id])
                                messageApi.open({
                                    key: 'delete_teacher',
                                    type: 'success',
                                    content: '删除成功'
                                })
                                actionRef.current?.reload();
                            } catch (error) {
                                messageApi.open({
                                    key: 'delete_teacher',
                                    type: 'error',
                                    content: error?.message || '删除失败'
                                })
                            }
                        }}
                        key="delete"
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
                const data = await clazz.getClass(id);
                return {
                    total: data?.tea_list?.length,
                    data: data?.tea_list,
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
                            userDict[id] = true
                        })
                        await clazz.importClassMember(id, userDict)
                        actionRef.current?.reload();
                    }}
                >,
                    <Button
                        type="primary"
                        key="button"
                        icon={<ImportOutlined />}
                    >
                        导入教师
                    </Button>
                </ImportModal>
            ]}
            tableAlertOptionRender={() => {
                return (
                    <Button
                        type="text"
                        danger
                        onClick={() => {
                            confirm({
                                title: '确认删除',
                                icon: <ExclamationCircleFilled />,
                                content: '确认删除选中的教师吗？',
                                async onOk() {
                                    messageApi.open({
                                        key: 'delete_teacher',
                                        type: 'loading',
                                        content: '正在删除...'
                                    })

                                    try {
                                        await clazz.deleteClassMember(id, selectedRowKeys)
                                        messageApi.open({
                                            key: 'delete_teacher',
                                            type: 'success',
                                            content: '删除成功'
                                        })
                                    } catch (error) {
                                        messageApi.open({
                                            key: 'delete_teacher',
                                            type: 'error',
                                            content: error?.message || '删除失败'
                                        })
                                    }

                                    setSelectedRowKeys([]);
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