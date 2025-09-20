'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Grid3X3, User, Menu, X, Calendar } from 'lucide-react'
import { useAuth } from '@/context/authContext'
import UserMenu from './userMenu'

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, loading } = useAuth()

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
    
    // Tambahkan null check untuk pathname
    const isActive = pathname && (
      pathname === path ||
      (path === '/tasks' && pathname.startsWith('/tasks')) ||
      (path === '/matrix' && pathname.startsWith('/matrix')) ||
      (path === '/calendertrack' && pathname.startsWith('/calendertrack')) || // Tambahkan calendertrack
      (path === '/' && pathname === '/')
    )
    
    return isActive
      ? `${baseClass} bg-[#7a6ee0] text-white shadow-lg`
      : `${baseClass} text-[#58508d] hover:bg-[#7a6ee0]/10 hover:text-[#7a6ee0]`
  }

  const menuItems = [
    { path: '/', label: 'Beranda', icon: Home, showAlways: true },
    { path: '/tasks', label: 'Tugas', icon: CheckSquare, showAlways: false },
    { path: '/matrix', label: 'Matrix', icon: Grid3X3, showAlways: false },
    { path: '/calendertrack', label: 'Kalender', icon: Calendar, showAlways: false }, 
  ]

  // Filter menu items based on auth status
  const filteredMenuItems = menuItems.filter(item => 
    item.showAlways || user
  )

  if (loading) {
    return (
      <nav className="sticky top-0 w-full bg-white backdrop-blur-md border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-[#7a6ee0] to-[#58508d] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">🧠</span>
              </div>
              <span className="font-bold text-xl text-[#58508d]">
                Planora
              </span>
            </div>
            
            {/* Loading placeholder */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="sticky top-0 w-full bg-white backdrop-blur-md border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href={user ? "/" : "/"} className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-[#7a6ee0] to-[#58508d] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">🧠</span>
                </div>
                <span className="font-bold text-xl text-[#58508d]">
                  Planora
                </span>
              </Link>
            </div>

            {/* Desktop Menu Items */}
            <div className="hidden md:flex items-center space-x-2">
              {filteredMenuItems.map((item) => {
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
              
              {/* User Menu atau Login Button */}
              {user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-[#58508d] hover:text-[#7a6ee0] transition-colors font-medium"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-[#7a6ee0] text-white rounded-lg hover:bg-[#58508d] transition-colors font-medium"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-[#58508d] hover:bg-[#7a6ee0]/10 transition-all duration-200"
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
            {filteredMenuItems.map((item) => {
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
            
            {/* Mobile Auth Buttons */}
            {user ? (
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-[#58508d] hover:bg-[#7a6ee0]/10 hover:text-[#7a6ee0] transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  <User className="w-5 h-5" />
                  <span>Profil Saya</span>
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center px-4 py-3 rounded-lg font-medium text-[#58508d] border border-[#7a6ee0] hover:bg-[#7a6ee0]/10 transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center px-4 py-3 rounded-lg font-medium text-white bg-[#7a6ee0] hover:bg-[#58508d] transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  Daftar
                </Link>
              </div>
            )}
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