"use client"

import { getUser } from "@/store/session"
import { Spin } from "antd"
import useSWR from "swr"
import GroupManagePage from "./manage_page"
import GroupStudentPage from "./student_page"

export default function ClassFileList({ params }) {
    const { data: me, isLoading } = useSWR('me', getUser)

    return <>
        <Spin spinning={isLoading}>
            {me?.user_type !== 'student' && <GroupManagePage params={params} />}
            {me?.user_type === 'student' && <GroupStudentPage params={params} />}
        </Spin>
    </>
}