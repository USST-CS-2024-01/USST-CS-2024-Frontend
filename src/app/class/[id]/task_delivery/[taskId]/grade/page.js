"use client"
import { Alert, Avatar, Breadcrumb, Button, Empty, Segmented, Select, Spin, Tag, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { clazz, task, group } from '@/api/index';
import useSWR from 'swr';
import {
    CalendarOutlined,
    EditOutlined,
    DownloadOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';
import { timestampToTime } from '@/util/string';
import { ProTable } from '@ant-design/pro-components';
import DeliveryDetail from './delivery_detail';
import ScorePanel from './score_panel';

const STATUS_TAG_MAP = {
    draft: <Tag color='yellow'>草稿</Tag>,
    leader_review: <Tag color='blue'>组长审核</Tag>,
    teacher_review: <Tag color='cyan'>教师审核</Tag>,
    leader_rejected: <Tag color='red'>组长驳回</Tag>,
    teacher_rejected: <Tag color='red'>教师驳回</Tag>,
    teacher_approved: <Tag color='green'>教师通过</Tag>,
}

export default function TaskDeliveryManage({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const { id: classId, taskId } = params

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, {
            id: classId,
            taskId
        }))
    }, [router, classId, taskId])

    const [refreshKey, setRefreshKey] = useState(`task-delivery-${classId}-${taskId}-latest-${Date.now()}`)
    const { data: groupedTaskDelivery } = useSWR(refreshKey, async () => {
        const data = await task.getTaskLatestDelivery(classId, taskId)
        return data?.data || []
    })
    const { data: groupList } = useSWR(`task-delivery-${classId}`, async (key) => {
        const data = await group.getClassGroupList(classId);
        return data?.data || []
    })

    const [selectGroup, setSelectGroup] = useState(null)
    const [selectDelivery, setSelectDelivery] = useState(null)

    const [deliveryRefreshKey, setDeliveryRefreshKey] = useState(`task-delivery-${classId}-${taskId}-selectGroup-${Date.now()}`)
    const { data: deliveryList } = useSWR(
        selectGroup ? [deliveryRefreshKey, selectGroup.id] : null, async () => {
            const data = await task.getTaskDeliveryList(classId, selectGroup.id, taskId)
            return data?.data || []
        }
    )
    const { data: taskInfo } = useSWR(`task-delivery-taskinfo-${classId}-${taskId}`, async () => {
        const data = await task.getClassTask(classId, taskId)
        return data
    })

    const [canScore, setCanScore] = useState(false)

    useEffect(() => {
        if (!groupList || !groupedTaskDelivery) {
            return
        }

        if (!selectGroup) {
            setSelectGroup(groupList[0])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupList, groupedTaskDelivery])

    useEffect(() => {
        if (!selectDelivery || !deliveryList) return;
        setSelectDelivery(deliveryList.find(d => d.id === selectDelivery.id))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deliveryList])

    useEffect(() => {
        if (!deliveryList || !selectGroup) return;
        setCanScore(
            deliveryList.some(d => d.delivery_status === 'teacher_approved')
        )
    }, [selectGroup, deliveryList])

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>交付物批改</h1>

        <div className="flex mt-5 gap-5">
            <div className="bg-white p-5 rounded w-[400px]">
                <h2 className="text-lg font-bold mb-5">
                    {taskInfo?.name}
                </h2>

                <Select
                    placeholder="选择小组"
                    className="w-full"
                    loading={!groupList}
                    disabled={!groupList}
                    options={groupedTaskDelivery && groupList?.map(g => {
                        const status = groupedTaskDelivery?.find(d => d.group_id === g.id)?.delivery_status || '未提交'
                        return {
                            label: <>
                                <span className="ml-2">{g.name}</span>
                                <span className="float-right">{STATUS_TAG_MAP[status]}</span>
                            </>,
                            value: g.id
                        }
                    })}
                    onChange={(value) => {
                        setSelectGroup(groupList.find(g => g.id === value))
                        setSelectDelivery(null)
                    }}
                    value={selectGroup?.id}
                />

                <div className="mt-5 flex gap-2 items-center justify-center">
                    <Button
                        type='dashed'
                        disabled={groupList?.[0]?.id === selectGroup?.id}
                        onClick={() => {
                            const index = groupList.findIndex(g => g.id === selectGroup.id)
                            setSelectGroup(groupList[index - 1])
                            setSelectDelivery(null)
                        }}
                    >上一个</Button>

                    <Button
                        type='dashed'
                        disabled={groupList?.[groupList.length - 1]?.id === selectGroup?.id}
                        onClick={() => {
                            const index = groupList.findIndex(g => g.id === selectGroup.id)
                            setSelectGroup(groupList[index + 1])
                            setSelectDelivery(null)
                        }}

                    >下一个</Button>
                </div>

                {selectGroup && <>
                    <div className="mt-10">
                        <h2 className="text-lg font-bold">交付记录</h2>
                        <div className="mt-5 flex flex-col border rounded h-[200px] overflow-y-auto gap-0.5">
                            {deliveryList?.length > 0 ? deliveryList.map((delivery) => {
                                return <div
                                    key={delivery.id}
                                    className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer ${selectDelivery?.id === delivery.id ? 'bg-gray-100' : ''}`}
                                    onClick={() => setSelectDelivery(delivery)}
                                >
                                    {STATUS_TAG_MAP[delivery.delivery_status]}
                                    <span>{timestampToTime(delivery.delivery_time * 1000)}</span>
                                    {(taskInfo?.deadline && delivery.delivery_time > taskInfo.deadline) &&
                                        <span className='text-red-500'>(逾期)</span>}
                                    {delivery.delivery_status === 'teacher_approved' && <Tag color='purple'>
                                        评分: {delivery.task_grade_percentage}
                                    </Tag>}
                                </div>
                            }) : <div className='py-10'>
                                <Empty description="无交付物" />
                            </div>}
                        </div>
                    </div>

                    <div className="mt-5">
                        <h2 className="text-lg font-bold">学生评分</h2>
                        {!canScore && <div className='mt-2'>
                            <Alert
                                type='warning'
                                message="请先通过审核后再进行评分"
                                showIcon
                            />
                        </div>}
                        <div className="mt-3 border rounded p-2">
                            <ScorePanel
                                classId={classId}
                                groupId={selectGroup?.id}
                                taskId={taskId}
                                disabled={!canScore}
                            />
                        </div>
                    </div>
                </>}
            </div>

            <div className="flex-grow bg-white p-2 rounded w-[800px]">
                {selectDelivery ?
                    <DeliveryDetail
                        onRefresh={() => {
                            setRefreshKey(`task-delivery-${classId}-${taskId}-${selectGroup.id}-${Date.now()}`)
                            setDeliveryRefreshKey(`task-delivery-${classId}-${taskId}-${selectGroup.id}-${Date.now()}`)
                        }}
                        classId={classId}
                        groupId={selectGroup.id}
                        delivery={selectDelivery}
                        task={taskInfo}
                        taskId={taskId}
                    /> :
                    <div className="mt-10 text-gray-400 text-center">
                        <Empty description={"请选择一个交付物"} />
                    </div>
                }
            </div>
        </div>
    </div>
}