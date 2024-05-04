"use client"
import { Breadcrumb, Button, Input, Modal, Popconfirm, Tag, Tooltip, Table, Checkbox } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { CLASS_MENU, getBreadcrumbItems } from '@/util/menu';
import { useRouter } from 'next-nprogress-bar';
import { clazz } from '@/api/index';
import { message } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined
} from '@ant-design/icons';
import useSWR from 'swr';
import CardAction from '@/components/card_action';

export default function RoleList({ params }) {
    const [breadcrumb, setBreadcrumb] = useState([]);
    const router = useRouter()
    const [messageApi, contextHolder] = message.useMessage();
    const actionRef = useRef();
    const { id } = params
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const { data: classInfo } = useSWR(refreshKey, () => clazz.getClass(id))

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [isManager, setIsManager] = useState(false);
    const [create, setCreate] = useState(false);
    const [roleId, setRoleId] = useState(null);

    const closeModal = () => {
        setIsModalOpen(false)
        setRoleName('')
        setRoleDescription('')
        setIsManager(false)
        setCreate(false)
        setRoleId(null)
    }

    useEffect(() => {
        setBreadcrumb(getBreadcrumbItems(globalThis.location.pathname, CLASS_MENU, router, id))
    }, [router, id])

    const FILE_COLUMNS = [
        {
            title: '角色名',
            dataIndex: 'role_name',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
            width: 150,
            render(text, record, _, action) {
                return <>
                    <Tooltip title={record.role_name}>
                        <div className="flex items-center break-all break-words truncate">
                            {
                                record.is_manager &&
                                <Tag color='red'>组长</Tag>
                            }
                            <span className="break-all break-words">
                                {record.role_name}
                            </span>
                        </div>
                    </Tooltip>
                </>
            }
        },
        {
            title: '角色描述',
            dataIndex: 'role_description',
            ellipsis: true,
            hideInSearch: true,
            disable: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 120,
            align: "center",
            disable: true,
            render: (text, record, _, action) => {
                const action_list = [
                    <Tooltip title={'编辑'} key={'edit'}>
                        <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setIsModalOpen(true)
                                setCreate(false)
                                setRoleName(record.role_name)
                                setRoleDescription(record.role_description)
                                setIsManager(record.is_manager)
                                setRoleId(record.id)
                            }}
                        >
                        </Button>
                    </Tooltip>,
                    <Popconfirm
                        placement="left"
                        key={'delete'}
                        title="确定删除这个角色吗?"
                        onConfirm={async () => {
                            messageApi.open({
                                key: 'delete_file',
                                type: 'loading',
                                content: '正在删除...'
                            })
                            try {
                                await clazz.deleteRole(id, record.id)
                                messageApi.open({
                                    key: 'delete_file',
                                    type: 'success',
                                    content: '删除成功'
                                })
                                action.reload()
                            } catch (e) {
                                messageApi.open({
                                    key: 'delete_file',
                                    type: 'error',
                                    content: e?.message || '删除失败'
                                })
                            }
                        }}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title={'删除'}>
                            <Button
                                shape="circle"
                                icon={<DeleteOutlined />}
                                danger
                                disabled={classInfo?.status !== 'not_started'}
                            >
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                ]

                return <>
                    <div className="flex gap-2 content-center justify-center">
                        {action_list}
                    </div>
                </>
            },
        },
    ];

    return (
        <div className={"p-10"}>
            <Breadcrumb items={breadcrumb} />
            <h1 className={"text-2xl font-bold mt-2"}>班级角色</h1>
            {contextHolder}

            {classInfo?.status === 'not_started' && <div className="mt-5">
                <CardAction
                    title={<>
                        <h2 className="text-lg font-bold">启动班级</h2>
                    </>}
                    description={<>
                        当前班级处于初始阶段，请对班级的角色和任务进行设置，设置完成后请点击开始按钮启动班级。<br />
                        一个班级中有且只能有一个组长角色，组长角色将拥有小组的管理权限。<br />
                        <b>请注意：</b>启动后，将无法新增和删除班级角色信息，且不能修改组长，因此，请确保角色设置正确。<br />
                    </>}
                    buttonTitle={"启动班级"}
                    onClick={() => {
                        messageApi.open({
                            key: 'start',
                            type: 'loading',
                            content: '正在启动...'
                        })
                        clazz.switchToGroupStage(id).then(() => {
                            messageApi.open({
                                key: 'start',
                                type: 'success',
                                content: '启动成功'
                            })
                            setRefreshKey(Date.now() + 1)
                        }).catch((e) => {
                            messageApi.open({
                                key: 'start',
                                type: 'error',
                                content: e?.message || '启动失败'
                            })
                        })
                    }}
                />
            </div>}

            <Modal
                title={create ? '新建角色' : '编辑角色'}
                centered
                open={isModalOpen}
                onOk={async () => {
                    if (!roleName) {
                        messageApi.error('请输入角色名')
                        return
                    }
                    if (create) {
                        try {
                            await clazz.createRole(id, {
                                role_name: roleName,
                                role_description: roleDescription,
                                is_manager: isManager
                            })
                            messageApi.success('创建成功')
                            closeModal()
                            actionRef.current?.reload()
                        } catch (e) {
                            messageApi.error(e?.message || '创建失败')
                        }
                    } else {
                        try {
                            await clazz.updateRole(id, roleId, {
                                role_name: roleName,
                                role_description: roleDescription,
                                is_manager: isManager
                            })
                            messageApi.success('更新成功')
                            closeModal()
                            actionRef.current?.reload()
                        } catch (e) {
                            messageApi.error(e?.message || '更新失败')
                        }
                    }
                }}
                onCancel={closeModal}
            >
                <div className="mb-5 mt-5">
                    <Input
                        placeholder="角色名"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                    />
                </div>
                <div className="mb-5">
                    <Input.TextArea
                        placeholder="角色描述"
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        rows={4}
                    />
                </div>
                <div className="mb-5">
                    <Checkbox
                        checked={isManager}
                        onChange={(e) => setIsManager(e.target.checked)}
                        disabled={classInfo?.status !== 'not_started'}
                    >
                        是否为组长（只能有一个组长角色）
                    </Checkbox>
                </div>
            </Modal>

            <ProTable
                className="mt-5"
                columns={FILE_COLUMNS}
                cardBordered
                request={async (params, sort, filter) => {
                    const data = await clazz.getRoleList(id);
                    return {
                        data,
                        total: data.length,
                        success: true
                    };
                }}
                editable={false}
                actionRef={actionRef}
                columnsState={{
                    persistenceKey: 'scs:class:role-list-table',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        option: { fixed: 'right', disable: true },
                    },
                    onChange(value) {
                        console.log('value: ', value);
                    },
                }}
                rowKey="id"
                search={false}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                pagination={{
                    pageSize: 20,
                }}
                dateFormatter="string"
                toolBarRender={() => [
                    <Button
                        key="new"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            setIsModalOpen(true)
                            setCreate(true)
                            setRoleName('')
                            setRoleDescription('')
                            setIsManager(false)
                            setRoleId(null)
                        }}
                        disabled={classInfo?.status !== 'not_started'}
                    >
                        新建角色
                    </Button>
                ]}
            />
        </div>
    )
}