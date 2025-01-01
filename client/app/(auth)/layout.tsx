const AuthLayout = ({ children }: { children:  React.JSX.Element }) => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            {children}
        </div>
    )
}

export default AuthLayout;