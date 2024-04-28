"use client"

import { user } from '@/api/index';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const me = await user.getMeUser();
      router.push('/manage');
    })()
  })
}
