"use client"

import { file } from "@/api";
import { Button, Modal } from "antd";
import { useState } from "react";
import useSWR from "swr";
import {
    LoadingOutlined,
    OpenAIOutlined
} from "@ant-design/icons";

export default function AiEvaluationModal({ fileId, children }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(null);

    const { data: evaluationData } = useSWR(refreshKey, async () => {
        try {
            return await file.getAiEvaluationResult(fileId);
        } catch (e) {
            return null;
        }
    }, {
        refreshInterval: 5000
    });

    return <>
        <div onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
            setRefreshKey(Math.random() * Date.now());
        }}>
            {children}
        </div>

        <Modal
            open={isModalOpen}
            onCancel={() => {
                setIsModalOpen(false)
                setRefreshKey(null);
            }}
            title="文档AI评估"
            centered
            footer={null}
        >
            {!evaluationData && <div className="flex flex-col items items-center justify-center p-10 gap-5">
                <div>
                    暂无评估结果。点击下方按钮开始评估。
                </div>

                <Button
                    type="primary"
                    onClick={async () => {
                        await file.createAiEvaluationTask(fileId);
                        setRefreshKey(Math.random() * Date.now());
                    }}
                    icon={<OpenAIOutlined />}
                >
                    开始评估
                </Button>
            </div>}

            {evaluationData?.status === 'pending' && <div className="flex items items-center justify-center p-10">
                <div className="flex items-center text-base gap-2">
                    <LoadingOutlined />
                    评估中...
                </div>

                <Button
                    type="link"
                    onClick={async () => {
                        await file.retryAiEvaluationTask(fileId);
                        setRefreshKey(Math.random() * Date.now());
                    }}
                >
                    重试
                </Button>
            </div>}


            {evaluationData?.status === 'failed' && <div className="flex items items-center justify-center p-10">
                <div>
                    <span className="text-red-500">评估失败: </span>
                    <span className="text-red-500">{evaluationData?.doc_evaluation?.error}</span>
                </div>

                <Button
                    type="link"
                    onClick={async () => {
                        await file.retryAiEvaluationTask(fileId);
                        setRefreshKey(Math.random() * Date.now());
                    }}
                >
                    重试
                </Button>
            </div>}

            {evaluationData?.status === 'completed' && <div className="flex flex-col items items-start justify-start py-5 gap-5">
                <div className="flex text-base gap-2 font-semibold text-gray-600">
                    评估结果：{evaluationData?.overall_score} / 100
                </div>

                <div className="flex gap-2">
                    {evaluationData?.doc_evaluation?.comment}
                </div>
            </div>}
        </Modal>
    </>
}