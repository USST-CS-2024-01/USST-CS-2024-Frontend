"use client"
import { Alert, Breadcrumb, Button, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { notFound } from 'next/navigation';
import BasicClassInfoForm from './basic_info_form';
import TeacherList from './teacher_list';
import StudentList from './student_list';
import ActionPanel from './action_panel';


export default function ClassEdit({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
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
        <div className='flex gap-2 items-end my-3'>
            <h1 className={"text-2xl font-bold mt-2"}>{title}</h1>
            {id !== 'new' && <Button
                type='link'
                onClick={() => router.push(`/class/${id}`)}
                size='small'
            >
                查看班级
            </Button>}
        </div>
        {id == 1 &&
            <div className={"mt-5 mb-2"}>
                <Alert
                    type='info'
                    message='模板班级'
                    description='这是一个模板班级，在创建新班级时，该班级的所有设置将被复制到新班级中。该班级不支持设置教师和学生。'
                    showIcon
                />
            </div>
        }
        <Tabs
            items={[
                { key: '1', label: '基本信息' },
                { key: '2', label: '教师设置', disabled: id === 'new' || id == 1 },
                { key: '3', label: '学生设置', disabled: id === 'new' || id == 1 },
                { key: '4', label: '操作', disabled: id === 'new' || id == 1 },
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
            {tabIndex === '2' &&
                <TeacherList id={id} />
            }
            {tabIndex === '3' &&
                <StudentList id={id} />
            }
            {tabIndex === '4' &&
                <ActionPanel id={id} />
            }
        </div>
    </div>
}