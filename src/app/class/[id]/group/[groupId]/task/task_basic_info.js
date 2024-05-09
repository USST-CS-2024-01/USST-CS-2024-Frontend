"use client"
import FileList from "@/components/file_list";
import { timestampToTime } from "@/util/string";
import Markdown from "react-markdown";

export default function TaskBasicInfo({ task }) {
    return <>

        <h2 className="text-gray-800 text-lg font-bold">
            ## 任务描述
        </h2>
        <div className="mt-2">
            <Markdown className="text-gray-700">
                {task?.content}
            </Markdown>
        </div>

        <h2 className="text-gray-800 text-lg font-bold mt-5">
            ## 任务交付者
        </h2>
        <div className="mt-2">
            <span className="text-gray-700 font-bold">
                {task?.role?.role_name}：
            </span>
            <span className="text-gray-700">
                {task?.role?.role_description}
            </span>
        </div>

        <h2 className="text-gray-800 text-lg font-bold mt-5">
            ## 任务截止时间
        </h2>
        <div className="mt-2">
            <span className="text-gray-700">
                {task?.deadline ? timestampToTime(task?.deadline * 1000) : '无截止'}
            </span>
        </div>

        <h2 className="text-gray-800 text-lg font-bold mt-5">
            ## 任务附件
        </h2>
        <div className="mt-2">
            <FileList
                files={task?.attached_files || []}
                disabled={true}
            />
        </div>
    </>
}