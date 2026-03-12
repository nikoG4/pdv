import { useState, useContext, useEffect } from 'react';
import nextgenIcon from '../../assets/nextgen.svg';
import { AuthContext } from '../../services/Auth/AuthContext';
import { useLocation } from 'wouter';


export default function Login() {
    const [location, setLocation] = useLocation();
    const { login, isAuthenticated } = useContext(AuthContext);
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
          setLocation('/home');
        }
      }, [isAuthenticated, setLocation]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`http://${window.location.hostname}:8080/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful, received token:', data);
                login(data);
            } else {
                alert('Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Error en la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
            <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
                <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
                    <div>
                        <img src={nextgenIcon} className="w-32 mx-auto" alt="Next Gen Icon" />
                    </div>
                    <div className="mt-12 flex flex-col items-center">
                        <h1 className="text-2xl xl:text-3xl font-extrabold">Iniciar sesión</h1>
                        <div className="w-full flex-1 mt-8">
                            <div className="my-12 border-b text-center">
                                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                                    Inicia sesión con tu usuario y contraseña
                                </div>
                            </div>

                            <div className="mx-auto max-w-xs">
                                <input
                                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                    type="email"
                                    placeholder="Usuario"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                />
                                <input
                                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                                    onClick={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8h8a8 8 0 11-8-8z"
                                            ></path>
                                        </svg>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-6 h-6 -ml-2"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <path d="M20 8v6M23 11h-6" />
                                            </svg>
                                            <span className="ml-3">Iniciar sesión</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
                    <img src="https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg" alt="Illustration" />
                </div>
            </div>
        </div>
    );
}
