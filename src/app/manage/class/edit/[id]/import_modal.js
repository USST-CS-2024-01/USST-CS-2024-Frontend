import { Input, Modal } from "antd";
import { useState } from "react";
import { message } from "antd";
import UserSelect from "@/components/user_select";

const { TextArea } = Input;


export default function ImportModal({ children, onImport }) {
    const [inputData, setInputData] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();

    return <>
        {contextHolder}
        <Modal
            title="导入用户"
            centered
            okText="导入"
            maskClosable={false}
            closeIcon={false}
            open={isModalOpen}
            onOk={async () => {
                const ids = inputData.split('\n').map(x => x.trim()).filter(x => x)
                if (ids.length === 0) {
                    messageApi.open({
                        type: "error",
                        key: "import_user",
                        content: `请至少输入一个用户ID`
                    })
                    return;
                }
                try {
                    const result = await onImport(ids);
                    messageApi.open({
                        type: "success",
                        key: "import_user",
                        content: `导入成功${result.success_count}个用户，失败${result.failed_count}个用户`
                    })
                    setInputData('')
                    setIsModalOpen(false)
                } catch (e) {
                    messageApi.open({
                        type: "error",
                        key: "import_user",
                        content: `导入失败: ${e.message}`
                    })
                    return;
                }
            }}
            onCancel={() => {
                setIsModalOpen(false)
                setInputData('')
            }}
        >
            <div className="mb-2 mt-5">
                <UserSelect
                    mode="multiple"
                    value={[]}
                    placeholder={"快速搜索用户以添加"}
                    onChange={(value) => {
                        setInputData(
                            inputData + value.map(x => x.key).join('\n') + '\n'
                        )
                    }}
                    style={{
                        width: '100%'
                    }}
                />
            </div>
            <div className="text-sm text-gray-500 mb-2">在此输入要导入的用户ID，一行一个。</div>
            <TextArea
                type="textarea"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="例如：1234"
                autoSize={{ minRows: 5, maxRows: 10 }}
            />
        </Modal>

        <div onClick={() => setIsModalOpen(true)}>
            {children}
        </div>
    </>
}