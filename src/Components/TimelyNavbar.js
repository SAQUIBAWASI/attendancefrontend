// import { Menu, User, Phone, X, Users, Briefcase, Building, Heart } from 'lucide-react'
// import { useState } from 'react'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import logo from "../Images/logo2.png"

// const TimelyNavbar = () => {
//     const [isOpen, setIsOpen] = useState(false)
//     const location = useLocation()
//     const navigate = useNavigate()
//     const [isPartnersOpen, setIsPartnersOpen] = useState(false)

//     const navItems = [
//         { name: 'Home', path: '/' },
//         { name: 'About Us', path: '/about' },
//         { name: 'Services', path: '/service' },
//         { name: 'Who We Serve', path: '/whoweserve' },
//         { name: 'Contact Us', path: '/contact' },
//         {name : 'Products', path: '/products' },
//         {name :'Plans', path: '/plans'}
//     ]

//     const partnersItems = [
//         { name: 'Partner With Us', path: '/partners', icon: <Users className="w-4 h-4" /> },
//         { name: 'Join as Member', path: '/membership', icon: <Heart className="w-4 h-4" /> },
//     ]

//     const isActive = (path) => location.pathname === path

//     const handleWhatsApp = () => {
//         window.open(
//             'https://wa.me/919010481048?text=Hello! I would like to know more about Timely Health services.',
//             '_blank'
//         )
//     }

//     const handleCall = () => {
//         window.location.href = 'tel:+919010481048'
//     }

//     const handleLogin = () => {
//         navigate("/employee-login")
//     }

//     return (
//         <nav className="sticky top-0 z-50 bg-white shadow-lg">
//             <div className="no-underline px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 font-calibri">
//                 <div className="flex items-center justify-between h-16">
//                     {/* Logo */}
//                     <Link to="/" className="no-underline flex items-center space-x-2">
//                         <div className="flex items-center justify-center h-12 w-30">
//                             <img
//                                 src={logo}
//                                 alt="Timely Health Logo"
//                                 className="object-contain w-full h-full"
//                             />
//                         </div>
//                     </Link>

//                     {/* Desktop Navigation */}
//                     <div className="items-center hidden space-x-6 md:flex">
//                         {navItems.map((item) => (
//                             <Link
//                                 key={item.name}
//                                 to={item.path}
//                                 className={`px-3 py-2 rounded-md no-underline text-sm font-bold transition-colors ${
//                                     isActive(item.path)
//                                         ? 'text-green-600 bg-blue-50'
//                                         : 'text-blue-700 hover:text-blue-600 hover:bg-blue-50'
//                                 }`}
//                             >
//                                 {item.name}
//                             </Link>
//                         ))}

//                         {/* Partners/Members Dropdown */}
//                         <div className="relative">
//                             <button
//                                 onClick={() => setIsPartnersOpen(!isPartnersOpen)}
//                                 onMouseEnter={() => setIsPartnersOpen(true)}
//                                 onMouseLeave={() => setIsPartnersOpen(false)}
//                                 className={`px-3 py-2 rounded-md no-underline text-sm font-bold transition-colors flex items-center gap-1 ${
//                                     location.pathname.includes('/partners') || 
//                                     location.pathname.includes('/membership') || 
//                                     location.pathname.includes('/corporate-partners') || 
//                                     location.pathname.includes('/providers')
//                                         ? 'text-green-600 bg-blue-50'
//                                         : 'text-blue-700 hover:text-blue-600 hover:bg-blue-50'
//                                 }`}
//                             >
//                                 <Users size={16} />
//                                 Partners/Members
//                                 <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                                 </svg>
//                             </button>

