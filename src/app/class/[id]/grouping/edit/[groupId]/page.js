"use client"
import { Alert, Breadcrumb, Steps, Tabs } from 'antd';
import { use, useEffect, useState } from 'react';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { notFound } from 'next/navigation';
import useSWR from 'swr';
import { group } from '@/api';
import BasicGroupInfoForm from './basic_info_form';
import GroupMemberList from './group_member';
import ActionPanel from './action_panel';

export default function GroupEdit({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [tabIndex, setTabIndex] = useState('1');
    const { id, groupId } = params;
    const [currentStep, setCurrentStep] = useState(groupId === 'new' ? 0 : 1);
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const { data: classGroup, isLoading, error } = useSWR(refreshKey, () => {
        if (groupId === 'new') {
            return null;
        }
        return group.getClassGroup(id, groupId)
    })

    let title = '编辑小组';
    if (groupId !== 'new' && isNaN(id)) {
        notFound()
    } else if (groupId === 'new') {
        title = '新建小组';
    }

    useEffect(() => {
        if (error) {
            router.push(`/class/${id}/grouping`)
        }
    }, [router, id, error])

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, id))
    }, [router, id])

    useEffect(() => {
        if (!classGroup) {
            return;
        }
        if (classGroup.status === 'normal') {
            setCurrentStep(3)
        } else {
            setCurrentStep(1)
        }
        setTabIndex('2')
    }, [classGroup])

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2 mb-5"}>{title}</h1>
        <div className={"max-w-[800px]"}>
            <Steps
                current={currentStep}
                status={currentStep === 3 ? 'finish' : 'process'}
                items={[
                    {
                        title: '小组创建',
                        description: '创建小组并设置小组名称。',
                    },
                    {
                        title: '组员设置',
                        description: '邀请或审核班级成员的加入。',
                    },
                    {
                        title: '教师审核',
                        description: '教师对组队进行审核。',
                    },
                    {
                        title: '完成组队'
                    },
                ]}
            />
        </div>
        <div className="mt-5">
            <Tabs
                items={[
                    { key: '1', label: '基本信息' },
                    { key: '2', label: '组员设置', disabled: groupId === 'new' },
                    { key: '3', label: '操作', disabled: groupId === 'new' },
                ]}
                activeKey={tabIndex}
                onChange={(key) => setTabIndex(key)}
            />
        </div>
        <div className="mt-1">
            {tabIndex === '1' &&
                <BasicGroupInfoForm
                    classId={id}
                    groupId={groupId}
                    groupInfo={classGroup}
                    onUpdate={(newId) => {
                        setRefreshKey(Date.now())
                        if (newId !== groupId) {
                            router.push(`/class/${id}/grouping/edit/${newId}`)
                        }
                    }}
                />
            }
            {tabIndex === '2' &&
                <GroupMemberList
                    classId={id}
                    groupId={groupId}
                />
            }
            {tabIndex === '3' &&
                <ActionPanel
                    classId={id}
                    groupId={groupId}
                    onUpdate={() => {
                        setRefreshKey(Date.now())
                    }}
                />
            }
        </div>
    </div>
}