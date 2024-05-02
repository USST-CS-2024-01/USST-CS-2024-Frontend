"use client"

import { user } from '@/api/index';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const me = await user.getMeUser();
      router.push('/manage');
    })()
  })

  return (
    <div className='flex justify-center items-center h-screen gap-5 text-gray-500'>
      <LoadingOutlined style={{ fontSize: 24 }} spin />
      <span>正在载入...</span>
    </div>
  )
}
