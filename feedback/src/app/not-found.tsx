import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'semibold', marginBottom: '1.5rem' }}>Page Not Found</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '28rem' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/" style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        textDecoration: 'none'
      }}>
        Go back home
      </Link>
    </div>
  );
} 