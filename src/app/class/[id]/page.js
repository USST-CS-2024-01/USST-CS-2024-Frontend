"use client"
import { clazz } from "@/api";
import { getAnnouncementList } from "@/api/announcement";
import { getMyGroupMember } from "@/api/group";
import { getUser } from "@/store/session";
import { timestampToTime } from "@/util/string";
import { Alert, Tour } from "antd";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";


export default function ClassHomePage({ params }) {
    const { id } = params;
    const { data: classData, error, mutate } = useSWR(`/class/${id}`, async () => {
        return await clazz.getClass(id);
    });
    const { data: myMember } = useSWR('myClassMember', async () => {
        const data = await getMyGroupMember(id);
        console.log(data);
        return data;
    });
    const { data: me } = useSWR('me', getUser);

    const { data: announcements } = useSWR(`/class/${id}/announcement`, async () => {
        const data = await getAnnouncementList({ class_id: id, pageSize: 3 });
        return data?.data;
    });
    const groupingCard = useRef(null);

    const groupingSteps = [
        {
            title: '加入小组！',
            description: '当前处于组队阶段，您可以加入一个小组或者创建一个小组。点击此处可跳转至组队页面。',
            target: () => groupingCard.current,
        }
    ];
    const [groupingTour, setGroupingTour] = useState(false);

    useEffect(() => {
        if (!classData || !myMember) {
            return;
        }
        if (me?.user_type !== 'student') { return; }
        if (localStorage.getItem(`scs:tour:groupingTour_${id}`)) {
            return;
        }
        if (classData?.status === 'grouping' && myMember?.status === null) {
            setGroupingTour(true);
        }
    }, [classData, myMember, id, me]);

    const router = useRouter();

    useEffect(() => {
        if (me?.user_type !== 'student') {
            router.push(`/class/${id}/announcement`);
        }
    }, [me, router, id]);

    return (
        <>
            <Tour open={groupingTour} onClose={() => {
                setGroupingTour(false)
                localStorage.setItem(`scs:tour:groupingTour_${id}`, 'true');
            }} steps={groupingSteps} />


            <div className="p-10 max-w-[1200px] bg-white rounded-md m-5 mb-0 hover:shadow-md">
                <h2 className="text-2xl font-bold">
                    {(new Date()).getHours() < 12 ? '早上好' : '下午好'}, {me?.name}!
                </h2>
            </div>

            <div className="p-5 max-w-[1200px] flex gap-5 min-h-[200px]">
                {me?.user_type === 'student' &&
                    <div className="bg-white rounded-md p-3 py-5 min-w-[380px] hover:shadow-md cursor-pointer" ref={groupingCard}>
                        <div className="flex items-center">
                            <h2 className="text-lg font-bold px-2">我的小组</h2>
                        </div>
                        {classData?.status === 'grouping' && <div className="mt-3">
                            <Alert
                                message="当前处于组队阶段"
                                type="warning"
                                showIcon
                            />
                        </div>}
                        <div className="mt-3 border rounded h-[100px] flex items-center justify-center">
                            {myMember?.status === 'approved' && <div className="text-green-500 px-5"
                                onClick={() => {
                                    router.push(`/class/${id}/group/${myMember?.group_id}`);
                                }}
                            >
                                您已加入小组，点击此处可以快速进入小组页面
                            </div>}
                            {myMember?.status === 'leader_review' && <div className="text-gray-400 px-5"
                                onClick={() => {
                                    router.push(`/class/${id}/grouping`);
                                }}
                            >
                                您已提交小组申请，请等待组长审核
                            </div>}
                            {myMember?.status === 'member_review' && <div className="text-red-500 px-5"
                                onClick={() => {
                                    router.push(`/class/${id}/grouping`);
                                }}
                            >
                                您收到了小组邀请，请点击此处查看
                            </div>}
                            {!myMember?.status && <div className="text-orange-500 px-5"
                                onClick={() => {
                                    router.push(`/class/${id}/grouping`);
                                }}
                            >
                                您还未加入小组，点击此处可以查看小组列表
                            </div>}
                        </div>
                    </div>
                }

                <div
                    className="bg-white rounded-md p-3 py-5 min-w-[380px] hover:shadow-md cursor-pointer"
                    onClick={() => {
                        router.push(`/class/${id}/announcement`);
                    }}
                >
                    <div className="flex items-center">
                        <h2 className="text-lg font-bold px-2">班级公告</h2>
                    </div>
                    <div className="mt-3 border rounded">
                        <ul>
                            {announcements?.sort((a, b) => a.read - b.read).map((item, index) => {
                                return <li key={item.id} className={`flex justify-between items-center py-2 px-5 ${index !== 0 ? 'border-t border-gray-200' : ''} ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                                    <div>
                                        {item?.read === false && <span className="text-red-500">[未读] </span>}
                                        <span className="truncate">{item.title}</span>
                                    </div>
                                    <div className="text-gray-400">
                                        {timestampToTime(item?.publish_time * 1000)}
                                    </div>

                                </li>
                            })}
                        </ul>

                        {announcements?.length === 0 && <div className="text-gray-400 flex items-center justify-center h-40">
                            暂无公告
                        </div>}
                    </div>
                </div>


            </div>
        </>
    )
}