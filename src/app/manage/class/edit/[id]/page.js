"use client"
import { Breadcrumb, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { notFound } from 'next/navigation';
import { message } from 'antd';
import BasicClassInfoForm from './basic_info_form';


export default function ClassEdit({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();
    const [tabIndex, setTabIndex] = useState('1');
    const { id } = params;

    let title = '编辑班级';
    if (id !== 'new' && isNaN(id)) {
        notFound()
    } else if (id === 'new') {
        title = '新建班级';
    }

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>{title}</h1>

        {contextHolder}
        <Tabs
            items={[
                { key: '1', label: '基本信息' },
                { key: '2', label: '教师设置', disabled: id === 'new' },
                { key: '3', label: '学生设置', disabled: id === 'new' },
            ]}
            activeKey={tabIndex}
            onChange={(key) => setTabIndex(key)}
            className='mt-5'
        />
        <div className="mt-1">
            {tabIndex === '1' &&
                <BasicClassInfoForm
                    id={id}
                    onUpdate={(newId) => {
                        if (id === 'new') {
                            router.push(`/manage/class/edit/${newId}`)
                        }
                    }}
                />
            }
        </div>
    </div>
}