
// import { Menu, User, Phone, X, Users, Heart, ChevronDown } from 'lucide-react'
// import { useState, useEffect, useRef } from 'react'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import logo from "../Images/logo2.png"

// const TimelyNavbar = () => {
//     const [isOpen, setIsOpen] = useState(false)
//     const [isPartnersOpen, setIsPartnersOpen] = useState(false)
//     const [scrolled, setScrolled] = useState(false)
//     const location = useLocation()
//     const navigate = useNavigate()
//     const dropdownRef = useRef(null)
//     const timeoutRef = useRef(null)

//     // Handle scroll effect
//     useEffect(() => {
//         const handleScroll = () => {
//             setScrolled(window.scrollY > 10)
//         }
//         window.addEventListener('scroll', handleScroll)
//         return () => window.removeEventListener('scroll', handleScroll)
//     }, [])

//     // Handle click outside dropdown
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setIsPartnersOpen(false)
//             }
//         }
//         document.addEventListener('mousedown', handleClickOutside)
//         return () => document.removeEventListener('mousedown', handleClickOutside)
//     }, [])

//     // Close mobile menu on route change
//     useEffect(() => {
//         setIsOpen(false)
//     }, [location.pathname])

//     const navItems = [
//         { name: 'Home', path: '/' },
//         { name: 'About', path: '/about' },
//         { name: 'Services', path: '/service' },
//         { name: 'Solutions', path: '/whoweserve' },
//         { name: 'Products', path: '/products' },
//         { name: 'Pricing', path: '/plans' },
//     ]

//     const partnersItems = [
//         { name: 'Partner With Us', path: '/partners', icon: <Users className="w-4 h-4" /> },
//         { name: 'Join as Member', path: '/membership', icon: <Heart className="w-4 h-4" /> },
//     ]

//     const isActive = (path) => {
//         if (path === '/') return location.pathname === '/'
//         return location.pathname.startsWith(path)
//     }

//     const isPartnersActive = () => {
//         return partnersItems.some(item => location.pathname === item.path)
//     }

//     const handleWhatsApp = () => {
//         window.open(
//             'https://wa.me/919010481048?text=Hello! I would like to know more about Timely Health services.',
//             '_blank'
//         )
//     }

//     const handleLogin = () => {
//         navigate("/employee-login")
//     }

//     const handleDropdownEnter = () => {
//         if (timeoutRef.current) {
//             clearTimeout(timeoutRef.current)
//             timeoutRef.current = null
//         }
//         setIsPartnersOpen(true)
//     }

//     const handleDropdownLeave = () => {
//         timeoutRef.current = setTimeout(() => {
//             setIsPartnersOpen(false)
//         }, 200)
//     }

//     return (
//         <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//             scrolled 
//                 ? 'bg-white/95 backdrop-blur-md shadow-lg' 
//                 : 'bg-white shadow-sm'
//         }`}>
//             <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//                 <div className="flex items-center justify-between h-20">
//                     {/* Logo - Left Side */}
//             <div className="px-2 sm:px-4 mx-auto max-w-7xl lg:px-8">
//                 <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
//                     {/* Logo */}
//                     <Link 
//                         to="/" 
//                         className="flex items-center flex-shrink-0 transition-opacity hover:opacity-80"
//                     >
//                         <div className="flex items-center justify-center h-14 w-36">
//                         <div className="flex items-center justify-center h-10 w-24 sm:h-12 sm:w-28 lg:h-14 lg:w-36">
//                             <img
//                                 src={logo}
//                                 alt="Timely Health"
//                                 className="object-contain w-full h-full"
//                             />
//                         </div>
//                     </Link>


//                     {/* Desktop Navigation - Center */}
//                     <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:px-8">
//                         <div className="flex items-center space-x-1">
//                             {navItems.map((item) => (
//                                 <Link
//                                     key={item.name}
//                                     to={item.path}
//                                     className={`px-4 py-2.5 rounded-lg no-underline text-sm font-medium transition-all duration-200 ${
//                                         isActive(item.path)
//                                             ? 'text-green-600 bg-green-50'
//                                             : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     {item.name}
//                                 </Link>
//                             ))}

//                             {/* Partners Dropdown */}
//                             <div 
//                                 className="relative"
//                                 ref={dropdownRef}
//                                 onMouseEnter={handleDropdownEnter}
//                                 onMouseLeave={handleDropdownLeave}
//                             >
//                                 <button
//                                     className={`px-4 py-2.5 rounded-lg no-underline text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
//                                         isPartnersActive() || isPartnersOpen
//                                             ? 'text-green-600 bg-green-50'
//                                             : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     <Users size={16} className="flex-shrink-0" />
//                                     <span>Partners</span>
//                                     <ChevronDown 
//                                         size={16} 
//                                         className={`transition-transform duration-200 ${
//                                             isPartnersOpen ? 'rotate-180' : ''
//                                         }`}
//                                     />
//                                 </button>

