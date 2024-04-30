"use client"
import { Breadcrumb, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next/navigation';
import { user } from '@/api/index';
import { message } from 'antd';
import useSWR from 'swr';


export default function UserProfile() {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data, error, isLoading } = useSWR(refreshKey, (key) => user.getMeUser())
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = ProForm.useForm();
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    useEffect(() => {
        if (!data) {
            return
        }
        console.log(data)
        form.setFieldsValue(data)
    }, [data, form])

    const onFinish = async (values) => {
        if (updating) {
            return
        }
        if (values?.password) {
            if (values.password !== values.confirm_password) {
                messageApi.error('两次密码不一致')
                return
            }
        }
        const passwordRegex = /^[a-zA-Z0-9~!@#$%^&*()_+`\-={}|\[\]\\:\";'<>?,./]{6,20}$/
        if (values?.password && !passwordRegex.test(values.password)) {
            messageApi.error('密码格式错误')
            return
        }

        messageApi.open({
            key: 'update_user',
            type: 'loading',
            content: '正在更新...'
        })
        setUpdating(true)

        try {
            await user.updateMeUser(values)
            setRefreshKey(refreshKey + 1)
            messageApi.open({
                key: 'update_user',
                type: 'success',
                content: '更新成功'
            })
        } catch (error) {
            messageApi.open({
                key: 'update_user',
                type: 'error',
                content: error?.message || '更新失败'
            })
        }
        setUpdating(false)
    }

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>个人信息</h1>
        {contextHolder}
        <div className={"mt-5 p-5 bg-white rounded-md max-w-[500px]"}>
            <Spin spinning={isLoading}>
                <ProForm form={form} onReset={() => {
                    form.setFieldsValue(data)
                }} onFinish={onFinish}>
                    <ProFormText
                        label="姓名"
                        name="name"
                        disabled
                    />
                    <ProFormText
                        label="学工号"
                        name="employee_id"
                        disabled
                    />
                    <ProFormText
                        label="邮箱"
                        name="email"
                        rules={[{ required: true }]}
                    />
                    <ProFormText
                        label="新密码"
                        name="password"
                        fieldProps={{
                            type: 'password'
                        }}
                    />
                    <ProFormText
                        label="确认密码"
                        name="confirm_password"
                        fieldProps={{
                            type: 'password'
                        }}
                    />
                </ProForm>
            </Spin>
        </div>
    </div>
}