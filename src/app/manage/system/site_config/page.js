"use client"
import Image from 'next/image'
import { Breadcrumb, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { ProForm, ProFormText, ProFormTextArea, ProTable } from '@ant-design/pro-components';
import { MANAGE_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next/navigation';
import { site_config } from '@/api/index';
import { LoadingOutlined } from '@ant-design/icons';
import { message } from 'antd';

import useSWR from 'swr';

const CONFIG_MODEL = [
    {
        title: '站点设置',
        description: '站点设置相关配置项。',
        configs: {
            'course:title': {
                title: '课程标题',
                value: 'input',
                description: '课程标题，将显示在页面标题上。',
            }
        }
    },
    {
        title: 'Git仓库分析配置',
        description: 'Git仓库分析功能相关配置项。',
        configs: {
            'git:ssh_public_key': {
                title: 'SSH公钥',
                value: 'textarea',
                description: '用于访问Git仓库的SSH公钥，该公钥将被公开，学生需要在对应的代码托管平台将该公钥配置为可信公钥。',
            },
            'git:ssh_private_key': {
                title: 'SSH私钥',
                value: 'textarea',
                description: '用于访问Git仓库的SSH私钥，该私钥不会被公开。',
            },
        }
    },
    {
        title: 'OpenAI 配置',
        description: 'OpenAI API 相关配置项，OpenAI用于交付文档的分析功能。',
        configs: {
            'openai:endpoint': {
                title: 'API Endpoint',
                value: 'input',
                description: 'OpenAI API的Endpoint地址，默认为https://api.openai.com/。',
            },
            'openai:secret_key': {
                title: 'API Key',
                value: 'input',
                description: 'OpenAI API的API Key，用于访问OpenAI API。',
            },
            'openai:model': {
                title: '模型名称',
                value: 'input',
                description: 'OpenAI API的Model名称，默认为 gpt-4-turbo。',
            },
            'openai:prompt': {
                title: '提示词',
                value: 'textarea',
                description: '文档分析功能的提示词，默认不需要修改。',
            },
        }

    }
]

export default function SiteConfig() {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data, error, isLoading } = useSWR(refreshKey, (key) => site_config.getAllConfig())
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = ProForm.useForm();
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, MANAGE_MENU, router))
    }, [router])

    useEffect(() => {
        for (let index in data) {
            const configItem = data[index]
            form.setFieldValue(configItem.key, configItem.value)
        }
    }, [data, form])

    useEffect(() => {
        if (!error) {
            return
        }
        messageApi.open({
            type: 'error',
            content: error?.toString()
        });
    }, [error, messageApi])

    const onFinish = async (values) => {
        if (updating) {
            return
        }

        const changedFields = []
        for (let index in data) {
            const configItem = data[index]
            if (configItem.value !== values[configItem.key]) {
                changedFields.push({
                    key: configItem.key,
                    value: values[configItem.key]
                })
            }
        }
        if (changedFields.length === 0) {
            messageApi.open({
                key: 'site_config',
                type: 'info',
                content: '没有修改任何配置项'
            });
            return
        }

        messageApi.open({
            key: 'site_config',
            type: 'loading',
            content: '正在保存配置项'
        });
        setUpdating(true)

        try {
            for (let index in changedFields) {
                const configItem = changedFields[index]
                await site_config.updateConfig(configItem.key, configItem.value)
            }
            messageApi.open({
                key: 'site_config',
                type: 'success',
                content: '保存成功'
            });
        } catch (error) {
            messageApi.open({
                key: 'site_config',
                type: 'error',
                content: error?.toString()
            });
        }
        setUpdating(false)
        setRefreshKey(refreshKey + 1)
    }

    return <div className={"p-10"}>
        <Breadcrumb items={breadcrumb} />
        <h1 className={"text-2xl font-bold mt-2"}>参数配置</h1>
        {contextHolder}
        <div className={"mt-5 p-5 bg-white rounded-md"}>
            <Spin spinning={isLoading}>
                <ProForm form={form} onReset={() => {
                    for (let index in data) {
                        const configItem = data[index]
                        form.setFieldValue(configItem.key, configItem.value)
                    }
                }} onFinish={onFinish}>
                    {CONFIG_MODEL.map((group, index) => {
                        return <ProForm.Group key={index} title={group.title} tooltip={group.description} size={8}>
                            {Object.keys(group.configs).map((key, index) => {
                                const config = group.configs[key]
                                switch (config.value) {
                                    case 'input':
                                        return <ProFormText
                                            key={index}
                                            name={key}
                                            label={config.title}
                                            placeholder={config.title}
                                            tooltip={config.description}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入' + config.title + '!',
                                                },
                                            ]}
                                            width={'lg'}
                                        />
                                    case 'textarea':
                                        return <ProFormTextArea
                                            key={index}
                                            name={key}
                                            label={config.title}
                                            placeholder={config.title}
                                            tooltip={config.description}
                                            fieldProps={{
                                                rows: 10
                                            }}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '请输入' + config.title + '!',
                                                },
                                            ]}
                                            width={'lg'}
                                        />
                                }
                            })}
                        </ProForm.Group>
                    })}
                </ProForm>
            </Spin>
        </div>
    </div>

}