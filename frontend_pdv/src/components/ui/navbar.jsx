import React, { useRef, useEffect, useContext, useState } from 'react'
import { ArrowLeftIcon, LogoutIcon, MenuIcon, Package2Icon, PrintIcon, SearchIcon } from './icons'
import { UsersIcon } from './icons'
import { AuthContext } from '../../services/Auth/AuthContext'
import { ConfirmModal } from './ConfirmModal'

const Navbar = ({ title, isOpen, toggleSidebar }) => {
	const dropdownRef = useRef(null) // Referencia al dropdown
	const { user } = useContext(AuthContext)

	// Manejo de clics fuera del dropdown
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				// Cierra el dropdown si se hace clic fuera de él
				dropdownRef.current.open = false // Cierra el dropdown
			}
		}

		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleLogout = () => {
		localStorage.removeItem('user')
		window.location.href = '/login'
	}

	return (
		<header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
			<button
				onClick={() => document.getElementById('main-drawer').click()}
				className="lg:hidden text-gray-600 hover:text-primary"
			>
				<MenuIcon className="w-6 h-6" />
			</button>

      <button 
          onClick={() => toggleSidebar(!isOpen)} 
        className="text-gray-500 hover:text-primary hidden lg:block"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

			<div className="w-full flex-1">
				<h1 className="text-2xl font-semibold">{title}</h1>
			</div>
			<details ref={dropdownRef} className="dropdown dropdown-end">
				<summary className="btn m-1">
					<UsersIcon /> {user.username}
				</summary>
				<ul className="menu dropdown-content bg-white border border-gray-300 rounded-box z-[1] w-52 p-2 shadow-lg right-0">
					{/* <li>
            <a href="/profile"  >
              <UsersIcon className="h-4 w-4" /> Mi Perfil
            </a>
          </li> */}

					<li>
						<a href="" onClick={handleLogout}>
							<ArrowLeftIcon className="h-4 w-4" /> Cerrar Sesión
						</a>
					</li>
				</ul>
			</details>
		</header>
	)
}

export default Navbar
