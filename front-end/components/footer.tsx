export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
                <span className="font-black tracking-tighter text-lg">reSOLVE</span>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Built with love &copy; {new Date().getFullYear()}
                </p>
            </div>
        </footer>
    )
}
