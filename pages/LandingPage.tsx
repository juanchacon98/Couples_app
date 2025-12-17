import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';
import { Heart, Shield, Zap, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleCta = () => {
    if (user) {
      navigate('/couple');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Heart size={20} fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">CoupleSync</span>
            </div>
            <div>
              {user ? (
                <button
                  onClick={() => navigate('/couple')}
                  className="bg-secondary text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-slate-700 transition flex items-center gap-2"
                >
                  Ir a la App <ArrowRight size={16} />
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-slate-600 font-medium text-sm hover:text-primary transition"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-primary text-white px-5 py-2 rounded-full font-medium text-sm shadow-lg shadow-red-200 hover:bg-red-600 transition"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Disponible ahora
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              Dejen de discutir. <br />
              <span className="text-primary">Empiecen a disfrutar.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              La app definitiva para parejas. Swipeen actividades juntos, desde noches de películas hasta citas románticas. Sin repeticiones, 100% sincronizado.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={handleCta}
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl shadow-xl shadow-red-200 hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                {user ? 'Continuar Swipeando' : 'Empezar Gratis'}
                <ArrowRight size={20} />
              </button>
              <button className="text-slate-500 font-medium hover:text-slate-800 transition">
                Saber más ↓
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-400">Sin tarjeta de crédito requerida.</p>
          </div>

          <div className="lg:w-1/2 relative">
            {/* Abstract Background Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            
            {/* App Mockup */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl">
              <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
              <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
              <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative flex flex-col">
                 {/* Mock Content */}
                 <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center relative">
                    <div className="absolute inset-x-4 top-8 bottom-24 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="h-2/3 bg-indigo-100 flex items-center justify-center text-6xl">🍿</div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">Cine en Casa</h3>
                            <p className="text-xs text-gray-500">Maratón de sus películas favoritas con palomitas.</p>
                        </div>
                    </div>
                    {/* Floating Hearts */}
                    <div className="absolute bottom-32 right-8 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-10">
                        ♥
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Por qué usar CoupleSync?</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Diseñado para eliminar la indecisión y aumentar la diversión en pareja.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {
                        icon: <Zap className="w-6 h-6 text-yellow-500" />,
                        title: "100% Sincronizado",
                        desc: "Ambos ven la misma actividad al mismo tiempo. Nada de 'yo vi una y tú otra'."
                    },
                    {
                        icon: <Shield className="w-6 h-6 text-green-500" />,
                        title: "Privado y Seguro",
                        desc: "Sus datos y sus swipes se mantienen solo entre ustedes dos. Seguridad primero."
                    },
                    {
                        icon: <Smartphone className="w-6 h-6 text-blue-500" />,
                        title: "Feed Determinista",
                        desc: "Algoritmo inteligente que asegura que no se pierdan ninguna tarjeta por error."
                    }
                ].map((feature, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                        <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Para cada estado de ánimo</h2>
                <ul className="space-y-4">
                    {[
                        "🏠 Casa - Para noches tranquilas",
                        "🌆 Salir - Aventuras y citas",
                        "🔥 Hot - Solo para adultos",
                        "🎬 Películas - Qué ver hoy",
                        "🍔 Comida - Dónde cenar"
                    ].map((cat, i) => (
                        <li key={i} className="flex items-center gap-3 text-lg text-slate-600">
                            <CheckCircle size={20} className="text-primary" />
                            {cat}
                        </li>
                    ))}
                </ul>
                <div className="mt-8">
                    <button onClick={handleCta} className="text-primary font-bold hover:underline flex items-center gap-2">
                        Explorar todas las categorías <ArrowRight size={16}/>
                    </button>
                </div>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-6 rounded-2xl h-48 flex flex-col justify-end">
                    <span className="text-4xl mb-2">🍔</span>
                    <span className="font-bold text-orange-900">Cenas</span>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl h-48 flex flex-col justify-end mt-8">
                    <span className="text-4xl mb-2">🎬</span>
                    <span className="font-bold text-purple-900">Cine</span>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-white">
                <Heart size={20} fill="currentColor" className="text-primary"/>
                <span className="font-bold text-xl">CoupleSync</span>
            </div>
            <p className="mb-8 text-sm">Hecho con amor para parejas indecisas.</p>
            <div className="flex justify-center gap-6 text-sm font-medium">
                <a href="#" className="hover:text-white transition">Privacidad</a>
                <a href="#" className="hover:text-white transition">Términos</a>
                <a href="#" className="hover:text-white transition">Contacto</a>
            </div>
            <p className="mt-8 text-xs text-slate-600">© 2024 CoupleSync. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;