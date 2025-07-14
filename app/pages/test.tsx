export default function Test() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>CollabFlow Test Page</h1>
      <p>If you see this, Vercel is working!</p>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
    </div>
  )
}