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
  
  // 新增菜式的狀態
  const [dishName, setDishName] = useState('')
  const [comment, setComment] = useState('')
  const [dishRating, setDishRating] = useState(5) // 預設 5 星
  const [dishFile, setDishFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    const { data: resData } = await supabase.from('restaurants').select('*').eq('id', id).single()
    if (resData) setRes(resData)
    const { data: dishData } = await supabase.from('dishes').select('*').eq('restaurant_id', id).order('created_at', { ascending: false })
    if (dishData) setDishes(dishData)
  }

  // 儲存菜式（含照片與星星）
  const addDish = async () => {
    if (!dishName) return alert('請輸入菜名')
    setLoading(true)
    let imageUrl = ''

    try {
      if (dishFile) {
        const fileName = `${Math.random()}.jpg`
        const { error: upError } = await supabase.storage.from('restaurant-images').upload(fileName, dishFile)
        if (upError) throw upError
        const { data } = supabase.storage.from('restaurant-images').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      const { error } = await supabase.from('dishes').insert([
        { 
          restaurant_id: id, 
          dish_name: dishName, 
          comment: comment, 
          rating: dishRating, 
          image_url: imageUrl 
        }
      ])
      if (error) throw error
      
      // 重設表單並刷新
      setDishName(''); setComment(''); setDishRating(5); setDishFile(null);
      fetchData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!res) return <div className="p-10 text-center text-pink-300">載入中...💖</div>

  return (
    <main className="p-6 max-w-2xl mx-auto text-gray-700 min-h-screen bg-[#FFF9F5]">
      {/* 頂部導覽 */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-pink-400 font-bold hover:scale-110 transition">← 返回首頁</Link>
        <button onClick={async () => {
          if(confirm('要刪除這間餐廳嗎？')) {
            await supabase.from('restaurants').delete().eq('id', id)
            router.push('/')
          }
        }} className="text-gray-300 text-xs italic">刪除餐廳</button>
      </div>
      
      {/* 餐廳資訊卡片 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-pink-100 mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">{res.name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.location + ' ' + res.name)}`}
            target="_blank"
            className="bg-blue-50 text-blue-500 px-3 py-1 rounded-full text-sm font-bold"
          >
            📍 {res.location || '搜尋地圖'}
          </a>
          <span className="text-yellow-400 font-bold text-lg">★ {res.rating}</span>
        </div>
      </div>

      {/* 可愛的新增菜式表單 */}
      <div className="bg-[#FFEFD5] p-6 rounded-3xl mb-10 border-2 border-dashed border-[#FFDAB9]">
        <h3 className="font-bold mb-4 text-[#CD853F] flex items-center gap-2">📸 紀錄這道美味</h3>
        
        <input 
          className="w-full p-3 mb-3 rounded-2xl border-none shadow-inner focus:ring-2 focus:ring-orange-300" 
          placeholder="菜名 (例如：茄汁豬)" 
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
        />

        {/* 食物星級選擇器 */}
        <div className="flex items-center gap-2 mb-3 px-2">
          <span className="text-sm font-bold text-gray-500">美味評分:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button 
                key={s} 
                onClick={() => setDishRating(s)}
                className={`text-2xl transition-transform active:scale-150 ${s <= dishRating ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <textarea 
          className="w-full p-3 mb-3 rounded-2xl border-none shadow-inner focus:ring-2 focus:ring-orange-300" 
          placeholder="寫下你的靈魂評語..." 
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1 ml-2">上傳食物照片:</label>
          <input type="file" accept="image/*" onChange={(e)=>setDishFile(e.target.files?.[0] || null)} className="text-xs text-gray-500" />
        </div>

        <button 
          onClick={addDish} 
          disabled={loading}
          className="w-full py-3 bg-[#FF8C69] text-white rounded-2xl font-bold shadow-lg hover:bg-[#FF7F50] active:scale-95 transition"
        >
          {loading ? '儲存中...🍰' : '把美味收進口袋'}
        </button>
      </div>

      {/* 菜式列表 */}
      <h2 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-2 ml-2">
        🍛 已解鎖的菜色
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {dishes.length === 0 && <p className="text-gray-400 italic text-center py-10">還沒紀錄任何菜色喔～</p>}
        {dishes.map((d) => (
          <div key={d.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-50 flex gap-4 items-center">
            {d.image_url && (
              <img src={d.image_url} className="w-24 h-24 rounded-2xl object-cover shadow-sm" alt={d.dish_name} />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-gray-800">{d.dish_name}</h4>
                <span className="text-yellow-400 text-sm">{'★'.repeat(d.rating)}</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">{d.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}