'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('') // 搜尋狀態

  useEffect(() => {
    fetchRes()
  }, [])

  async function fetchRes() {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setRestaurants(data)
  }

  // 過濾邏輯：名稱或地點符合搜尋字串
  const filteredRes = restaurants.filter(res => 
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res.location && res.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <main className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-orange-600">🍴 我的美食私藏庫</h1>
        <Link href="/add" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 shadow-lg">
          + 新增食評
        </Link>
      </div>

      {/* 搜尋框 */}
      <div className="mb-8">
        <input 
          type="text"
          placeholder="搜尋餐廳名稱或地點..."
          className="w-full p-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRes.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-10">找不到相關紀錄...</p>
        ) : (
          filteredRes.map((res) => (
            <div key={res.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition">
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
                  {/* 地圖整合：點擊地點開啟 Google Maps */}
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.location + ' ' + res.name)}`}
                    target="_blank"
                    className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded hover:underline"
                  >
                    📍 {res.location || '點擊搜尋地圖'}
                  </a>
                </div>
                <Link href={`/restaurant/${res.id}`} className="text-orange-500 text-sm font-semibold hover:underline block text-right">
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