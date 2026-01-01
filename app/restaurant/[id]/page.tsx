'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function RestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) // 取得網址上的餐廳 ID
  const [res, setRes] = useState<any>(null)
  const [dishes, setDishes] = useState<any[]>([])
  const [dishName, setDishName] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    async function fetchData() {
      // 1. 抓取餐廳基本資料
      const { data: resData } = await supabase.from('restaurants').select('*').eq('id', id).single()
      if (resData) setRes(resData)

      // 2. 抓取這間餐廳的所有菜式
      const { data: dishData } = await supabase.from('dishes').select('*').eq('restaurant_id', id)
      if (dishData) setDishes(dishData)
    }
    fetchData()
  }, [id])

  const addDish = async () => {
    if (!dishName) return
    const { error } = await supabase.from('dishes').insert([
      { restaurant_id: id, dish_name: dishName, comment: comment }
    ])
    if (!error) {
      location.reload() // 簡單處理：儲存後刷新頁面
    }
  }

  if (!res) return <div className="p-10 text-black">載入中...</div>

  return (
    <main className="p-8 max-w-2xl mx-auto text-black min-h-screen bg-white">
      <Link href="/" className="text-orange-500 mb-4 block">← 返回清單</Link>
      
      <h1 className="text-3xl font-bold mb-2">{res.name}</h1>
      <p className="text-gray-500 mb-6">📍 {res.location} | ⭐ {res.rating}星</p>

      {/* 新增菜式表單 */}
      <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-dashed border-gray-300">
        <h3 className="font-bold mb-3 text-sm text-gray-600">新增菜式評論</h3>
        <input 
          className="border p-2 w-full mb-2 rounded" 
          placeholder="菜名 (例如：特製黑王拉麵)" 
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
        />
        <textarea 
          className="border p-2 w-full mb-2 rounded" 
          placeholder="味道如何？必點嗎？" 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={addDish} className="bg-orange-500 text-white px-4 py-2 rounded font-bold w-full">儲存菜評</button>
      </div>

      {/* 顯示菜式清單 */}
      <h2 className="text-xl font-bold mb-4">吃過的菜式</h2>
      <div className="space-y-4">
        {dishes.length === 0 && <p className="text-gray-400">還沒有紀錄任何菜色。</p>}
        {dishes.map((d) => (
          <div key={d.id} className="border-b pb-4">
            <h4 className="font-bold text-lg text-orange-600">● {d.dish_name}</h4>
            <p className="text-gray-700 mt-1">{d.comment}</p>
          </div>
        ))}
      </div>
    </main>
  )
}