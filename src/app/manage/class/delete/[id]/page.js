"use client"
import { Breadcrumb, Button, Input, Spin, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { message } from 'antd';
import { clazz } from '@/api/index';
import useSWR from 'swr';


export default function ClassDeleteConfirm({ params }) {
    const [messageApi, contextHolder] = message.useMessage();
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const [updating, setUpdating] = useState(false);
    const [className, setClassName] = useState('');
    const [breadcrumb, setBreadcrumb] = useState([]);

    const router = useRouter()

    const { id } = params;
    const { data, error, isLoading } = useSWR(refreshKey, (key) => {
        return clazz.getClass(id)
    })

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>删除班级</h1>

        {contextHolder}
        <Spin spinning={isLoading}>
            <div className="mt-5 p-5 bg-white rounded-lg shadow max-w-[500px]">
                <h2 className={"text-lg font-bold"}>二次确认</h2>
                <p className={"text-red-500 mt-5 bg-red-100 p-3 rounded-lg"}>
                    你收到这个弹窗是因为你正在尝试删除一个班级。请确认你的操作。
                </p>
                <p className={"mt-5"}>
                    删除班级后，班级内的所有数据都将同步删除，<b>且无法恢复</b>，包含：
                    <ul className={"list-disc list-inside mt-3"}>
                        <li>班级基本信息</li>
                        <li>教师设置</li>
                        <li>学生设置</li>
                        <li>任务设置</li>
                        <li>学生分组信息</li>
                        <li>学生任务递交记录</li>
                        <li>学生任务评分记录</li>
                        <li>学生成绩</li>
                    </ul>
                </p>

                <p className={"mt-5"}>
                    您当前的操作是删除班级 <b className={"select-none"}>{data?.name}</b>，
                    班级ID为 <b>{data?.id}</b>，
                    该班级有 <b>{data?.stu_count}</b> 个学生，
                    <b>{data?.stu_count}</b> 个教师，
                    班级状态为 <b>{data?.status}</b>。
                    <br />
                    若您需要继续删除，请在下方的输入框中输入当前班级名称（<b className={"select-none"}>{data?.name}</b>）以确认。
                </p>

                <div className={"mt-5"}>
                    <Input
                        className={"mt-5"}
                        placeholder={"请输入班级名称"}
                        value={className}
                        onChange={(e) => {
                            setClassName(e.target.value)
                        }}
                    />
                </div>

                <div className={"mt-3 flex justify-center gap-5"}>
                    <Button
                        type='primary'
                        onClick={() => {
                            router.push('/manage/class/list')
                        }}
                    > 取消 </Button>
                    <Button
                        danger
                        onClick={async () => {
                            if (updating) {
                                return
                            }
                            if (className !== data.name) {
                                messageApi.error('班级名称不匹配')
                                return
                            }

                            messageApi.open({
                                key: 'delete_class',
                                type: 'loading',
                                content: '正在删除...'
                            })
                            setUpdating(true)

                            try {
                                await clazz.deleteClass(id)
                                messageApi.open({
                                    key: 'delete_class',
                                    type: 'success',
                                    content: '删除成功'
                                })
                                router.push('/manage/class/list')
                            } catch (error) {
                                messageApi.open({
                                    key: 'delete_class',
                                    type: 'error',
                                    content: error?.message || '删除失败'
                                })
                            }
                            setUpdating(false)
                        }}
                    > 确认删除 </Button>
                </div>
            </div>
        </Spin>
    </div>
}