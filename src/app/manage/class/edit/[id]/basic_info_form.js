"use client"
import { ProForm, ProFormText } from "@ant-design/pro-components"
import { Spin, message } from "antd"
import MonacoEditor from '@monaco-editor/react'
import { useEffect, useState } from "react"
import { clazz } from "@/api"
import useSWR from "swr"
import { getUser } from "@/store/session"

export default function BasicClassInfoForm({ id, onUpdate }) {
    const [form] = ProForm.useForm()
    const [description, setDescription] = useState('')
    const [messageApi, contextHolder] = message.useMessage();
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const [updating, setUpdating] = useState(false);
    const { data: me } = useSWR('me', getUser)
    const { data, error, isLoading } = useSWR(refreshKey, (key) => {
        if (id === 'new') {
            return clazz.getClass(1)
        }
        return clazz.getClass(id)
    })

    useEffect(() => {
        if (!data) {
            return
        }
        form.setFieldsValue(data)
        setDescription(data.description)
    }, [data, form])

    const onFinish = async (values) => {
        const updateData = {
            name: values.name,
            description: values.description
        }
        if (updating) {
            return
        }
        messageApi.open({
            key: 'update_class',
            type: 'loading',
            content: '正在更新...'
        })
        setUpdating(true)

        try {
            let newId = id
            if (id === 'new') {
                newId = await clazz.createClass(updateData)
            } else {
                await clazz.updateClass(id, updateData)
            }
            setUpdating(false)
            if (onUpdate) {
                onUpdate(newId)
            }
            messageApi.open({
                key: 'update_class',
                type: 'success',
                content: '更新成功'
            })
            setRefreshKey(refreshKey + 1)
        } catch (e) {
            setUpdating(false)
            messageApi.open({
                key: 'update_class',
                type: 'error',
                content: '更新失败'
            })
        }
    }

    return (
        <>
            {contextHolder}
            <p className={"text-gray-500 mt-2"}>
                {id === 'new' && <>
                    在新增班级时，班级的任务配置将默认继承模板班级的任务配置，任课老师可以进入班级来修改任务配置。<br />
                    点击下方“提交”按钮创建班级后，您可以对班级授课教师和学生进行配置。<br />
                </>}
                班级介绍支持<b> markdown </b>，若您不了解<b> markdown </b>语法，可参考：
                <a href="https://www.markdown.xyz/basic-syntax/" target="_blank" className="underline">Markdown 语法说明</a>
            </p>
            <div className={"mt-5 p-5 bg-white rounded-md max-w-[1024px]"}>
                <Spin spinning={isLoading}>
                    <ProForm form={form} onReset={() => {
                        if (id === 'new') {
                            form.resetFields()
                        } else {
                            form.setFieldsValue(data)
                            setDescription(data.description)
                        }
                    }} onFinish={onFinish}>
                        <ProFormText
                            label="班级名称"
                            name="name"
                            required
                            placeholder="班级名称，长度不超过50个字符"
                            rules={[{ required: true, max: 50 }]}
                            disabled={me?.user_type !== 'admin'}
                        />
                        <ProForm.Item
                            label="班级介绍"
                            name="description"
                            required
                            tooltip="班级介绍，长度不超过1000个字符，支持markdown格式"
                            rules={[{ required: true, max: 1000 }]}
                        >
                            <div className="border-[rgb(217, 217, 217)] rounded-md border border-[1px] overflow-hidden">
                                <MonacoEditor
                                    language="markdown"
                                    theme="vs-light"
                                    value={description}
                                    height={600}
                                    width={'100%'}
                                    options={{
                                        selectOnLineNumbers: true,
                                    }}
                                    onChange={(value) => {
                                        form.setFieldsValue({ description: value })
                                        setDescription(value)
                                    }}
                                />
                            </div>
                        </ProForm.Item>
                    </ProForm>
                </Spin>
            </div>
        </>
    )
}
