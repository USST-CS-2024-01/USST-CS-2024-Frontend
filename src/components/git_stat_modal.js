"use client"

import { Modal, Table } from "antd";
import { useState, useEffect } from "react";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import UserAvatar from "@/components/avatar";

Chart.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function GitStatModal({ record, children }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pieData, setPieData] = useState(null);
    const [barData, setBarData] = useState(null);
    const [tableData, setTableData] = useState(null);

    useEffect(() => {
        if (!record) {
            console.error("Record is undefined");
            return;
        }

        const { commit_stats, code_line_stats, user_repo_mapping } = record;

        if (!commit_stats || !code_line_stats || !user_repo_mapping) {
            console.error("Record is missing necessary data");
            return;
        }

        // 1. 合并邮箱对应的用户信息
        const userContributions = {};

        Object.keys(commit_stats).forEach(email => {
            const user = user_repo_mapping[email];
            const userName = user ? `${user?.name}(${user?.employee_id})` : '其他用户';
            if (!userContributions[userName]) {
                userContributions[userName] = { commits: 0, codeLines: 0 };
            }
            userContributions[userName].commits += commit_stats[email] || 0;
            userContributions[userName].codeLines += code_line_stats[email] || 0;
        });

        // 2. 计算每个用户的提交数和代码行数
        const userNames = Object.keys(userContributions);
        const shorterUserNames = userNames.map(userName => userName.split('(')[0]);
        const commitCounts = userNames.map(userName => userContributions[userName]?.commits || 0);
        const codeLineCounts = userNames.map(userName => userContributions[userName]?.codeLines || 0);

        const totalCommits = commitCounts.reduce((acc, cur) => acc + cur, 0);
        const totalCodeLines = codeLineCounts.reduce((acc, cur) => acc + cur, 0);

        const comprehensiveCounts = userNames.map(userName => {
            const { commits, codeLines } = userContributions[userName];
            return (commits / totalCommits * 0.4 + codeLines / totalCodeLines * 0.6) * 100;
        });

        // 3. 饼图数据
        const newPieData = {
            labels: userNames,
            datasets: [{
                data: comprehensiveCounts,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            }],
        };

        // 4. 水平柱状图数据
        const newBarData = {
            labels: shorterUserNames,
            datasets: [
                {
                    label: '提交次数',
                    data: commitCounts,
                    backgroundColor: '#36A2EB',
                    xAxisID: 'x-axis-1',
                },
                {
                    label: '代码行数',
                    data: codeLineCounts,
                    backgroundColor: '#FFCE56',
                    xAxisID: 'x-axis-2',
                },
            ],
        };

        setPieData(newPieData);
        setBarData(newBarData);

        // 5. 表格数据，以email为单位查询   
        const newTableData = Object.keys(commit_stats).map(email => {
            const user = user_repo_mapping[email];
            return {
                key: email,
                user: user,
                email,
                commits: commit_stats[email],
                codeLines: code_line_stats[email],
            };
        });

        setTableData(newTableData);
    }, [record]);

    const barOptions = {
        indexAxis: 'y',
        scales: {
            'x-axis-1': {
                id: 'x-axis-1',
                type: 'linear',
                position: 'bottom',
            },
            'x-axis-2': {
                id: 'x-axis-2',
                type: 'linear',
                position: 'top',
                ticks: {
                    beginAtZero: true,
                },
            }
        }
    };

    const pieOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`;
                    }
                }
            },
            legend: {
                labels: {
                    generateLabels: function (chart) {
                        const data = chart.data;
                        return data.labels.map((label, index) => ({
                            text: `${label}: ${data.datasets[0].data[index].toFixed(2)}%`,
                            fillStyle: data.datasets[0].backgroundColor[index],
                            hidden: false,
                            index: index
                        }));
                    }
                }
            }
        }
    };

    const TABLE_COLUMNS = [
        {
            title: 'Git账号',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
        },
        {
            title: '用户',
            dataIndex: 'user',
            key: 'user',
            ellipsis: true,
            render: (text, record) => <div className="flex items-center">
                {record.user && <UserAvatar user={record.user} size={24} />}
                <span className="ml-2">{record.user?.name || '其他用户'}</span>
            </div>,
            align: 'center',
        },
        {
            title: '提交次数',
            dataIndex: 'commits',
            key: 'commits',
            align: 'center',
            sorter: (a, b) => a.commits - b.commits,
        },
        {
            title: '代码行数',
            dataIndex: 'codeLines',
            key: 'codeLines',
            align: 'center',
            sorter: (a, b) => a.codeLines - b.codeLines,
        }
    ];

    return (
        <>
            <span onClick={(e) => {
                setIsModalOpen(true);
                e.stopPropagation();
            }}>
                {children}
            </span>

            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                title="Git统计"
                centered
                footer={null}
                width={850}
            >
                <div className="max-h-[500px] overflow-y-auto">
                    <div className="p-5 flex gap-5">
                        <div>
                            <h2 className="mb-3 font-semibold text-gray-500">用户贡献百分比</h2>
                            {pieData && <Pie data={pieData} options={pieOptions} width={350} height={350} />}
                        </div>

                        <div>
                            <h2 className="mb-3 font-semibold text-gray-500">提交次数和代码行数比较</h2>
                            {barData && <Bar data={barData} options={barOptions} width={350} height={350} />}
                        </div>
                    </div>

                    <div className="p-5 text-gray-500">
                        <h2 className="font-semibold text-gray-500">数据说明</h2>
                        <p>用户贡献百分比 = (提交次数 / 总提交次数 * 0.4 + 代码行数 / 总代码行数 * 0.6) * 100%</p>
                    </div>

                    <div className="px-5">
                        <h2 className="mb-3 font-semibold text-gray-500">统计信息</h2>
                        <Table
                            columns={TABLE_COLUMNS}
                            dataSource={tableData}
                            pagination={false}
                            size="small"
                        />
                    </div>
                </div>

            </Modal>
        </>
    );
}
