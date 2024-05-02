import { Button, Modal } from "antd";
import { ExclamationCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";

export default function CardAction({ title, description, buttonTitle, onClick, danger }) {
    const { confirm } = Modal

    return <div className={"mt-5 border-[1px] rounded-md " + (danger ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-700 border-gray-200")}>
        <div className="flex items-center justify-center px-2 gap-5">
            <div>
                <div className="p-2 text-base font-bold pb-1">
                    {title}
                </div>
                <div className="p-2 text-sm pt-0">
                    {description}
                </div>
            </div>
            <div className="flex flex-grow justify-end content-end items-end pr-4">
                <Button
                    danger={danger}
                    onClick={async () => {
                        confirm({
                            title: title,
                            content: '请确认是否执行此操作',
                            onOk: onClick,
                            centered: true,
                            icon: danger ? <ExclamationCircleOutlined /> : <QuestionCircleOutlined />,
                            okType: danger ? 'danger' : 'primary',
                        })
                    }}
                >
                    {buttonTitle}
                </Button>
            </div>
        </div>
    </div>
}