//                                 {isPartnersOpen && (
//                                     <div 
//                                         className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn"
//                                         onMouseEnter={handleDropdownEnter}
//                                         onMouseLeave={handleDropdownLeave}
//                                     >
//                                         {partnersItems.map((item) => (
//                                             <Link
//                                                 key={item.name}
//                                                 to={item.path}
//                                                 className={`flex items-center gap-3 px-4 py-3 no-underline text-sm font-medium transition-all duration-200 ${
//                                                     isActive(item.path)
//                                                         ? 'text-green-600 bg-green-50'
//                                                         : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                                 }`}
//                                             >
//                                                 <span className="text-gray-400">
//                                                     {item.icon}
//                                                 </span>
//                                                 {item.name}
//                                             </Link>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Side Actions */}
//                     <div className="flex items-center gap-3">
//                         {/* Contact Info - Desktop */}
//                         {/* <div className="hidden lg:flex lg:items-center lg:gap-2 lg:mr-2">
//                             <a 
//                                 href="tel:+919010481048" 
//                                 className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
//                             >
//                                 <Phone size={16} className="text-green-600" />
//                                 <span className="font-medium">+91 90104 81048</span>
//                             </a>
//                             <div className="w-px h-6 bg-gray-200"></div>
//                         </div> */}

//                         {/* Action Buttons */}
//                         <button
//                             onClick={handleLogin}
//                             className="hidden lg:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
//                             style={{ backgroundColor: "#007a52" }}
//                         >
//                             <User size={18} />
//                             Login
//                         </button>

//                         <button
//                             onClick={handleWhatsApp}
//                             className="hidden lg:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
//                             style={{ backgroundColor: "#25D366" }}
//                         >
//                             <img
//                                 src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
//                                 alt="WhatsApp"
//                                 className="w-5 h-5"
//                             />
//                             Chat
//                         </button>

//                         {/* Mobile Menu Button */}
//                         <button
//                             onClick={() => setIsOpen(!isOpen)}
//                             className="p-2.5 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 transition-colors"
//                             aria-label="Toggle menu"
//                         >
//                             {isOpen ? <X size={24} /> : <Menu size={24} />}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Mobile Navigation */}
//                 <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
//                     isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
//                 }`}>
//                     <div className="py-4 space-y-1 border-t border-gray-100">
//                         {navItems.map((item) => (
//                             <Link
//                                 key={item.name}
//                                 to={item.path}
//                                 className={`block px-4 py-3 rounded-lg no-underline text-base font-medium transition-all duration-200 ${
//                                     isActive(item.path)
//                                         ? 'text-green-600 bg-green-50'
//                                         : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                 }`}
//                             >
//                                 {item.name}
//                             </Link>
//                         ))}

//                         {/* Partners Section - Mobile */}
//                         <div className="mt-2 border-t border-gray-100 pt-2">
//                             <div className="px-4 py-2.5 text-sm font-semibold text-gray-500 flex items-center gap-2">
//                                 <Users size={16} />
//                                 <span>Partners</span>
//                             </div>
//                             {partnersItems.map((item) => (
//                                 <Link
//                                     key={item.name}
//                                     to={item.path}
//                                     className={`flex items-center gap-3 px-4 py-3 rounded-lg no-underline text-base font-medium transition-all duration-200 ${

//                     {/* Desktop Navigation */}
//                     <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:px-8">
//                         <div className="flex items-center space-x-1">
//                             {navItems.map((item) => (
//                                 <Link
//                                     key={item.name}
//                                     to={item.path}
//                                     className={`px-3 py-1.5 rounded-lg no-underline text-sm font-medium transition-all duration-200 ${

//                                         isActive(item.path)
//                                             ? 'text-green-600 bg-green-50'
//                                             : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     <span className="text-gray-400">
//                                         {item.icon}
//                                     </span>
//                                     {item.name}
//                                 </Link>
//                             ))}
//                         </div>


//                         {/* Mobile Contact Info */}
//                         <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
//                             <a 
//                                 href="tel:+919010481048" 
//                                 className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
//                             >
//                                 <Phone size={18} className="text-green-600" />
//                                 <span className="font-medium">+91 90104 81048</span>
//                             </a>
                            
