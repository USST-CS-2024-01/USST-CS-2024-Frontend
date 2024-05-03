"use client";
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip } from 'antd';
import {
    LockOutlined,
    UserOutlined,
    CalendarOutlined,
    TrophyOutlined,
    HolderOutlined
} from '@ant-design/icons';
import { timestampToTime } from '@/util/string';

export function TaskCard(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const { task, index, selected } = props;

    return (
        <div onClick={() => props?.onClick(task)} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className={`mt-3 bg-white flex flex-col w-64 px-2 hover:shadow-md transition duration-300 ease-in-out cursor-pointer ${selected ? 'border border-blue-500' : ''}`}>
                <div className="p-2 font-bold border-b flex items-center pl-0">
                    <span className="text-gray-500 hover:bg-gray-100 rounded px-1">
                        <HolderOutlined />
                    </span>
                    <span className="ml-2 truncate">#{index + 1} {task.name}</span>
                    {
                        task.locked &&
                        <span className="ml-2 text-red-500">
                            <Tooltip title="由于已有小组到达该任务节点，该任务的顺序无法调整，且无法删除">
                                <LockOutlined />
                            </Tooltip>
                        </span>
                    }
                    {
                        (task.deadline > 0 && task.deadline < Date.now() / 1000) 
                        &&
                        <span className="ml-2 text-red-500">
                            <Tooltip title="已过截止时间">
                                <CalendarOutlined />
                            </Tooltip>
                        </span>
                    }
                </div>
                <div className="pb-3">
                    <ul className="mt-2 text-sm text-gray-600 px-2">
                        <li className="flex items-center gap-2">
                            <Tooltip title="交付者">
                                <UserOutlined />
                            </Tooltip>
                            <span>{task?.role?.role_name || '未分配'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Tooltip title="截止时间">
                                <CalendarOutlined />
                            </Tooltip>
                            <span>{task.deadline ? timestampToTime(task.deadline * 1000) : '未设置截止'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Tooltip title="成绩占比">
                                <TrophyOutlined />
                            </Tooltip>
                            <span>{task.grade_percentage.toFixed(2)}%</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}