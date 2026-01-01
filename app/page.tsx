'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [restaurants, setRestaurants] = useState<any[]>([])

  useEffect(() => {
    async function fetchRes() {
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setRestaurants(data)
    }
    fetchRes()
  }, [])

  return (
    <main className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50 text-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-600">🍴 我的美食私藏庫</h1>
        <Link href="/add" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition">
          + 新增食評
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {restaurants.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-10">目前還沒有紀錄，快去新增吧！</p>
        ) : (
          restaurants.map((res) => (
            <div key={res.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              {res.image_url && (
                <img src={res.image_url} alt={res.name} className="h-48 w-full object-cover" />
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold">{res.name}</h2>
                  <span className="text-yellow-500 font-bold">★ {res.rating}</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">{res.type}</span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">📍 {res.location || '未知'}</span>
                </div>
                <Link href={`/restaurant/${res.id}`} className="text-blue-500 text-sm font-semibold hover:underline">
                  查看詳細菜式 →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}