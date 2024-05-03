"use client"
import { Avatar, Breadcrumb, Empty, Segmented, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { clazz, task } from '@/api/index';
import { message } from 'antd';
import useSWR from 'swr';
import { TaskCard } from './task_item';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlusOutlined } from '@ant-design/icons';
import TaskEdit from './task_edit';

export default function TaskManage({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data, error, isLoading } = useSWR(refreshKey, (key) => {
        console.log('fetching task list')
        return task.getClassTaskList(params.id)
    })
    const [tasks, setTasks] = useState([])
    const [taskIds, setTaskIds] = useState([])
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedTask, setSelectedTask] = useState(null)
    const { id } = params

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, id))
    }, [router, id])

    useEffect(() => {
        if (!data) return;

        let { first_task_id, current_task_id, data: taskList } = data;
        if (!taskList) {
            return
        }

        if (!first_task_id) {
            setTasks(taskList)
            setTaskIds(taskList.map((item) => item.id))
            return
        }

        const taskIds = [first_task_id];
        const tasks = [];
        const remaining = [...taskList];
        let locked = true;

        let current = taskList.find((item) => item.id === first_task_id);

        if (current.id === current_task_id) {
            current.locked = true;
            locked = false;
        } else {
            current.locked = true;
        }

        if (!current_task_id) {
            current.locked = false;
            locked = false;
        }

        tasks.push(current);
        remaining.splice(remaining.indexOf(current), 1);

        while (remaining.length > 0) {
            const next = tasks[tasks.length - 1].next_task_id;
            if (!next) {
                break;
            }
            const nextTask = remaining.find((item) => item.id === next);
            if (!nextTask) {
                break;
            }

            if (nextTask.id === current_task_id) {
                nextTask.locked = true;
                locked = false;
            }
            if (locked) {
                nextTask.locked = true;
            }

            tasks.push(nextTask);
            taskIds.push(nextTask.id);
            remaining.splice(remaining.indexOf(nextTask), 1);
        }

        let needUpdate = false;
        if (tasks.length !== taskList.length) {
            tasks.push(...remaining);
            taskIds.push(...remaining.map((item) => item.id));
            needUpdate = true;
        }

        // 如果最后一个任务还有下一个任务，说明有任务丢失
        if (tasks[tasks.length - 1].next_task_id) {
            needUpdate = true;
        }

        setTasks(tasks)
        setTaskIds(taskIds)

        if (needUpdate) {
            task.setTaskSequence(id, {
                sequences: taskIds
            })
        }
    }, [data, id])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            setSelectedTask(tasks.find((item) => item.id === active.id))
            return
        }

        if (active.id !== over.id) {
            const oldIndex = taskIds.indexOf(active.id);
            const newIndex = taskIds.indexOf(over.id);

            const newTaskIds = [...taskIds];
            newTaskIds.splice(oldIndex, 1);
            newTaskIds.splice(newIndex, 0, active.id);

            setTaskSequence(newTaskIds)
        }
    }

    const setTaskSequence = async (taskIds) => {
        try {
            await task.setTaskSequence(id, {
                sequences: taskIds
            })
            setRefreshKey(Date.now() + 1)
            messageApi.success('操作成功')
        } catch (e) {
            messageApi.error(e.message || '操作失败')
        }
    }

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>课程任务安排</h1>
        {contextHolder}

        <div className={"mt-5"}>
            拖动任务可以调整顺序。
        </div>

        <div className="flex mt-5">
            <Spin spinning={isLoading}>
                <div className="mr-5">
                    <div
                        className="flex gap-2 border-dashed border-[1px] border-gray-200 w-64 bg-white cursor-pointer py-3 justify-center hover:shadow-md transition duration-300 ease-in-out"
                        onClick={() => {
                            setSelectedTask({
                                id: 'new',
                                class_id: id
                            })
                        }}
                    >
                        <PlusOutlined />
                        新增任务
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                            {tasks?.map((item, index) => (
                                <TaskCard
                                    key={item.id}
                                    id={item.id}
                                    task={item}
                                    index={index}
                                    onClick={() => setSelectedTask(item)}
                                    selected={selectedTask?.id === item.id}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            </Spin>

            <div className="flex-grow bg-white p-5 rounded max-w-[800px]">
                {selectedTask ?
                    <TaskEdit
                        taskInfo={selectedTask}
                        onEdit={() => {
                            setRefreshKey(Date.now() + 1)
                        }}
                        onDelete={() => {
                            setSelectedTask(null)
                            setRefreshKey(Date.now() + 1)
                        }}
                    /> :
                    <div className="mt-10 text-gray-400 text-center">
                        <Empty description={"请选择或新增一个任务"} />
                    </div>
                }
            </div>

        </div>
    </div>
}