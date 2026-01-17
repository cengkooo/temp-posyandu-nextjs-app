import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Announcement } from '@/types'

export default async function TestDB() {
  const supabase = await createServerSupabaseClient()
  
  const { data: announcements, error } = await supabase
    .from('announcements')
    .select('*')
    .limit(5)

  // TypeScript sekarang tau announcements adalah Announcement[]
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      {error ? (
        <div className="text-red-500">Error: {error.message}</div>
      ) : (
        <div>
          <p className="text-green-500">✓ Connection successful!</p>
          <p className="mt-2">Announcements count: {announcements?.length || 0}</p>
          
          {announcements && announcements.length > 0 && (
            <div className="mt-4">
              <h2 className="font-semibold">Announcements:</h2>
              <ul className="list-disc pl-6">
                {announcements.map((announcement: Announcement) => (
                  <li key={announcement.id}>
                    {announcement.title} - {announcement.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}