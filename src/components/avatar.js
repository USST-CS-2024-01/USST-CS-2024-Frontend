"use client"

import { Avatar, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { getAvatar } from '@/store/avatar';

const COLOR_SET = [
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#00a854',
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#00a854',
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#00a854',
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#00a854',
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#00a854',
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#00a854',
    '#f56a00',
    '#7265e6',
    '#ffbf00',
    '#00a2ae',
    '#00a854',
];


export function getColor(text) {
    const sum = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return COLOR_SET[sum % COLOR_SET.length];
}

export default function UserAvatar({ user, size }) {
    const [avatar, setAvatar] = useState(null);
    const [color, setColor] = useState(COLOR_SET[0]);
    useEffect(() => {
        if (user?.id === undefined) {
            return;
        }
        (async () => {
            let avatar = await getAvatar(user?.id);
            setAvatar(avatar);
        })()
        setColor(COLOR_SET[user?.id % COLOR_SET.length]);
    }, [user?.id]);


    return (
        <Tooltip title={`${user?.name}(${user?.employee_id})`}>
            <Avatar size={size} style={{ backgroundColor: color }} src={avatar} >
                {user?.name[0].toUpperCase()}
            </Avatar>
        </Tooltip>

    )
} 