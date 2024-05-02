"use client"
import { Avatar, Breadcrumb, Segmented, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { clazz } from '@/api/index';
import { message } from 'antd';
import useSWR from 'swr';
import UserAvatar from '@/components/avatar';
import { getUser } from '@/store/session';


export default function MyClass() {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data, error, isLoading } = useSWR(refreshKey, (key) => clazz.getClassList({
        current: 1,
        pageSize: 100,
        as_user: true
    }))
    const [messageApi, contextHolder] = message.useMessage();
    const [filter, setFilter] = useState('进行中')
    const [me, setMe] = useState({})

    useEffect(() => {
        getUser().then((user) => {
            setMe(user)
        })
    }, [])

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])


    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>我的班级</h1>
        {contextHolder}

        <div className={"py-5"}>
            <Spin spinning={isLoading}>
                <Segmented
                    value={filter}
                    options={['进行中', '未开始', '已结束']}
                    onChange={(value) => {
                        setFilter(value)
                    }}
                />
                <div className={
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 mt-1"
                }>
                    {data?.data?.filter(
                        (item) => {
                            switch (filter) {
                                case '进行中':
                                    return item.status === 'grouping' || item.status === 'teaching'
                                case '未开始':
                                    return item.status === 'not_started'
                                case '已结束':
                                    return item.status === 'finished'
                                default:
                                    return true
                            }
                        }
                    ).map((item) => {
                        return <div key={item.id} className={
                            `mt-5 p-5 bg-white rounded-md
                                hover:shadow-md transition duration-300 ease-in-out
                                cursor-pointer select-none`
                        }
                            onClick={() => {
                                if (item.status === 'not_started' && me?.role === 'student') {
                                    messageApi.error('班级尚未开始')
                                    return
                                }
                                router.push(`/class/${item.id}`)
                            }}
                        >
                            <div className="flex items-center flex-wrap">
                                <span className="text-lg font-bold inline-block align-middle">{item.name}</span>
                            </div>
                            <div className="mt-1">
                                <span className="inline-block align-middle">
                                    {item.status === 'not_started' && <Tag color="default">未开始</Tag>}
                                    {item.status === 'grouping' && <Tag color="processing">分组中</Tag>}
                                    {item.status === 'teaching' && <Tag color="success">教学中</Tag>}
                                    {item.status === 'finished' && <Tag color="error">已结束</Tag>}
                                </span>
                            </div>
                            <div className='mt-3 flex items-start text-gray-600 gap-2 text-sm'>
                                <span>授课教师</span>
                                <Avatar.Group maxCount={2}>
                                    {item.tea_list.map((teacher) => {
                                        return <UserAvatar key={teacher.id} user={teacher} />
                                    })}
                                </Avatar.Group>
                            </div>
                        </div>
                    })}
                </div>
            </Spin>
        </div>
    </div>
}