'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState('堂食')
  const [location, setLocation] = useState('')
  const [rating, setRating] = useState(5)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!name) return alert('請輸入餐廳名稱')
    setLoading(true)
    let imageUrl = ''

    try {
      // 1. 上傳圖片到 Storage
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('restaurant-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('restaurant-images').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      // 2. 儲存到資料庫 (insert)
      const { error } = await supabase
        .from('restaurants')
        .insert([{ 
          name, 
          type, 
          location, 
          rating, 
          image_url: imageUrl 
        }])
      
      if (error) throw error

      alert('儲存成功！')
      router.push('/') // 儲存後自動回到首頁
    } catch (err: any) {
      alert('發生錯誤: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 max-w-lg mx-auto text-black bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">新增美食紀錄</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">餐廳名稱</label>
          <input className="border p-2 w-full rounded" placeholder="例如：一蘭拉麵" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">地點</label>
          <input className="border p-2 w-full rounded" placeholder="例如：尖沙咀" value={location} onChange={(e)=>setLocation(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">星級 (1-5)</label>
          <input type="number" min="1" max="5" className="border p-2 w-full rounded" value={rating} onChange={(e)=>setRating(Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">用餐方式</label>
          <select className="border p-2 w-full rounded" value={type} onChange={(e)=>setType(e.target.value)}>
            <option>堂食</option>
            <option>外賣</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">餐廳照片</label>
          <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>

        <button 
          onClick={save} 
          disabled={loading}
          className={`w-full py-3 rounded text-white font-bold mt-4 ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          {loading ? '正在儲存...' : '確認儲存'}
        </button>
      </div>
    </div>
  )
}