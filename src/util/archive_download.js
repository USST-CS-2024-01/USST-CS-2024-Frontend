import JSZip from "jszip";
import { clazz, task, group, file, repo_record } from "@/api";
import { timestampToTime } from "./string";

const zip = new JSZip();

function deliveryFileNameToSimpleFileName(name) {
    // delivery_3_1715666654_978ebeb7-6397-4077-8420-94d8883972a3_第二次组会-会议纪要.docx
    // 第二次组会-会议纪要.docx

    const pattern = /delivery_\d+_\d+_[\w-]+_(.*)/;

    const result = name.match(pattern);
    return result[1];
}

async function downloadTaskArchive(classId, groupId, taskId, deliveryId, c, parentFolder) {
    const callback = c || function () { };

    callback({
        status: 'downloading',
        message: '正在获取数据...',
        progress: 0
    })
    try {
        const deliveryList = (await task.getTaskDeliveryList(classId, groupId, taskId))?.data;
        const groupDetail = await group.getClassGroup(classId, groupId);
        const taskDetail = await task.getClassTask(classId, taskId);
        const meetingRecords = (
            await group.getGroupMeetingList(classId, groupId, {
                task_id: taskId,
                current: 1,
                pageSize: 100
            })
        )?.data;

        callback({
            status: 'downloading',
            message: '正在获取数据...',
            progress: 10
        })

        const total = deliveryList.length + meetingRecords.length;

        let delivery = null;
        if (deliveryId) {
            delivery = deliveryList.find(item => item.id === deliveryId);
        } else {
            delivery = deliveryList[0];
        }

        // 交付物
        const deliveryItems = delivery?.delivery_items;
        const deliveryTime = timestampToTime(delivery?.delivery_time * 1000);
        const folder = parentFolder || zip.folder(`${taskDetail.name}-${groupDetail.name}-${deliveryTime}`);

        for (const item of deliveryItems) {
            if (item?.item_type === 'file') {
                const fileName = deliveryFileNameToSimpleFileName(item?.file?.name);
                const url = await file.downloadFile(item?.file?.id);
                const blob = await fetch(url).then(res => res.blob());
                folder.file(fileName, blob);
            }
            if (item?.item_type === 'repo') {
                const fileName = `代码仓库-${item?.repo?.repo_url.split('/').pop().split('.').shift()}.zip`;
                const url = await repo_record.downloadRepoRecordArchive(classId, groupId, item?.repo?.id);
                const blob = await fetch(url).then(res => res.blob());
                folder.file(fileName, blob);
            }

            callback({
                status: 'downloading',
                message: '正在获取数据...',
                progress: 10 + 90 * (deliveryItems.indexOf(item) + 1) / deliveryItems.length
            })
        }

        // 会议纪要
        for (const record of meetingRecords) {
            const fileName = `会议纪要-${record?.name}.docx`;
            const url = await file.downloadFile(record?.meeting_summary?.id);
            const blob = await fetch(url).then(res => res.blob());
            folder.file(fileName, blob);

            callback({
                status: 'downloading',
                message: '正在获取数据...',
                progress: 10 + 90 * (deliveryItems.length + meetingRecords.indexOf(record) + 1) / total
            })
        }

        callback({
            status: 'success',
            message: `小组 ${groupDetail.name} 的交付物下载成功`,
            progress: 100
        })

        return folder;
    } catch (e) {
        callback({
            status: 'error',
            message: e.message || '下载失败',
            progress: 0
        })
        return;
    }
}


export async function doSingleRecordArchive(classId, groupId, taskId, deliveryId, callback) {
    const folder = await downloadTaskArchive(classId, groupId, taskId, deliveryId, callback);
    const content = await folder.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    return url;
}

export async function doTaskRecordArchive(classId, taskId, callback) {
    callback({
        status: 'downloading',
        message: '正在获取数据...',
        progress: 0
    })

    const groupList = (await group.getClassGroupList(classId))?.data;
    const taskDetail = await task.getClassTask(classId, taskId);

    callback({
        status: 'downloading',
        message: '正在获取数据...',
        progress: 10
    })

    const total = groupList.length;
    const folder = zip.folder(`${taskDetail.name}-所有小组`);

    for (const groupItem of groupList) {
        const groupId = groupItem.id;
        const groupName = groupItem.name;

        const groupFolder = folder.folder(`${taskDetail.name}-${groupName}`)
        await downloadTaskArchive(classId, groupId, taskId, null, callback, groupFolder);

        callback({
            status: 'downloading',
            message: '下载小组 ' + groupName + ' 的交付物...',
            progress: 10 + 90 * (groupList.indexOf(groupItem) + 1) / total
        })
    }

    callback({
        status: 'success',
        message: `所有小组的交付物下载成功`,
        progress: 100
    })

    const content = await folder.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    return url;
}