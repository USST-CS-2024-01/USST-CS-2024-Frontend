"use client";
import { getSiteConfig } from '@/store/site_config';
import {
    LockOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    LoginForm,
    ProConfigProvider,
    ProFormText,
} from '@ant-design/pro-components';
import { message, theme } from 'antd';
import { useEffect, useState } from 'react';
import { auth } from '@/api/index';
import { setLoginSession } from '@/store/session';
import { useRouter } from 'next/navigation'

const Page = ({ router }) => {
    const [siteConfig, setSiteConfig] = useState({});
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        (async () => {
            setSiteConfig(
                await getSiteConfig()
            )
        })()
    }, []);

    const doLogin = async (values) => {
        if (loading) {
            return;
        }
        try {
            setLoading(true);
            messageApi.open({
                key: "login",
                type: 'loading',
                content: 'Loading...',
            });

            const login_session = await auth.initAuth();
            const result = await auth.login(values.username, values.password, login_session);

            setLoginSession(result);
            messageApi.open({
                key: "login",
                type: 'success',
                content: '登录成功',
            })

            router.push('/');
        } catch (error) {
            messageApi.open({
                key: "login",
                type: 'error',
                content: error?.message || '登录失败',
            })
        }

        setLoading(false);
    }

    return (
        <div
            style={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: 'url(/bg.webp)',
            }}
            className={"flex items-center justify-center flex-col h-[100vh]"}
        >
            {contextHolder}
            <div className={"p-5 rounded-lg shadow-lg shadow-md backdrop-blur-md"}>
                <LoginForm
                    logo="/icon.png"
                    title='登录'
                    subTitle={siteConfig['course:title'] ?? '软件协同设计A'}
                    onFinish={doLogin}
                >

                    <ProFormText
                        name="username"
                        fieldProps={{
                            size: 'large',
                            prefix: (
                                <UserOutlined
                                    style={{
                                        color: token.colorText,
                                    }}
                                    className={'prefixIcon'}
                                />
                            ),
                        }}
                        placeholder={'用户名'}
                        rules={[
                            {
                                required: true,
                                message: '请输入用户名!',
                            },
                        ]}
                    />
                    <ProFormText.Password
                        name="password"
                        fieldProps={{
                            size: 'large',
                            prefix: (
                                <LockOutlined
                                    style={{
                                        color: token.colorText,
                                    }}
                                    className={'prefixIcon'}
                                />
                            ),
                        }}
                        placeholder={'密码'}
                        rules={[
                            {
                                required: true,
                                message: '请输入密码！',
                            },
                        ]}
                    />
                </LoginForm>
            </div>
        </div>
    );
};

export default function Login() {
    const router = useRouter();

    return (
        <ProConfigProvider light>
            <Page router={router} />
        </ProConfigProvider>
    );
};