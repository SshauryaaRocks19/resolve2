"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { FloatingMenu } from "@/components/FloatingMenu"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 md:px-8 relative">
                {/* Left: Menu Button */}
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Menu</span>
                    </Button>
                    <FloatingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
                </div>

                {/* Center: Logo */}
                <div className="absolute left-1/2 -translate-x-1/2 transform">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-serif text-2xl tracking-widest text-foreground">
                            reSOLVE
                        </span>
                    </Link>
                </div>

                {/* Right: Login + Theme Toggle */}
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="default">Log in</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}