//                             <div className="flex items-center gap-3 px-4">
//                                 <button
//                                     onClick={handleLogin}
//                                     className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md"
//                                     style={{ backgroundColor: "#007a52" }}
//                             {/* Partners Dropdown */}
//                             <div 
//                                 className="relative"
//                                 ref={dropdownRef}
//                                 onMouseEnter={handleDropdownEnter}
//                                 onMouseLeave={handleDropdownLeave}
//                             >
//                                 <button
//                                     className={`px-3 py-1.5 rounded-lg no-underline text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
//                                         isPartnersActive() || isPartnersOpen
//                                             ? 'text-green-600 bg-green-50'
//                                             : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                     }`}

//                                 >
//                                     <Users size={16} className="flex-shrink-0" />
//                                     <span>Partners</span>
//                                     <ChevronDown 
//                                         size={16} 
//                                         className={`transition-transform duration-200 ${
//                                             isPartnersOpen ? 'rotate-180' : ''
//                                         }`}
//                                     />
//                                 </button>

//                                 {isPartnersOpen && (
//                                     <div 
//                                         className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 animate-fadeIn"
//                                         onMouseEnter={handleDropdownEnter}
//                                         onMouseLeave={handleDropdownLeave}
//                                     >
//                                         {partnersItems.map((item) => (
//                                             <Link
//                                                 key={item.name}
//                                                 to={item.path}
//                                                 className={`flex items-center gap-2 px-3 py-2 no-underline text-sm font-medium transition-all duration-200 ${
//                                                     isActive(item.path)
//                                                         ? 'text-green-600 bg-green-50'
//                                                         : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                                 }`}
//                                             >
//                                                 <span className="text-gray-400">
//                                                     {item.icon}
//                                                 </span>
//                                                 {item.name}
//                                             </Link>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Side Actions */}
//                     <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
//                         {/* Login Button - Icon + Text on all screens, text hidden only on very small */}
//                         <button
//                             onClick={handleLogin}
//                             className="flex items-center justify-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
//                             style={{ backgroundColor: "#007a52" }}
//                         >
//                             <User size={15} />
//                             <span className="hidden sm:inline">Login</span>
//                         </button>

//                         {/* WhatsApp Button - Icon + Text on all screens, text hidden only on very small */}
//                         <button
//                             onClick={handleWhatsApp}
//                             className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
//                             style={{ backgroundColor: "#25D366" }}
//                         >
//                             <img
//                                 src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
//                                 alt="WhatsApp"
//                                 className="w-4 h-4 sm:w-4 sm:h-4"
//                             />
//                             <span className="hidden sm:inline">Chat</span>
//                         </button>

//                         {/* Mobile Menu Button - Always last, visible only on small screens */}
//                         <button
//                             onClick={() => setIsOpen(!isOpen)}
//                             className="p-1.5 sm:p-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 transition-colors"
//                             aria-label="Toggle menu"
//                         >
//                             {isOpen ? <X size={20} className="sm:w-5 sm:h-5" /> : <Menu size={20} className="sm:w-5 sm:h-5" />}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Mobile Navigation */}
//                 <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
//                     isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
//                 }`}>
//                     <div className="py-3 space-y-1 border-t border-gray-100">
//                         {navItems.map((item) => (
//                             <Link
//                                 key={item.name}
//                                 to={item.path}
//                                 className={`block px-4 py-2.5 rounded-lg no-underline text-sm font-medium transition-all duration-200 ${
//                                     isActive(item.path)
//                                         ? 'text-green-600 bg-green-50'
//                                         : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                 }`}
//                             >
//                                 {item.name}
//                             </Link>
//                         ))}

//                         {/* Partners Section - Mobile */}
//                         <div className="mt-2 border-t border-gray-100 pt-2">
//                             <div className="px-4 py-2 text-xs font-semibold text-gray-500 flex items-center gap-2">
//                                 <Users size={14} />
//                                 <span>Partners</span>
//                             </div>
//                             {partnersItems.map((item) => (
//                                 <Link
//                                     key={item.name}
//                                     to={item.path}
//                                     className={`flex items-center gap-3 px-4 py-2.5 rounded-lg no-underline text-sm font-medium transition-all duration-200 ${
//                                         isActive(item.path)
//                                             ? 'text-green-600 bg-green-50'
//                                             : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
//                                     }`}
//                                 >
//                                     <span className="text-gray-400">
//                                         {item.icon}
//                                     </span>
//                                     {item.name}
//                                 </Link>
//                             ))}
//                         </div>

