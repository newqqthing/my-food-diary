'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRes()
  }, [])

async function fetchRes() {
  const { data, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      categories:restaurant_categories(categories(name)),
      dishes(dish_name)
    `)
    .order('created_at', { ascending: false });
  
  if (data) setRestaurants(data);
}

  // 強大搜尋邏輯
const filteredRes = restaurants.filter(res => {
  const s = searchTerm.toLowerCase();
  
  // 檢查餐廳名、地點
  const inBasic = res.name.toLowerCase().includes(s) || res.location?.toLowerCase().includes(s);
  
  // 檢查類別名 (Array.some)
  const inCat = res.categories?.some((c: any) => c.categories.name.toLowerCase().includes(s));
  
  // 檢查菜名 (Array.some)
  const inDish = res.dishes?.some((d: any) => d.dish_name.toLowerCase().includes(s));

  return inBasic || inCat || inDish;
});

  return (
    <main className="p-6 max-w-4xl mx-auto min-h-screen bg-[#FFF9F5] text-gray-700">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-[#FF8C69] tracking-tighter">MyFoodie 🧸</h1>
        <Link href="/add" className="bg-[#FF8C69] text-white px-5 py-2 rounded-2xl font-bold shadow-md hover:scale-105 transition">
          + 新增紀錄
        </Link>
      </div>

      <div className="mb-8">
        <input 
          type="text"
          placeholder="🔍 搜餐廳、搜類別、搜你想吃的菜..."
          className="w-full p-4 rounded-3xl border-none shadow-sm focus:ring-2 focus:ring-[#FF8C69] outline-none bg-white text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRes.map((res) => (
          <div key={res.id} className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-orange-50 hover:shadow-md transition-all">
            {res.image_url && <img src={res.image_url} className="h-48 w-full object-cover" />}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-black text-gray-800">{res.name}</h2>
                <span className="text-yellow-400 font-bold">★ {res.rating}</span>
              </div>
              
              {/* 顯示多個類別標籤 */}
              <div className="flex flex-wrap gap-1 mb-3">
                {res.categories?.map((c: any, i: number) => (
                  <span key={i} className="bg-orange-50 text-[#FF8C69] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    #{c.categories.name}
                  </span>
                ))}
                <span className="bg-blue-50 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  📍 {res.location || '未知'}
                </span>
              </div>

              <Link href={`/restaurant/${res.id}`} className="block text-center py-2 bg-gray-50 text-gray-400 text-xs font-bold rounded-xl hover:bg-orange-50 hover:text-[#FF8C69] transition">
                查看紀錄與菜式 →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}