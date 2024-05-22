"use client"
import { Avatar, Breadcrumb, Button, Drawer, Empty, Input, Segmented, Spin, Tag, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { clazz, score, task } from '@/api/index';
import { message } from 'antd';
import useSWR from 'swr';
import {
    ExportOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { getUser } from '@/store/session';
import ExportJsonExcel from 'js-export-excel';

export default function ScorePage({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [taskRefreshKey, setTaskRefreshKey] = useState(`task-${Date.now()}`)
    const [messageApi, contextHolder] = message.useMessage();
    const { data: me } = useSWR('me', getUser)
    const { id } = params
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [dataSource, setDataSource] = useState([])

    const INITIAL_COLUMNS = [
        {
            title: '序号',
            dataIndex: 'index',
            valueType: 'index',
            key: 'index',
            width: 64,
            align: "center",
            disable: true,
            fixed: 'left',
        },
        {
            title: '姓名',
            dataIndex: 'user_name',
            key: 'user_name',
            width: 120,
            align: "center",
            fixed: 'left',
            disable: true,
        },
        {
            title: '学号',
            dataIndex: 'user_employee_id',
            key: 'user_employee_id',
            width: 120,
            align: "center",
            fixed: 'left',
            disable: true,
        },
    ];
    const [tableColumn, setTableColumn] = useState(INITIAL_COLUMNS);

    const { data: taskData } = useSWR(taskRefreshKey, async (key) => {
        const result = await task.getClassTaskChain(id)
        const data = result?.data || []

        const totalPercentage = data.reduce((acc, cur) => acc + cur.grade_percentage, 0)
        const column = data.map((item, index) => {
            return {
                title: `${item.name} (${item.grade_percentage}%)`,
                dataIndex: `task_${item.id}`,
                key: `task_${item.id}`,
                width: 120,
                align: "center",
                sorter: (a, b) => a[`task_${item.id}`] - b[`task_${item.id}`],
                render: (text, record) => {
                    let actualScore = record[`task_${item.id}`] === null ? '-' : (record[`task_${item.id}`] / 100 * item.grade_percentage).toFixed(2)
                    if (isNaN(actualScore)) {
                        return '-'
                    }

                    let relativeScore = record[`task_${item.id}`];
                    let score_color_class = 'text-gray-600';

                    if (relativeScore === null) {
                        score_color_class = 'text-gray-600';
                    }
                    if (relativeScore >= 90) {
                        score_color_class = 'text-green-600';
                    }
                    if (relativeScore < 60) {
                        score_color_class = 'text-red-600';
                    }
                    if (relativeScore >= 60 && relativeScore < 90) {
                        score_color_class = 'text-gray-600';
                    }

                    return <Tooltip
                        title={`原始评分：${record[`task_${item.id}`]} / 100`}
                        key={`${record.id}-${item.id}`}
                    >
                        <span className={score_color_class}>{actualScore}</span>
                    </Tooltip>
                }
            }
        })

        setTableColumn([...INITIAL_COLUMNS, ...column, {
            title: `总分 (${totalPercentage}%)`,
            dataIndex: 'total_score',
            key: 'total_score',
            render: (text, record) => {
                const total_score = record.total_score === null ? '-' : record.total_score.toFixed(2)
                if (isNaN(total_score)) {
                    return '-'
                }

                let score_color_class = 'text-gray-600';
                if (total_score === null) {
                    score_color_class = 'text-gray-600';
                }
                if (total_score >= 90) {
                    score_color_class = 'text-green-600';
                }
                if (total_score < 60) {
                    score_color_class = 'text-red-600';
                }
                return <span className={score_color_class}>{total_score}</span>
            },
            width: 100,
            fixed: 'right',
            align: "center",
            sorter: (a, b) => a.total_score - b.total_score,
            disable: true,
        }])

        return data
    })

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, id))
    }, [router, id])

    const downloadFileToExcel = () => {
        const datas = [...dataSource]
        var option = {};
        let dataTable = [];
        if (datas) {
            datas.map((item) => {
                const copiedItem = { ...item }
                tableColumn.forEach((column) => {
                    if (column.dataIndex === 'index') {
                        copiedItem.index = datas.indexOf(item) + 1
                        return;
                    }
                    if (column.dataIndex.startsWith("task_")) {
                        copiedItem[column.dataIndex] = item[column.dataIndex] / 100 * taskData.find((task) => task.id === Number(column.dataIndex.split('_')[1]))?.grade_percentage
                        if (isNaN(item[column.dataIndex])) {
                            copiedItem[column.dataIndex] = null
                        }
                    }
                    if (!copiedItem[column.dataIndex]) {
                        copiedItem[column.dataIndex] = '/'
                    }

                });
                dataTable.push(copiedItem);
                return dataTable
            })
        }
        option.fileName = `成绩表导出 ${new Date().toLocaleString()}`;
        option.datas = [
            {
                sheetData: dataTable,
                sheetName: 'sheet',
                sheetFilter: [...tableColumn.map((item) => item.key)],
                sheetHeader: [...tableColumn.map((item) => item.title)],
            }
        ];
        var toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
    }

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>成绩管理</h1>
        {contextHolder}

        <Drawer title="编辑成绩占比" onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen}>
            <Spin spinning={!taskData}>
                <div className='flex flex-col gap-3 border rounded-md p-5 min-h-[200px]'>
                    {taskData?.map((item) => {
                        return <div key={item.id} className="flex items-center gap-2">
                            <div className='w-[96px]'>{item.name}</div>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                defaultValue={item.grade_percentage}
                                onBlur={(e) => {
                                    const value = e.target.value
                                    if (value >= 0 && value <= 100) {
                                        task.updateClassTask(id, item.id, { grade_percentage: value })
                                        setTaskRefreshKey(`task-${Date.now()}`)
                                    }
                                }}
                            />
                            <div>%</div>
                        </div>
                    })}
                </div>
            </Spin>
        </Drawer>
        {me?.user_type !== 'student' &&
            <div className={"mt-5 p-5 bg-white rounded-md flex justify-end gap-2 max-w-[1500px]"}>
                <Button
                    icon={<ExportOutlined />}
                    onClick={() => {
                        downloadFileToExcel()
                    }}
                >
                    导出
                </Button>

                <Button
                    icon={<SettingOutlined />}
                    onClick={() => {
                        setIsDrawerOpen(true)
                    }}
                >
                    成绩占比
                </Button>
            </div>
        }
        <ProTable
            className="mt-5 max-w-[1500px]"
            columns={tableColumn}
            cardBordered
            request={async (params, sort, filter) => {
                const result = await score.getClassScoreList(id)
                const data = result?.data || []
                const scoreList = data.map((item) => {
                    const scores = item?.score?.reduce((acc, cur) => {
                        acc[`task_${cur?.task?.id}`] = cur.score
                        return acc
                    }, {})
                    return {
                        ...item,
                        ...scores,
                        user_name: item?.user?.name,
                        user_employee_id: item?.user?.employee_id,
                        id: item?.user?.id,
                    }
                })

                setDataSource(scoreList)

                return {
                    success: true,
                    data: scoreList,
                    total: scoreList.length
                }
            }}
            rowKey="id"
            search={false}
            pagination={false}
            scroll={{ x: 'max-content' }}
        />
    </div>
}