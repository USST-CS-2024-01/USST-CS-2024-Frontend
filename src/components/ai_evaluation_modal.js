"use client"

import { Modal } from "antd";
import { useState } from "react";

export default function AiEvaluationModal({ fileId, children }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return <>
        <div onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
        }}>
            {children}
        </div>

        <Modal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            title="文档AI评估"
            centered
            footer={null}
        >


        </Modal>
    </>
}