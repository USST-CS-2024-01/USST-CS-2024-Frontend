import { Modal } from "antd"
import { useState } from "react"
import ClassMemberSelect from "./class_member_select"

export default function UserSelectModal({
    classId,
    groupId = null,
    returnType = 'memberId',
    children,
    title = "选择成员",
    onSelect
}) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return <>
        <div onClick={() => setIsModalOpen(true)}>
            {children}
        </div>

        <Modal
            title={title}
            centered
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
        >
            <div className="pt-3">
                <ClassMemberSelect
                    value={[]}
                    mode="multiple"
                    classId={classId}
                    returnType={returnType}
                    onChange={(value) => {
                        onSelect(value[0]?.value)
                        setIsModalOpen(false)
                    }}
                    style={{ width: '100%' }}
                    placeholder={"在此快速搜索用户"}
                />
            </div>
        </Modal>
    </>
}