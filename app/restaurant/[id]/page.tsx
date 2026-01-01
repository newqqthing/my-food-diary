'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RestaurantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [res, setRes] = useState<any>(null)
  const [dishes, setDishes] = useState<any[]>([])
  const [dishName, setDishName] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    const { data: resData } = await supabase.from('restaurants').select('*').eq('id', id).single()
    if (resData) setRes(resData)
    const { data: dishData } = await supabase.from('dishes').select('*').eq('restaurant_id', id)
    if (dishData) setDishes(dishData)
  }

  const addDish = async () => {
    if (!dishName) return
    const { error } = await supabase.from('dishes').insert([
      { restaurant_id: id, dish_name: dishName, comment: comment }
    ])
    if (!error) {
      setDishName(''); setComment(''); fetchData()
    }
  }

  // 刪除餐廳功能
  const deleteRestaurant = async () => {
    if (confirm('確定要刪除這間餐廳的所有紀錄嗎？此動作無法復原。')) {
      const { error } = await supabase.from('restaurants').delete().eq('id', id)
      if (!error) {
        alert('已刪除')
        router.push('/')
      }
    }
  }

  if (!res) return <div className="p-10 text-center">載入中...</div>

  return (
    <main className="p-8 max-w-2xl mx-auto text-black min-h-screen bg-white shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-orange-500">← 返回清單</Link>
        <button onClick={deleteRestaurant} className="text-red-400 text-sm hover:text-red-600">刪除餐廳</button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{res.name}</h1>
        <div className="flex items-center gap-3 text-gray-500">
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.location + ' ' + res.name)}`}
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            📍 {res.location} (開啟地圖)
          </a>
          <span>|</span>
          <span className="text-yellow-500">⭐ {res.rating}星</span>
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-2xl mb-10 border border-orange-100">
        <h3 className="font-bold mb-4 text-orange-800">新增菜式評論</h3>
        <input 
          className="border p-3 w-full mb-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" 
          placeholder="菜名 (例如：流沙包)" 
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
        />
        <textarea 
          className="border p-3 w-full mb-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none" 
          placeholder="味道描述..." 
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={addDish} className="bg-orange-500 text-white px-4 py-3 rounded-xl font-bold w-full hover:bg-orange-600 shadow-md">儲存菜評</button>
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
        吃過的菜式
      </h2>
      <div className="space-y-6">
        {dishes.length === 0 && <p className="text-gray-400 italic">還沒有紀錄任何菜色。</p>}
        {dishes.map((d) => (
          <div key={d.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="font-bold text-lg text-gray-800 mb-1">{d.dish_name}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{d.comment}</p>
          </div>
        ))}
      </div>
    </main>
  )
}