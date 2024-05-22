"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/manage/class/my_class');
  })

  return (
    <div className='flex justify-center items-center h-screen gap-5 text-gray-500'>
      <LoadingOutlined style={{ fontSize: 24 }} spin />
      <span>正在载入...</span>
    </div>
  )
}
