"use client"
import { Breadcrumb, Button, Tooltip, Avatar } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { ProTable, StatisticCard } from '@ant-design/pro-components';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { group, clazz } from '@/api/index';
import { message } from 'antd';
import {
    PlusOutlined,
    EditOutlined
} from '@ant-design/icons';
import useSWR from 'swr';
import { getUser } from '@/store/session';
import UserAvatar from '@/components/avatar';

const { Divider } = StatisticCard;

export default function GroupStudentPage({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();
    const actionRef = useRef();
    const { data: me } = useSWR('me', getUser);
    const { id } = params;
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data: classMember } = useSWR(refreshKey, () => clazz.getClassMember(id))
    const [analyze, setAnalyze] = useState({});

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, id))
    }, [router, id])

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb} />
            <h1 className={"text-2xl font-bold mt-2"}>组队管理</h1>
            {contextHolder}
        </div>
    )
}