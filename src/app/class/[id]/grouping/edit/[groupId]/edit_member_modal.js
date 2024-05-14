import { Modal, message } from "antd"
import { useEffect, useState } from "react"
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { clazz, group } from "@/api"

export default function EditMemberModal({
    classId,
    groupId,
    groupMember,
    children,
    onEdit
}) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form] = ProForm.useForm()
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        form.setFieldsValue(groupMember);
        form.setFieldValue('name', `${groupMember?.user?.name}（${groupMember?.user?.employee_id}）`);
        form.setFieldValue('roles', groupMember?.roles.map((item) => item.id))
        form.setFieldValue('git_account', groupMember?.repo_usernames?.join('\n') || '')
    }, [groupMember, form])

    const closeModel = () => {
        form.resetFields()
        setIsModalOpen(false)
    }

    const openModel = () => {
        setIsModalOpen(true)
        if (!groupMember) {
            return
        }
        form.setFieldsValue(groupMember);
        form.setFieldValue('name', `${groupMember?.user?.name}（${groupMember?.user?.employee_id}）`);
        form.setFieldValue('roles', groupMember?.roles.map((item) => item.id))
        form.setFieldValue('git_account', groupMember?.repo_usernames?.join('\n') || '')
    }

    return <>
        <div onClick={openModel}>
            {children}
        </div>
        {contextHolder}

        <Modal
            title={"编辑成员"}
            centered
            open={isModalOpen}
            onCancel={closeModel}
            footer={null}
        >
            <div className="pt-3">
                <ProForm
                    form={form}
                    onFinish={async (values) => {
                        delete values.name
                        let accounts = values.git_account.split('\n').map(x => x.trim()).filter(x => x)
                        values.repo_usernames = accounts
                        values.role_list = values.roles
                        delete values.git_account
                        delete values.roles

                        try {
                            await group.updateGroupMember(classId, groupId, groupMember.id, values)
                            if (onEdit) {
                                onEdit()
                            }
                            messageApi.success('操作成功')
                            closeModel()
                        } catch (e) {
                            messageApi.error(e.message || '操作失败')
                        }
                    }}
                    onReset={() => {
                        form.setFieldsValue(groupMember);
                        form.setFieldValue('name', `${groupMember?.user?.name}（${groupMember?.user?.employee_id}）`);
                        form.setFieldValue('roles', groupMember?.roles.map((item) => item.id))
                        form.setFieldValue('git_account', groupMember?.repo_usernames?.join('\n'))
                    }}
                >
                    <ProFormText
                        label="成员"
                        name="name"
                        disabled
                    />
                    <ProFormSelect
                        required
                        label="角色"
                        name="roles"
                        request={async () => {
                            const result = await clazz.getRoleList(classId);
                            return result.map((item) => ({ label: item.role_name, value: item.id }))
                        }}
                        mode="multiple"
                        tooltip="每个角色在一组中只能有一个成员，组长角色不能修改。"
                        placeholder="请选择角色"
                        rules={[
                            {
                                required: true,
                                message: '请选择角色',
                            },
                        ]}
                    />
                    <ProFormTextArea
                        label="Git 账号"
                        name="git_account"
                        placeholder="请输入 Git 账号，一行一个，用于交付时分析工作量"
                        tooltip="Git 账号通常为各个成员在代码托管平台上的邮箱，例如GitHub的邮箱、GitLab的邮箱等；若有多个账号，请一行一个。"
                    />
                </ProForm>
            </div>
        </Modal>
    </>
}