//                         {/* Mobile Contact Info */}
//                         <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
//                             <a 
//                                 href="tel:+919010481048" 
//                                 className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
//                             >
//                                 <Phone size={16} className="text-green-600" />
//                                 <span className="font-medium">+91 90104 81048</span>
//                             </a>
                            
//                             <div className="flex items-center gap-2 px-4">
//                                 <button
//                                     onClick={handleLogin}
//                                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md"
//                                     style={{ backgroundColor: "#007a52" }}
//                                 >
//                                     <User size={16} />
//                                     Login
//                                 </button>
//                                 <button
//                                     onClick={handleWhatsApp}

//                                     className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-full transition-all duration-200 shadow-md"

//                                     className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-full transition-all duration-200 shadow-md"

//                                     style={{ backgroundColor: "#25D366" }}
//                                 >
//                                     <img
//                                         src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
//                                         alt="WhatsApp"

//                                         className="w-5 h-5"

//                                         className="w-4 h-4"

//                                     />
//                                     Chat
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>


//             {/* Styles */}

//             <style jsx>{`
//                 @keyframes fadeIn {
//                     from {
//                         opacity: 0;

//                         transform: translateY(-8px) scale(0.98);

//                         transform: translateY(-6px) scale(0.98);

//                     }
//                     to {
//                         opacity: 1;
//                         transform: translateY(0) scale(1);
//                     }
//                 }
//                 .animate-fadeIn {
//                     animation: fadeIn 0.2s ease-out;
//                 }
//             `}</style>
//         </nav>
//     )
// }

// export default TimelyNavbar




import { Menu, User, Phone, X, Users, Heart, ChevronDown, Calendar } from 'lucide-react'
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

    const handleLogin = () => {
        navigate("/employee-login")
    }

    const handleBookAppointment = () => {
        navigate("/appointment")
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
            <div className="px-2 sm:px-4 mx-auto max-w-7xl lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center flex-shrink-0 transition-opacity hover:opacity-80"
                    >
                        <div className="flex items-center justify-center h-8 w-20 sm:h-12 sm:w-28 md:h-14 md:w-36">
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
                                    className={`px-3 py-2 rounded-lg no-underline text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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
                                    className={`px-3 py-2 rounded-lg no-underline text-sm font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
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
                                                className={`flex items-center gap-2 px-3 py-2.5 no-underline text-sm font-medium transition-all duration-200 ${
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

                    {/* Right Side Actions - Mobile Friendly */}
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 flex-shrink-0">
                        {/* Book Appointment Button - Visible on all screens, smaller on mobile */}
                        <button
                            onClick={handleBookAppointment}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-[10px] sm:text-xs md:text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
                            style={{ backgroundColor: "#0F5C4D" }}
                        >
                            <Calendar size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] flex-shrink-0" />
                            <span className="hidden xs:inline">Book</span>
                            <span className="hidden sm:inline">Appointment</span>
                        </button>

                        {/* Login Button - Visible on md and up */}
                        <button
                            onClick={handleLogin}
                            className="hidden md:flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
                            style={{ backgroundColor: "#007a52" }}
                        >
                            <User size={15} className="flex-shrink-0" />
                            <span>Login</span>
                        </button>

                        {/* WhatsApp Button - Visible on md and up */}
                        <button
                            onClick={handleWhatsApp}
                            className="hidden md:flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
                            style={{ backgroundColor: "#25D366" }}
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                alt="WhatsApp"
                                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                            />
                            <span className="hidden sm:inline">Chat</span>
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1.5 sm:p-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 transition-colors flex-shrink-0"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
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

                        {/* Mobile Actions */}
                        <div className="mt-2 border-t border-gray-100 pt-2 space-y-2">
                            {/* Book Appointment - Mobile */}
                            <button
                                onClick={handleBookAppointment}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-base font-medium transition-all duration-200 text-white"
                                style={{ backgroundColor: "#0F5C4D" }}
                            >
                                <Calendar size={18} />
                                Book Appointment
                            </button>

                            {/* Login & WhatsApp - Mobile */}
                            <div className="flex items-center gap-2 px-4">
                                <button
                                    onClick={handleLogin}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-full transition-all duration-200 shadow-md"
                                    style={{ backgroundColor: "#007a52" }}
                                >
                                    <User size={16} />
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

                            {/* Phone */}
                            <a 
                                href="tel:+919010481048" 
                                className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Phone size={18} className="text-green-600" />
                                <span className="font-medium">+91 90104 81048</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
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
                
                /* Extra small screens (phones) */
                @media (max-width: 480px) {
                    .xs\\:inline {
                        display: inline !important;
                    }
                }
            `}</style>
        </nav>
    )
}

export default TimelyNavbar