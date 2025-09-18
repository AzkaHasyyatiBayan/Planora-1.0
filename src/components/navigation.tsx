'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Grid3X3, User, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check login token (simulasi sederhana)
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const linkClass = (path: string, isMobile: boolean = false) => {
    const baseClass = isMobile 
      ? 'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200'
      : 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200'
    
    return pathname === path
      ? `${baseClass} bg-purple-600 text-white shadow-lg`
      : `${baseClass} text-purple-700 hover:bg-purple-100 hover:text-purple-700`
  }

  const menuItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/tasks', label: 'Tugas', icon: CheckSquare },
    { path: '/matrix', label: 'Matrix', icon: Grid3X3 },
    { path: isLoggedIn ? '/account' : '/login', label: 'Akun', icon: User }
  ]

  return (
    <>
      <nav className="sticky top-0 w-full bg-white backdrop-blur-md border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">🧠</span>
              </div>
              <span className="font-bold text-xl text-purple-700">
                Planora
              </span>
            </div>

            {/* Desktop Menu Items */}
            <div className="hidden md:flex items-center space-x-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link 
                    key={item.path} 
                    href={item.path} 
                    className={linkClass(item.path)}
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-purple-700 hover:bg-purple-100 transition-all duration-200"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={linkClass(item.path, true)}
                  onClick={closeMobileMenu}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}
    </>
  )
}