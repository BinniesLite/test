export default function Layout({ children }: {children: React.ReactNode}) {
    return (
        <div className="nondashboard-layout">
          
            <main className="nondashboard-layout__main">
                {children}
            </main>
           
        </div>
    )
}