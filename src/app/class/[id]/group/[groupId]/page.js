"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Tour } from 'antd';

export default function Home({ params }) {
    const router = useRouter();
    const { id, groupId } = params;
    const [tourOpen, setTourOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("scs:tour:group:init")) {
            router.push(`/class/${id}/group/${groupId}/task`);
            return;
        }

        setTourOpen(true);
    }, [id, groupId, router])

    const steps = [
        {
            title: '欢迎来到您的小组！',
            description: '看起来您是第一次来到这里，这里是您的小组页面，在开始之前，让我们了解一下如何使用小组页面的功能吧。',
            target: null,
        },
        {
            title: '01.任务交付',
            description: '任务交付页面展示了您小组目前可以交付的任务，您可以查看任务详情，提交任务，查看任务提交情况。',
            target: null,
            cover: (
                <Image
                    alt='任务交付页面'
                    src={'/tour/group-01.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '01.任务交付',
            description: '每个任务都会指派一个特定的负责人，只有负责人才能提交任务，其他成员可以查看任务详情，但不能提交任务。对于负责人是您的任务，会对角色进行加粗和高亮。',
            target: null,
            cover: (
                <Image
                    alt='任务交付页面'
                    src={'/tour/group-02.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '01.任务交付',
            description: '在任务交付前，每位小组成员都需要完成组内评分，只有组内评分完成后，负责人才能提交任务。',
            target: null,
            cover: (
                <Image
                    alt='任务交付页面'
                    src={'/tour/group-03.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '01.任务交付',
            description: '在交付阶段，负责人可以提交附件或Git仓库作为交付物，在提交并通过组长与教师审核后，任务标记为完成。对于每次提交，都会有提交记录，您可以查看提交记录。',
            target: null,
            cover: (
                <Image
                    alt='任务交付页面'
                    src={'/tour/group-04.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '02. 待办事项',
            description: '待办事项页面展示了您小组目前的待办事项，您可以查看分配给您的待办事项，并进行操作。',
            target: null,
            cover: (
                <Image
                    alt='待办事项页面'
                    src={'/tour/group-05.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '03. 小组会议',
            description: '小组会议页面展示了您小组的会议安排，若您是当前任务负责人，您可以在此处安排会议。',
            target: null,
            cover: (
                <Image
                    alt='小组会议页面'
                    src={'/tour/group-06.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '03. 小组会议',
            description: '点击会议纪要的按钮，可以在线协同编辑会议纪要，会议纪要会被保存在小组空间中。',
            target: null,
            cover: (
                <Image
                    alt='小组会议页面'
                    src={'/tour/group-07.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '04. 小组空间',
            description: '小组空间页面展示了您小组的文件空间，您可以在此处在线协同编辑文档、上传下载文件等。',
            target: null,
            cover: (
                <Image
                    alt='小组空间页面'
                    src={'/tour/group-08.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '05. 编辑小组',
            description: '编辑小组页面展示了小组名称、小组成员等信息。',
            target: null,
            cover: (
                <Image
                    alt='编辑小组页面'
                    src={'/tour/group-09.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '05. 编辑小组',
            description: '组长可以对成员的角色与Git账号进行编辑，Git账号用于在提交Git仓库交付物时，计算工作量。',
            target: null,
            cover: (
                <Image
                    alt='编辑小组页面'
                    src={'/tour/group-10.jpg'}
                    width={1024}
                    height={1024}
                />
            )
        },
        {
            title: '06. 结束',
            description: '这就是小组页面的所有功能，希望您能够顺利完成任务，祝您工作愉快！若您需要重新查看教程，可以点击组名右侧的帮助按钮。',
            target: null
        }
    ]

    return (
        <div className='flex justify-center items-center h-screen gap-5 text-gray-500'>
            <LoadingOutlined style={{ fontSize: 24 }} spin />
            <span>正在载入...</span>
            <Tour steps={steps} open={tourOpen} onClose={() => {
                localStorage.setItem("scs:tour:group:init", true);
                setTourOpen(false);
                router.push(`/class/${id}/group/${groupId}/task`);
            }} />
        </div>
    )
}
