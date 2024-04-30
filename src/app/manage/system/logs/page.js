"use client"
import Image from 'next/image'
import { Breadcrumb } from 'antd';
import { useEffect, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next/navigation';
import { log } from '@/api/index';

const LOG_COLUMNS = [
    {
        title: '模糊搜索',
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
        title: '日志类型',
        dataIndex: 'log_type',
        ellipsis: true,
        disable: true,
    },
    {
        title: '日志内容',
        dataIndex: 'content',
        ellipsis: true,
        copyable: true,
        search: false,
    },
    {
        disable: true,
        title: '操作用户',
        ellipsis: true,
        search: false,
        renderText: (text, record, _, action) => {
            const user = {
                id: record.user_id || '0',
                name: record.user_name || record.user_employee_id || record.user_id || '未知用户',
                employee_id: record.user_employee_id || '未知学工号',
            }

            return `${user.name} (EmpID: ${user.employee_id}, UID: ${user.id})`
        },
    },
    {
        title: '用户UID',
        dataIndex: 'user_id',
        valueType: 'digit',
        hideInTable: true,
    },
    {
        title: '用户姓名',
        dataIndex: 'user_name',
        hideInTable: true,
    },
    {
        title: '用户学工号',
        dataIndex: 'user_employee_id',
        hideInTable: true,
    },
    {
        title: '操作时间',
        key: 'operationTime',
        dataIndex: 'operation_time',
        valueType: 'datetime',
        sorter: true,
        ellipsis: true,
        hideInSearch: true,
        disable: true,
        renderText: (text, record, _, action) => {
            return new Date(text * 1000).toLocaleString();
        }
    },
    {
        title: '操作IP',
        dataIndex: 'operation_ip',
    },
    {
        title: '操作时间',
        dataIndex: 'operation_time',
        valueType: 'dateRange',
        hideInTable: true,
        colSize: 2,
        search: {
            transform: (value) => {
                return {
                    operation_time_start: new Date(value[0]).getTime() / 1000,
                    operation_time_end: new Date(value[1]).getTime() / 1000,
                };
            },
        },
    },
];


export default function LogList() {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb} />
            <h1 className={"text-2xl font-bold mt-2"}>日志管理</h1>

            <ProTable
                className="mt-5"
                columns={LOG_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    return await log.getLogList(params, sort, filter);
                }}
                editable={false}
                columnsState={{
                    persistenceKey: 'scs:manage:log-list-table',
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

                ]}
            />
        </div>
    )
}
