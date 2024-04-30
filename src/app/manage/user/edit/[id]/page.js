"use client"
import { Breadcrumb, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { notFound, useRouter } from 'next/navigation';
import { user } from '@/api/index';
import { message } from 'antd';
import useSWR from 'swr';


export default function UserEdit({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(1);
    const { data, error, isLoading } = useSWR(refreshKey, (key) => user.getMeUser())
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = ProForm.useForm();
    const [updating, setUpdating] = useState(false);
    const { id } = params;
    
    let title = '编辑用户';
    if (id !== 'new' && isNaN(id)) {
        notFound()
    } else if (id === 'new') {
        title = '新建用户';
    }

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>{title}</h1>
        {contextHolder}
    </div>
}