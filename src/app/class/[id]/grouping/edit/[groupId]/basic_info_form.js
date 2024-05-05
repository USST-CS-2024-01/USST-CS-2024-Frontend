"use client"
import { ProForm, ProFormText } from "@ant-design/pro-components"
import { message } from "antd"
import { useEffect, useState } from "react"
import { group } from "@/api"
import useSWR from "swr"
import { getUser } from "@/store/session"
import ClassMemberSelect from "@/components/class_member_select"

export default function BasicGroupInfoForm({ classId, groupId, onUpdate, groupInfo }) {
    const [form] = ProForm.useForm()
    const [messageApi, contextHolder] = message.useMessage();
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const [updating, setUpdating] = useState(false);
    const [leader, setLeader] = useState(null)
    const { data: me } = useSWR('me', getUser)

    useEffect(() => {
        if (!groupInfo) {
            return
        }
        form.setFieldsValue(groupInfo)

        const leader = groupInfo.members.find((item) => item.roles.find((role) => role.is_manager))
        setLeader(leader.id)

    }, [groupInfo, form])

    const onFinish = async (values) => {
        const updateData = {
            name: values.name,
            leader: leader?.length > 0 ? leader[0]?.value : null
        }
        if (me?.user_type === 'student') {
            updateData.leader = me?.id
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
            let newId = groupId
            if (groupId === 'new') {
                const newGroup = await group.createClassGroup(classId, updateData)
                newId = newGroup.id
            } else {
                await group.updateClassGroup(classId, groupId, updateData)
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
            console.error(e)
            setUpdating(false)
            messageApi.open({
                key: 'update_class',
                type: 'error',
                content: e?.message || '更新失败'
            })
        }
    }

    return (
        <>
            {contextHolder}
            <div className={"mt-5 p-5 bg-white rounded-md max-w-[500px]"}>
                <ProForm form={form} onReset={() => {
                    if (groupId === 'new') {
                        form.resetFields()
                    } else {
                        form.setFieldsValue(groupInfo)
                    }
                }} onFinish={onFinish}>
                    <ProFormText
                        label="小组名称"
                        name="name"
                        required
                        placeholder="小组名称，长度不超过50个字符"
                        rules={[{ required: true, max: 50 }]}
                    />
                    {
                        (me?.user_type !== 'student' && groupId === 'new') &&
                        <ProForm.Item
                            label="小组组长"
                            name="leader"
                            required
                            tooltip="您可以指定小组组长，但该组长目前需要不属于任何小组。"
                            rules={[{ required: true }]}
                        >
                            <ClassMemberSelect
                                mode="multiple"
                                value={leader}
                                placeholder={"快速搜索用户以添加"}
                                onChange={(value) => {
                                    if (value.length > 1) {
                                        value = value.slice(0, 1)
                                        messageApi.error("只能选择一个组长")
                                    }
                                    setLeader(value)
                                }}
                                style={{
                                    width: '100%'
                                }}
                                classId={classId}
                                returnType="userId"
                            />
                        </ProForm.Item>
                    }
                </ProForm>
            </div>
        </>
    )
}
