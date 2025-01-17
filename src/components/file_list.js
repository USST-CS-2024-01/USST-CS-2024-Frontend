"use client";

import { renderFileIcon } from "@/util/file";
import { Button } from "antd";
import { file as fileApi } from "@/api/index";
import {
    DeleteOutlined,
    DownloadOutlined,
    CloudSyncOutlined
} from "@ant-design/icons";

export default function FileList({ files, onChange, disabled = false }) {

    return <>
        {
            files.length > 0 &&
            <div className="flex flex-col rounded-md border-[1px] border-gray-200">
                {files.map((file) => {
                    return (
                        <div key={file.id} className="flex items-center justify-between hover:bg-gray-100 px-3 py-0.5 transition duration-300 ease-in-out">
                            <span >
                                {renderFileIcon(file.name)}{" "}
                                {file.name}
                            </span>
                            <div>
                                {file.file_type === 'document' && <Button
                                    onClick={() => {
                                        fileApi.getOnlineEditLink(file.id).then((url) => {
                                            if (url) {
                                                window.open(url)
                                            }
                                        })
                                    }}
                                    type="link"
                                    icon={<CloudSyncOutlined />}
                                />}
                                <Button
                                    onClick={() => {
                                        fileApi.downloadFile(file.id).then((url) => {
                                            if (url) {
                                                window.open(url)
                                            }
                                        })
                                    }}
                                    type="link"
                                    icon={<DownloadOutlined />}
                                />
                                {!disabled &&
                                    <Button
                                        onClick={() => {
                                            onChange(files.filter((item) => item.id !== file.id))
                                        }}
                                        icon={<DeleteOutlined />}
                                        danger
                                        type="link"
                                    />
                                }
                            </div>
                        </div>
                    )
                })}
            </div>
        }
    </>
}