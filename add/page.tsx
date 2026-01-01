'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [rating, setRating] = useState(5)
  const [allCats, setAllCats] = useState<any[]>([])
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 取得資料庫中預設的類別
    async function getCats() {
      const { data } = await supabase.from('categories').select('*')
      if (data) setAllCats(data)
    }
    getCats()
  }, [])

  const save = async () => {
    if (!name) return alert('請輸入餐廳名稱')
    setLoading(true)
    try {
      let imageUrl = ''
      if (file) {
        const fileName = `${Math.random()}.jpg`
        await supabase.storage.from('restaurant-images').upload(fileName, file)
        const { data } = supabase.storage.from('restaurant-images').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

     const { data: resData, error: resError } = await supabase
  .from('restaurants')
  .insert([{ name, location, rating, image_url: imageUrl }])
  .select().single();

if (resData && selectedCats.length > 0) {
  // 將選中的每個類別 ID 都存入關聯表
  const relationData = selectedCats.map(catId => ({
    restaurant_id: resData.id,
    category_id: catId
  }));
  await supabase.from('restaurant_categories').insert(relationData);
}

      alert('收藏成功！✨')
      router.push('/')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-lg mx-auto bg-[#FFF9F5] min-h-screen text-gray-700">
      <h1 className="text-2xl font-black mb-6 text-[#FF8C69] text-center">🧁 新增我的私藏 🍰</h1>
      
      <div className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border-2 border-[#FFDAB9]">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400 ml-2">餐廳名稱</label>
          <input className="w-full p-3 rounded-2xl bg-gray-50 border-none shadow-inner" placeholder="這間店叫什麼呢？" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400 ml-2">地點</label>
          <input className="w-full p-3 rounded-2xl bg-gray-50 border-none shadow-inner" placeholder="📍 哪區？(如: 旺角)" value={location} onChange={(e)=>setLocation(e.target.value)} />
        </div>

        {/* 類別選擇 */}
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-400 ml-2">料理種類 (可多選)</label>
          <div className="flex flex-wrap gap-2">
            {allCats.map(cat => (
              <button 
                key={cat.id}
                onClick={() => selectedCats.includes(cat.id) ? setSelectedCats(selectedCats.filter(id => id !== cat.id)) : setSelectedCats([...selectedCats, cat.id])}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${selectedCats.includes(cat.id) ? 'bg-[#FF8C69] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 星級選擇 */}
        <div>
          <label className="block text-sm font-bold mb-1 text-gray-400 ml-2">總體推薦度</label>
          <div className="flex gap-2 px-2">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={()=>setRating(s)} className={`text-3xl transition ${s <= rating ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}>★</button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <label className="text-xs text-gray-300 block mb-2 ml-2">上傳餐廳門面或環境照：</label>
          <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="text-xs" />
        </div>

        <button onClick={save} disabled={loading} className="w-full py-4 bg-[#FF8C69] text-white rounded-2xl font-black shadow-lg hover:bg-[#FF7F50] transition mt-4">
          {loading ? '正在變魔術...' : '確認收藏 ✨'}
        </button>
      </div>
    </div>
  )
}