//                             {isPartnersOpen && (
//                                 <div 
//                                     className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
//                                     onMouseEnter={() => setIsPartnersOpen(true)}
//                                     onMouseLeave={() => setIsPartnersOpen(false)}
//                                 >
//                                     {partnersItems.map((item) => (
//                                         <Link
//                                             key={item.name}
//                                             to={item.path}
//                                             onClick={() => setIsPartnersOpen(false)}
//                                             className={`flex items-center gap-3 px-4 py-2.5 no-underline text-sm transition-colors ${
//                                                 isActive(item.path)
//                                                     ? 'text-green-600 bg-blue-50'
//                                                     : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
//                                             }`}
//                                         >
//                                             <span className="text-blue-600">{item.icon}</span>
//                                             {item.name}
//                                         </Link>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Action Icons */}
//                     <div className="items-center hidden space-x-3 md:flex">
//                         <button
//                             style={{ backgroundColor: "#007a52" }}
//                             onClick={handleLogin}
//                             className="flex items-center gap-2 justify-center px-4 h-10 text-white rounded-full border border-gray-400 shadow hover:bg-gray-800 transition"
//                         >
//                             <User size={18} />
//                             Login
//                         </button>
//                         <button
//                             onClick={handleCall}
//                             className="flex items-center justify-center w-10 h-10 transition bg-white rounded-full shadow hover:shadow-md"
//                         >
//                             <Phone size={18} className="text-blue-600" />
//                         </button>
//                         <button
//                             onClick={handleWhatsApp}
//                             className="flex items-center justify-center w-10 h-10 transition bg-white rounded-full shadow hover:shadow-md"
//                         >
//                             <img
//                                 src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
//                                 alt="WhatsApp"
//                                 className="w-6 h-6"
//                             />
//                         </button>
//                     </div>

//                     {/* Mobile menu button */}
//                     <div className="md:hidden">
//                         <button
//                             onClick={() => setIsOpen(!isOpen)}
//                             className="text-gray-700 hover:text-blue-600 focus:outline-none"
//                         >
//                             {isOpen ? <X size={24} /> : <Menu size={24} />}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Mobile Navigation */}
//                 {isOpen && (
//                     <div className="md:hidden">
//                         <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t sm:px-3">
//                             {navItems.map((item) => (
//                                 <Link
//                                     key={item.name}
//                                     to={item.path}
//                                     onClick={() => setIsOpen(false)}
//                                     className={`block no-underline px-3 py-2 rounded-md text-base font-bold transition-colors ${
//                                         isActive(item.path)
//                                             ? 'text-green-600 bg-blue-50'
//                                             : 'text-blue-700 hover:text-blue-600 hover:bg-blue-50'
//                                     }`}
//                                 >
//                                     {item.name}
//                                 </Link>
//                             ))}

//                             {/* Partners/Members Section in Mobile */}
//                             <div className="mt-2 border-t border-gray-200 pt-2">
//                                 <div className="px-3 py-2 text-sm font-bold text-blue-700 flex items-center gap-2">
//                                     <Users size={16} />
//                                     Partners & Members
//                                 </div>
//                                 {partnersItems.map((item) => (
//                                     <Link
//                                         key={item.name}
//                                         to={item.path}
//                                         onClick={() => setIsOpen(false)}
//                                         className={`flex items-center gap-3 no-underline px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                                             isActive(item.path)
//                                                 ? 'text-green-600 bg-blue-50'
//                                                 : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
//                                         }`}
//                                     >
//                                         <span className="text-blue-600">{item.icon}</span>
//                                         {item.name}
//                                     </Link>
//                                 ))}
//                             </div>

//                             <div className="flex flex-row gap-3 pt-4">
//                                 <button
//                                     style={{ backgroundColor: "#007a52" }}
//                                     onClick={handleLogin}
//                                     className="flex items-center gap-2 justify-center px-4 h-10 text-white rounded-full border border-gray-400 shadow hover:bg-gray-800 transition"
//                                 >
//                                     <User size={18} />
//                                     Login
//                                 </button>
//                                 <button
//                                     onClick={handleCall}
//                                     className="flex items-center justify-center w-10 h-10 transition bg-white rounded-full shadow hover:shadow-md"
//                                 >
//                                     <Phone size={18} className="text-blue-600" />
//                                 </button>
//                                 <button
//                                     onClick={handleWhatsApp}
//                                     className="flex items-center justify-center w-10 h-10 transition bg-white rounded-full shadow hover:shadow-md"
//                                 >
//                                     <img
//                                         src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
//                                         alt="WhatsApp"
//                                         className="w-6 h-6"
//                                     />
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </nav>
//     )
// }

// export default TimelyNavbar






import { Menu, User, Phone, X, Users, Heart, ChevronDown, Mail } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from "../Images/logo2.png"

const TimelyNavbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isPartnersOpen, setIsPartnersOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const dropdownRef = useRef(null)
    const timeoutRef = useRef(null)

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsPartnersOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [location.pathname])

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Services', path: '/service' },
        { name: 'Solutions', path: '/whoweserve' },
        { name: 'Products', path: '/products' },
        { name: 'Pricing', path: '/plans' },
    ]

    const partnersItems = [
        { name: 'Partner With Us', path: '/partners', icon: <Users className="w-4 h-4" /> },
        { name: 'Join as Member', path: '/membership', icon: <Heart className="w-4 h-4" /> },
    ]

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    const isPartnersActive = () => {
        return partnersItems.some(item => location.pathname === item.path)
    }

    const handleWhatsApp = () => {
        window.open(
            'https://wa.me/919010481048?text=Hello! I would like to know more about Timely Health services.',
            '_blank'
        )
    }

    const handleCall = () => {
        window.location.href = 'tel:+919010481048'
    }

    const handleLogin = () => {
        navigate("/employee-login")
    }

    const handleDropdownEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setIsPartnersOpen(true)
    }

    const handleDropdownLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsPartnersOpen(false)
        }, 200)
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled 
                ? 'bg-white/95 backdrop-blur-md shadow-lg' 
                : 'bg-white shadow-sm'
        }`}>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo - Left Side */}
                    <Link 
                        to="/" 
                        className="flex items-center flex-shrink-0 transition-opacity hover:opacity-80"
                    >
                        <div className="flex items-center justify-center h-14 w-36">
                            <img
                                src={logo}
                                alt="Timely Health"
                                className="object-contain w-full h-full"
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation - Center */}
                    <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:px-8">
                        <div className="flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`px-4 py-2.5 rounded-lg no-underline text-sm font-medium transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Partners Dropdown */}
                            <div 
                                className="relative"
                                ref={dropdownRef}
                                onMouseEnter={handleDropdownEnter}
                                onMouseLeave={handleDropdownLeave}
                            >
                                <button
                                    className={`px-4 py-2.5 rounded-lg no-underline text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                        isPartnersActive() || isPartnersOpen
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Users size={16} className="flex-shrink-0" />
                                    <span>Partners</span>
                                    <ChevronDown 
                                        size={16} 
                                        className={`transition-transform duration-200 ${
                                            isPartnersOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {isPartnersOpen && (
                                    <div 
                                        className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn"
                                        onMouseEnter={handleDropdownEnter}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        {partnersItems.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.path}
                                                className={`flex items-center gap-3 px-4 py-3 no-underline text-sm font-medium transition-all duration-200 ${
                                                    isActive(item.path)
                                                        ? 'text-green-600 bg-green-50'
                                                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="text-gray-400">
                                                    {item.icon}
                                                </span>
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Contact Info - Desktop */}
                        {/* <div className="hidden lg:flex lg:items-center lg:gap-2 lg:mr-2">
                            <a 
                                href="tel:+919010481048" 
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                            >
                                <Phone size={16} className="text-green-600" />
                                <span className="font-medium">+91 90104 81048</span>
                            </a>
                            <div className="w-px h-6 bg-gray-200"></div>
                        </div> */}

                        {/* Action Buttons */}
                        <button
                            onClick={handleLogin}
                            className="hidden lg:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                            style={{ backgroundColor: "#007a52" }}
                        >
                            <User size={18} />
                            Login
                        </button>

                        <button
                            onClick={handleWhatsApp}
                            className="hidden lg:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                            style={{ backgroundColor: "#25D366" }}
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                alt="WhatsApp"
                                className="w-5 h-5"
                            />
                            Chat
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2.5 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="py-4 space-y-1 border-t border-gray-100">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`block px-4 py-3 rounded-lg no-underline text-base font-medium transition-all duration-200 ${
                                    isActive(item.path)
                                        ? 'text-green-600 bg-green-50'
                                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Partners Section - Mobile */}
                        <div className="mt-2 border-t border-gray-100 pt-2">
                            <div className="px-4 py-2.5 text-sm font-semibold text-gray-500 flex items-center gap-2">
                                <Users size={16} />
                                <span>Partners</span>
                            </div>
                            {partnersItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg no-underline text-base font-medium transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-gray-400">
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Contact Info */}
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                            <a 
                                href="tel:+919010481048" 
                                className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Phone size={18} className="text-green-600" />
                                <span className="font-medium">+91 90104 81048</span>
                            </a>
                            
                            <div className="flex items-center gap-3 px-4">
                                <button
                                    onClick={handleLogin}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md"
                                    style={{ backgroundColor: "#007a52" }}
                                >
                                    <User size={18} />
                                    Login
                                </button>
                                <button
                                    onClick={handleWhatsApp}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-full transition-all duration-200 shadow-md"
                                    style={{ backgroundColor: "#25D366" }}
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                        alt="WhatsApp"
                                        className="w-5 h-5"
                                    />
                                    Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </nav>
    )
}

export default TimelyNavbar