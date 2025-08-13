'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      fetch(`https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/user/single-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // if API checks auth
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.name) {
            setLoggedIn(true);
            setUserName(data.user.name);
          } else {
            setLoggedIn(false);
            setUserName('');
          }
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
          setLoggedIn(false);
          setUserName('');
        });
    } else {
      setLoggedIn(false);
      setUserName('');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setLoggedIn(false);
    setUserName('');
    setIsMenuOpen(false);
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow">
      {/* Logo */}
      <div className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
        <span className="ml-2 font-bold">Barber Syndicate</span>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/product">Products</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      {/* Auth Section */}
      <div className="hidden md:flex items-center gap-4">
        {loggedIn ? (
          <>
            <span>Welcome, {userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-500"
            >
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 md:hidden">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="/product" onClick={() => setIsMenuOpen(false)}>Products</Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          {loggedIn ? (
            <>
              <span>Welcome, {userName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-500"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
