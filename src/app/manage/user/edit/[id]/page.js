"use client"
import { Breadcrumb, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { notFound } from 'next/navigation';
import { user } from '@/api/index';
import { message } from 'antd';
import useSWR from 'swr';

const passwordRegex = /^[a-zA-Z0-9~!@#$%^&*()_+`\-={}|\[\]\\:\";'<>?,./]{6,20}$/
const userRegex = /^[a-zA-Z0-9_]{4,20}$/


export default function UserEdit({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = ProForm.useForm();
    const [updating, setUpdating] = useState(false);
    const { id } = params;
    const { data, error, isLoading } = useSWR(refreshKey, (key) => {
        if (id === 'new') {
            return {}
        }
        return user.getUser(id)
    })

    let title = '编辑用户';
    if (id !== 'new' && isNaN(id)) {
        notFound()
    } else if (id === 'new') {
        title = '新建用户';
    }

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    useEffect(() => {
        if (!data) {
            return
        }
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
        if (values?.password && !passwordRegex.test(values.password)) {
            messageApi.error('密码格式错误')
            return
        }
        if (!userRegex.test(values.username)) {
            messageApi.error('用户名格式错误')
            return
        }

        messageApi.open({
            key: 'update_user',
            type: 'loading',
            content: '正在更新...'
        })
        setUpdating(true)

        try {
            if (id === 'new') {
                await user.createUser(values)
            } else {
                await user.updateUser(id, values)
            }
            setRefreshKey(refreshKey + 1)
            messageApi.open({
                key: 'update_user',
                type: 'success',
                content: '更新成功'
            })

            if (id === 'new') {
                router.push('/manage/user/list')
            }
        } catch (e) {
            messageApi.open({
                key: 'update_user',
                type: 'error',
                content: e?.message || '更新失败'
            })
        } finally {
            setUpdating(false)
        }
    }

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>{title}</h1>
        {contextHolder}
        <div className={"mt-5 p-5 bg-white rounded-md max-w-[500px]"}>
            <Spin spinning={isLoading}>
                <ProForm form={form} onReset={() => {
                    if (id === 'new') {
                        form.resetFields()
                    } else {
                        form.setFieldsValue(data)
                    }
                }} onFinish={onFinish}>
                    <ProFormText
                        label="用户名"
                        name="username"
                        required
                        tooltip="用户名用于登录，不可重复"
                        placeholder="用户名长度为4-20位，支持数字、字母和特殊字符"
                        rules={[{ required: true }, { pattern: userRegex, message: '用户名长度为4-20位，支持数字、字母和特殊字符' }]}
                    />
                    <ProFormText
                        label="新密码"
                        name="password"
                        fieldProps={{
                            type: 'password'
                        }}
                        required={id === 'new'}
                        tooltip={"密码长度为6-20位，支持数字、字母和特殊字符" + (id === 'new' ? '' : '，留空则不修改')}
                        placeholder="密码长度为6-20位，支持数字、字母和特殊字符"
                        rules={id === 'new' ? [{ required: true }, { pattern: passwordRegex, message: '密码长度为6-20位，支持数字、字母和特殊字符' }] : []}
                    />
                    <ProFormText
                        label="确认密码"
                        name="confirm_password"
                        fieldProps={{
                            type: 'password'
                        }}
                        required={id === 'new'}
                        placeholder="确认密码需要与新密码一致"
                        rules={id === 'new' ? [{ required: true }, { pattern: passwordRegex, message: '密码长度为6-20位，支持数字、字母和特殊字符' }] : []}
                    />
                    <ProFormSelect
                        name="user_type"
                        label="用户类型"
                        valueEnum={{
                            student: '学生',
                            teacher: '教师',
                            admin: '管理员'
                        }}
                        placeholder="请选择用户类型"
                        required
                        rules={[{ required: true }]}
                    />
                    <ProFormSelect
                        name="account_status"
                        label="账号状态"
                        valueEnum={{
                            active: '正常',
                            inactive: '未激活'
                        }}
                        placeholder="请选择用户类型"
                        tooltip="账号状态为未激活时，用户无法登录"
                        required
                        rules={[{ required: true }]}
                    />
                    <ProFormText
                        label="邮箱"
                        name="email"
                        rules={[{ required: true }]}
                        required
                        tooltip="用于显示头像，不可重复"
                    />
                    <ProFormText
                        label="姓名"
                        name="name"
                        required
                        rules={[{ required: true }]}
                    />
                    <ProFormText
                        label="学工号"
                        name="employee_id"
                        required
                        rules={[{ required: true }]}
                    />
                </ProForm>
            </Spin>
        </div>
    </div>
}