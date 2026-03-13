'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Download, User, Shield, Settings, Calendar, 
  Sigma, KeyRound, LogOut, AlertOctagon, X, Loader2, Smartphone
} from 'lucide-react';

// --- INICIALIZAR SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- INTERFACES DE TYPESCRIPT ---
interface Casino {
  id: number;
  nombre: string;
  categoria: string;
  dia: string;
  metaMensual: number;
  metaUtilidad: number;
  pin: string;
  utilidad: number;
  fecha: string | null;
  alertaCero: boolean;
}

interface MensajeConfig {
  id: number;
  min: number;
  max: number;
  mensaje: string;
  color: string;
  bg: string;
  bar: string;
}

const initialMessagesConfig: MensajeConfig[] = [
  { id: 1, min: -1000, max: 50, mensaje: "🚨 CRÍTICO: ¡Acción inmediata!", color: "text-red-400", bg: "bg-red-900/50", bar: "bg-red-500" },
  { id: 2, min: 50, max: 80, mensaje: "⚠️ ALERTA: Vamos lento.", color: "text-yellow-400", bg: "bg-yellow-900/50", bar: "bg-yellow-500" },
  { id: 3, min: 80, max: 99, mensaje: "🔵 BUEN RITMO: ¡Casi llegamos!", color: "text-blue-400", bg: "bg-blue-900/50", bar: "bg-blue-500" },
  { id: 4, min: 99, max: 5000, mensaje: "✅ ÉXITO: ¡Buen Trabajo!", color: "text-white", bg: "bg-green-500", bar: "bg-green-300" } 
];

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="inline-block mr-1 text-green-500">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function DashboardApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const [systemPin, setSystemPin] = useState('2026');
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [messagesConfig, setMessagesConfig] = useState<MensajeConfig[]>(initialMessagesConfig);
  
  const [userRole, setUserRole] = useState<'admin' | 'user'>('admin');
  const [selectedCasinoId, setSelectedCasinoId] = useState<number | null>(null);
  const [inputs, setInputs] = useState<Record<number, { utilidad: string }>>({}); 
  const [diaActual, setDiaActual] = useState(1);
  const [filtroAdmin, setFiltroAdmin] = useState('TODOS');
  const [showConfig, setShowConfig] = useState(false);
  const [configTarget, setConfigTarget] = useState<number | null>(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeInputId, setActiveInputId] = useState<number | null>(null);
  
  // Nuevo estado para el modal de instalación
  const [showInstallModal, setShowInstallModal] = useState(false);

  // --- OBTENER DATOS DE SUPABASE ---
  const fetchSupabaseData = async () => {
    setIsLoading(true);
    const { data: casinosData, error } = await supabase.from('casinos').select('*').order('id');
    if (casinosData) setCasinos(casinosData);
    if (error) console.error("Error cargando casinos:", error);

    const { data: configData } = await supabase.from('app_config').select('system_pin').eq('id', 1).single();
    if (configData) setSystemPin(configData.system_pin);
    
    setIsLoading(false);
  };

  useEffect(() => {
    setIsMounted(true);
    const today = new Date().getDate();
    setDiaActual(today);
    
    if (typeof window !== 'undefined') {
      const savedMsgs = localStorage.getItem('casinos_msgs');
      if (savedMsgs) setMessagesConfig(JSON.parse(savedMsgs));
    }

    fetchSupabaseData();
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('casinos_msgs', JSON.stringify(messagesConfig));
    }
  }, [messagesConfig, isMounted]);

  const formatoPesos = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  const getPromedioEsperado = (meta: number) => (meta / 30) * diaActual;
  const getPromedioDia = (meta: number) => meta / 30;

  const evaluarCasino = (casino: Casino) => {
    const promedioEsperado = getPromedioEsperado(casino.metaUtilidad);
    const porcentajeMensual = casino.metaUtilidad > 0 ? (casino.utilidad / casino.metaUtilidad) * 100 : 0;
    const rendimientoDiario = promedioEsperado > 0 ? (casino.utilidad / promedioEsperado) * 100 : 0;
    const balance = casino.utilidad - promedioEsperado;
    
    const config = messagesConfig.find(m => rendimientoDiario >= m.min && rendimientoDiario < m.max) || messagesConfig[0];
    const isExitoso = rendimientoDiario >= 100;

    return {
      ...casino,
      porcentajeMensual,
      rendimientoDiario,
      promedioEsperado,
      balance,
      promedioDia: getPromedioDia(casino.metaUtilidad),
      faltante: casino.metaUtilidad - casino.utilidad,
      mensaje: config.mensaje,
      color: config.color,
      bg: isExitoso ? 'bg-green-600' : config.bg,
      barColor: config.bar,
      icono: rendimientoDiario < 50 ? <TrendingDown /> : isExitoso ? <CheckCircle /> : <TrendingUp />
    };
  };

  const handleLogin = () => {
    if (pinInput === systemPin) {
      setUserRole('admin');
      setSelectedCasinoId(null);
      setIsAuthenticated(true);
      fetchSupabaseData();
    } else {
      const casinoEncontrado = casinos.find(c => c.pin === pinInput);
      if (casinoEncontrado) {
        setUserRole('user');
        setSelectedCasinoId(casinoEncontrado.id);
        setIsAuthenticated(true);
        fetchSupabaseData();
      } else {
        alert("PIN Incorrecto");
        setPinInput('');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setUserRole('admin');
    setSelectedCasinoId(null);
  };

  const openConfirmation = (id: number) => {
    const rawValue = inputs[id]?.utilidad;
    if (rawValue === '' || rawValue === undefined) return alert("Por favor ingresa un valor.");
    const value = parseFloat(rawValue);
    if (isNaN(value)) return alert("Error: Ingresa un número válido.");

    setActiveInputId(id);
    setShowConfirmModal(true);
  };

  const confirmEntry = async () => {
    if (!activeInputId) return;
    
    const valueToAdd = parseFloat(inputs[activeInputId]?.utilidad);
    const now = new Date();
    const fechaStr = now.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const esCero = valueToAdd === 0;

    const casinoActual = casinos.find(c => c.id === activeInputId);
    if (!casinoActual) return;

    const nuevaUtilidad = Number(casinoActual.utilidad) + valueToAdd;

    setCasinos(prev => prev.map(c => c.id === activeInputId ? { ...c, utilidad: nuevaUtilidad, fecha: fechaStr, alertaCero: esCero } : c));
    setInputs(prev => ({ ...prev, [activeInputId]: { utilidad: '' } }));
    setShowConfirmModal(false);
    setActiveInputId(null);

    await supabase.from('casinos').update({ utilidad: nuevaUtilidad, fecha: fechaStr, alertaCero: esCero }).eq('id', activeInputId);
  };

  const updateCasinoMeta = async (id: number, field: keyof Casino, value: string) => {
    let finalValue: string | number = value;
    let updates: any = {};

    if (field === 'pin' || field === 'nombre' || field === 'categoria' || field === 'dia') {
      finalValue = value;
      updates[field] = value;
    } else {
      finalValue = parseFloat(value) || 0;
      updates[field] = finalValue;
    }

    if (field === 'metaMensual' || field === 'metaUtilidad') {
      updates.utilidad = 0;
      updates.alertaCero = false;
      updates.fecha = new Date().toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    setCasinos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    await supabase.from('casinos').update(updates).eq('id', id);
  };

  const handleSystemPinUpdate = async (newPin: string) => {
    setSystemPin(newPin);
    await supabase.from('app_config').update({ system_pin: newPin }).eq('id', 1);
  };

  const casinosFiltrados = casinos.filter(c => {
    if (filtroAdmin === 'TODOS') return true;
    const evalC = evaluarCasino(c);
    if (filtroAdmin === 'CRITICOS') return evalC.rendimientoDiario < 50;
    if (filtroAdmin === 'EXITOSOS') return evalC.rendimientoDiario >= 100;
    return c.categoria === filtroAdmin;
  });

  const totales = casinosFiltrados.reduce((acc, c) => {
    const evalC = evaluarCasino(c);
    return {
      metaVentas: acc.metaVentas + Number(c.metaMensual),
      metaUtilidad: acc.metaUtilidad + Number(c.metaUtilidad),
      utilidadReal: acc.utilidadReal + Number(c.utilidad)
    };
  }, { metaVentas: 0, metaUtilidad: 0, utilidadReal: 0 });

  const exportarCSV = () => {
    let csv = "Local,Meta Ventas,Meta Utilidad,Utilidad Real,Avance Mensual %,Rendimiento Diario %,Fecha Cierre\n";
    casinosFiltrados.forEach(c => {
      const data = evaluarCasino(c);
      csv += `${data.nombre},${data.metaMensual},${data.metaUtilidad},${data.utilidad},${data.porcentajeMensual.toFixed(2)}%,${data.rendimientoDiario.toFixed(2)}%,${data.fecha || 'N/A'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_casinos.csv";
    link.click();
  };
  
  // COMPONENTE DEL MODAL DE INSTALACIÓN
  const InstallModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-gray-800 p-6 rounded-2xl border border-emerald-500/30 shadow-2xl w-full max-w-md relative">
        <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-700/50 p-1 rounded-full"><X size={20}/></button>
        <div className="text-center mb-6">
          <div className="bg-emerald-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/50">
            <Smartphone size={32} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Instalar Aplicación</h3>
          <p className="text-sm text-gray-400 mt-2">Agrega <span className="text-emerald-400 font-bold">Casino Control</span> a tu pantalla de inicio para entrar más rápido y usarla en pantalla completa.</p>
        </div>
        
        <div className="space-y-4">
          {/* ANDROID INSTRUCCIONES */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">📱 En Android (Chrome)</h4>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Toca los <strong>3 puntitos</strong> (<span className="text-gray-400 tracking-widest font-bold">⋮</span>) arriba a la derecha.</li>
              <li>Selecciona <strong>"Agregar a la pantalla principal"</strong> o "Instalar aplicación".</li>
              <li>Toca <strong>Instalar</strong> y búscala junto a tus otras apps.</li>
            </ol>
          </div>

          {/* IOS INSTRUCCIONES */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">🍏 En iPhone (Safari)</h4>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Toca el botón <strong>Compartir</strong> (cuadro con flecha hacia arriba) en la barra de abajo.</li>
              <li>Desliza hacia abajo y toca <strong>"Agregar a inicio"</strong> (ícono con un +).</li>
              <li>Toca <strong>Agregar</strong> arriba a la derecha.</li>
            </ol>
          </div>
        </div>
        
        <button onClick={() => setShowInstallModal(false)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl mt-6 transition">Entendido</button>
      </div>
    </div>
  );

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        {showInstallModal && <InstallModal />}
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="absolute top-4 right-4 z-20">
           <button onClick={() => setShowInstallModal(true)} className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all backdrop-blur-sm">
             <Smartphone size={16} /> Instalar App
           </button>
        </div>

        <div className="z-10 text-center mb-8">
          <Shield className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
          <h1 className="text-3xl font-bold">Casino Control</h1>
          <p className="text-gray-500 mt-2">Sistema Conectado a la Nube</p>
        </div>
        
        {isLoading ? (
           <div className="z-10 flex flex-col items-center text-emerald-400">
             <Loader2 className="w-10 h-10 animate-spin mb-4" />
             <p>Sincronizando Base de Datos...</p>
           </div>
        ) : (
          <div className="z-10 bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 w-11/12 max-w-sm">
            <div className="flex justify-center gap-2 mb-6">
              {[0,1,2,3].map((i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${pinInput.length > i ? 'bg-emerald-400' : 'bg-gray-700'}`}></div>
              ))}
            </div>
            <input 
              type="password" 
              value={pinInput} 
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0,4))}
              className="w-full text-center text-2xl tracking-[1em] bg-gray-800 border border-gray-600 rounded px-4 py-3 mb-4 focus:outline-none focus:border-emerald-500"
              placeholder="****"
            />
            <button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition">
              Acceder
            </button>
          </div>
        )}
      </div>
    );
  }

  const valorAbonoModal = activeInputId ? parseFloat(inputs[activeInputId]?.utilidad || '0') : 0;
  const esCeroModal = valorAbonoModal === 0;
  const esNegativoModal = valorAbonoModal < 0;
  const porcentajeTiempo = Math.round((diaActual / 30) * 100);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 p-4 md:p-8">
      
      {showInstallModal && <InstallModal />}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 shadow-2xl w-11/12 max-w-sm text-center">
            {esCeroModal ? (
              <AlertOctagon className="mx-auto text-red-500 mb-4 animate-pulse" size={48} />
            ) : esNegativoModal ? (
              <TrendingDown className="mx-auto text-orange-400 mb-4" size={40} />
            ) : (
              <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={40} />
            )}
            
            <h3 className="text-xl font-bold mb-2">
              {esNegativoModal ? 'Confirmar Pérdida' : 'Confirmar Abono'}
            </h3>
            
            {esCeroModal ? (
              <p className="text-red-400 text-sm mb-4 font-bold border border-red-500/50 bg-red-900/20 p-3 rounded">
                ⚠️ ATENCIÓN: Vas a registrar un valor de $0. Esto generará una alerta de revisión para el administrador.
              </p>
            ) : esNegativoModal ? (
               <p className="text-orange-300 text-sm mb-4">
                 Se <span className="font-bold text-white">restarán {formatoPesos(Math.abs(valorAbonoModal))}</span> de tu utilidad acumulada.
               </p>
            ) : (
              <p className="text-gray-400 text-sm mb-4">
                Se sumarán <span className="text-white font-bold text-lg">{formatoPesos(valorAbonoModal)}</span> a tu utilidad acumulada.
              </p>
            )}
            
            <div className="flex gap-4 mt-6">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold">Cancelar</button>
              <button onClick={confirmEntry} className={`flex-1 px-4 py-2 rounded font-bold ${esCeroModal ? 'bg-red-600 hover:bg-red-500' : esNegativoModal ? 'bg-orange-600 hover:bg-orange-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                {esCeroModal ? 'Sí, Enviar $0' : esNegativoModal ? 'Registrar Pérdida' : 'Sumar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Casino Control <span className="text-emerald-400">2026</span></h1>
            <p className="text-xs text-gray-500">🟢 En línea - BD Sincronizada</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          
          <button onClick={() => setShowInstallModal(true)} className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 border border-emerald-500/50 text-emerald-400 p-2 rounded-lg text-xs font-bold transition-all md:hidden">
             <Smartphone size={16} /> Instalar
          </button>

          <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
            {userRole === 'admin' ? (
              <span className="text-emerald-400 flex items-center gap-1 text-sm font-bold"><Shield size={16}/> MODO ADMIN</span>
            ) : (
              <span className="text-blue-400 flex items-center gap-1 text-sm font-bold">
                <User size={16}/> {casinos.find(c => c.id === selectedCasinoId)?.nombre}
              </span>
            )}
            <div className="w-px h-4 bg-gray-600"></div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-xs transition-colors">
              <LogOut size={14} /> Salir
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs bg-gray-800 p-2 rounded border border-gray-700">
            <Calendar size={14} className="text-gray-400"/>
            <span>Día:</span>
            <input type="number" min="1" max="31" value={diaActual} onChange={(e) => setDiaActual(Number(e.target.value))} className="w-10 bg-gray-700 text-center rounded text-white text-xs px-1" />
          </div>
        </div>
      </nav>

      {userRole === 'admin' && (
        <>
          <div className="mb-6 bg-gray-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Suma Metas Ventas</p>
              <p className="text-2xl font-bold text-white">{formatoPesos(totales.metaVentas)}</p>
            </div>
            <div className="text-center border-x border-gray-700">
              <p className="text-xs text-gray-400 uppercase">Suma Utilidad Esperada</p>
              <p className="text-2xl font-bold text-blue-400">{formatoPesos(totales.metaUtilidad)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Utilidad Real Acumulada</p>
              <p className={`text-2xl font-bold ${totales.utilidadReal < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatoPesos(totales.utilidadReal)}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFiltroAdmin('TODOS')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'TODOS' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Todos</button>
              <button onClick={() => setFiltroAdmin('GAMBLING')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'GAMBLING' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Gambling</button>
              <button onClick={() => setFiltroAdmin('SOCIEDADES')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'SOCIEDADES' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Sociedades</button>
              <button onClick={() => setFiltroAdmin('EXITOSOS')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'EXITOSOS' ? 'bg-green-600 text-white' : 'bg-gray-700'}`}>Cumplidos</button>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setShowInstallModal(true)} className="hidden md:flex items-center gap-1 px-3 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 border border-emerald-500/50 text-emerald-400 transition-all">
                <Smartphone size={14} /> Instalar App
              </button>
              <button onClick={() => { setShowConfig(!showConfig); setConfigTarget(null); }} className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 border border-gray-600">
                <Settings size={14}/> Config App
              </button>
              <button onClick={exportarCSV} className="flex items-center gap-1 px-4 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 font-semibold">
                <Download size={14}/> CSV
              </button>
            </div>
          </div>

          {showConfig && (
            <div className="mb-6 bg-gray-800 p-6 rounded-xl border border-emerald-500/50 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 relative">
              <button 
                onClick={() => setShowConfig(false)} 
                className="absolute top-4 right-4 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white flex items-center gap-1 px-3 py-1 rounded transition-colors"
              >
                <X size={16} /> Cerrar
              </button>

              <div className="bg-emerald-900/30 text-emerald-200 text-sm p-3 rounded mb-6 border border-emerald-500/30 mr-24">
                💡 <strong>Nota:</strong> Los cambios aquí se guardan instantáneamente en la nube para todos los locales.
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2"><Sigma size={18}/> Configurar Metas y PINs</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {casinos.map(c => (
                      <div key={c.id} onClick={() => setConfigTarget(c.id)} className={`p-2 rounded cursor-pointer ${configTarget === c.id ? 'bg-emerald-900/50 border border-emerald-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-sm">{c.nombre}</p>
                          <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400 border border-gray-600">PIN: {c.pin}</span>
                        </div>
                        {configTarget === c.id && (
                          <div className="grid grid-cols-2 gap-2 mt-3" onClick={e => e.stopPropagation()}>
                            <div className="col-span-2">
                              <label className="text-xs text-gray-400">PIN de Acceso Local (4 dígitos)</label>
                              <input type="text" maxLength={4} value={c.pin} onChange={e => updateCasinoMeta(c.id, 'pin', e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-900 p-1 rounded text-sm text-emerald-400 font-bold tracking-widest text-center" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Meta Ventas</label>
                              <input type="number" value={c.metaMensual} onChange={e => updateCasinoMeta(c.id, 'metaMensual', e.target.value)} className="w-full bg-gray-900 p-1 rounded text-sm text-white" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Meta Utilidad</label>
                              <input type="number" value={c.metaUtilidad} onChange={e => updateCasinoMeta(c.id, 'metaUtilidad', e.target.value)} className="w-full bg-gray-900 p-1 rounded text-sm text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Mensajes Automáticos</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {messagesConfig.map((msg, idx) => (
                      <div key={msg.id} className="bg-gray-700 p-3 rounded">
                        <div className="flex gap-2 mb-2 text-xs">
                          <span>%:</span>
                          <input type="number" value={msg.min} onChange={(e) => { const n = [...messagesConfig]; n[idx].min = Number(e.target.value); setMessagesConfig(n); }} className="w-10 bg-gray-900 px-1 rounded" />
                          <span>a:</span>
                          <input type="number" value={msg.max} onChange={(e) => { const n = [...messagesConfig]; n[idx].max = Number(e.target.value); setMessagesConfig(n); }} className="w-10 bg-gray-900 px-1 rounded" />
                        </div>
                        <textarea 
                          className="w-full bg-gray-900 text-white p-2 rounded text-xs" 
                          rows={2} 
                          value={msg.mensaje} 
                          onChange={(e) => { const n = [...messagesConfig]; n[idx].mensaje = e.target.value; setMessagesConfig(n); }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                   <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2"><KeyRound size={18}/> Seguridad Master</h3>
                   <div className="space-y-4">
                      <div className="bg-gray-700 p-3 rounded border border-emerald-500/30">
                        <label className="text-xs text-gray-400 block mb-1">Cambiar PIN Administrador</label>
                        <input 
                          type="password" 
                          value={systemPin} 
                          onChange={e => handleSystemPinUpdate(e.target.value.replace(/\D/g, '').slice(0,4))}
                          className="w-full bg-gray-900 p-2 rounded text-lg tracking-widest text-center font-bold text-emerald-400"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">PIN actual: {systemPin}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {(userRole === 'admin' ? casinosFiltrados : casinos.filter(c => c.id === selectedCasinoId)).map(casino => {
          const data = evaluarCasino(casino);
          
          return (
            <div key={data.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg flex flex-col relative">
              
              {data.alertaCero && userRole === 'admin' && (
                <div className="bg-red-600 text-white text-xs text-center font-bold py-1 animate-pulse flex justify-center items-center gap-1">
                  <AlertOctagon size={14} /> ALERTA: Último abono fue de $0. Revisar.
                </div>
              )}

              <div className={`p-4 ${data.bg} border-b border-gray-700 relative transition-colors duration-500`}>
                <img 
                  src="https://z-cdn-media.chatglm.cn/files/9a8f0b6a-4eb0-4355-958e-f0eba195dc97.png?auth_key=1873295030-16af9abaa2f147b5b6f8ada3e9491b35-0-ce3104328fea8a435aa665bd9b5b7482" 
                  alt="Ruleta" 
                  className="absolute top-2 left-2 w-10 h-10 rounded-full border-2 border-white shadow-md object-cover opacity-90"
                />

                <div className="flex justify-between items-start ml-10">
                  <span className="text-xs font-semibold text-white/80 uppercase ml-2">{data.categoria}</span>
                </div>
                <h2 className="text-xl font-bold text-white text-center my-1 drop-shadow-md">{data.nombre}</h2>
                <div className="text-center mt-2">
                  <span className="text-xs text-white/80 block">Meta Ventas Mensual</span>
                  <span className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{formatoPesos(data.metaMensual)}</span>
                </div>
              </div>

              <div className="p-5 flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Último Movimiento</p>
                    <p className="font-bold text-white text-xs">{data.fecha || "Sin registro"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Util. Esperada Día</p>
                    <p className="font-bold text-blue-400">{formatoPesos(data.promedioDia)}</p>
                  </div>
                </div>

                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 relative overflow-hidden">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-sm">Utilidad Meta</span>
                    <span className="font-bold text-white">{formatoPesos(data.metaUtilidad)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-800 pt-2">
                    <span className="text-gray-400 text-sm font-semibold">Total Acumulado</span>
                    <span className={`font-bold text-lg ${data.utilidad < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {formatoPesos(data.utilidad)}
                    </span>
                  </div>
                  {data.rendimientoDiario >= 100 && (
                    <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none"></div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">
                      Deberías: <span className="font-bold text-yellow-300">{formatoPesos(data.promedioEsperado)}</span>
                    </span>
                    <span className="text-gray-400">
                      Balance: <span className={`font-bold ${data.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.balance >= 0 ? '+' : ''}{formatoPesos(data.balance)}
                      </span>
                    </span>
                  </div>

                  <div className="text-[10px] font-bold text-gray-400 px-1 mt-4 mb-6">
                    <span className={data.porcentajeMensual >= porcentajeTiempo ? 'text-green-400' : 'text-white'}>
                      Real: {data.porcentajeMensual.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2 bg-gray-700 rounded-full relative">
                    <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10" style={{ left: `${porcentajeTiempo}%` }}>
                      <span className="text-blue-400 text-[10px] font-bold absolute bottom-full mb-1 bg-gray-900/80 px-1 rounded border border-blue-500/30 whitespace-nowrap">
                        Día {diaActual} ({porcentajeTiempo}%)
                      </span>
                      <div className="w-1 h-5 bg-blue-500 rounded"></div>
                    </div>
                    <div className={`h-full rounded-full transition-all duration-700 ${data.barColor}`} style={{ width: `${Math.max(0, Math.min(data.porcentajeMensual, 100))}%` }}></div>
                  </div>
                </div>

                <div className={`p-3 rounded border border-gray-600 ${data.bg} transition-colors duration-500 mt-6`}>
                  <p className={`text-sm font-medium ${data.color}`}>{data.mensaje}</p>
                </div>

                <div className="pt-2 border-t border-gray-700 bg-gray-800/50 p-3 rounded-lg mt-2">
                  <label className="text-xs text-gray-400 block mb-2 font-semibold">Añadir Utilidad de Hoy:</label>
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="$ (puedes usar negativo)"
                      className="flex-1 bg-gray-900 text-white text-sm px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-emerald-500"
                      value={inputs[data.id]?.utilidad || ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, [data.id]: { utilidad: e.target.value } }))}
                    />
                    <button 
                      onClick={() => openConfirmation(data.id)} 
                      disabled={inputs[data.id]?.utilidad === '' || inputs[data.id]?.utilidad === undefined}
                      className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-sm font-bold disabled:opacity-30 flex items-center gap-1 transition-all"
                    > 
                      Sumar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-3 text-center text-xs text-gray-500 z-40">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <span className="font-bold text-gray-400">Integración Tecnológica Avanzada ITA</span>
          <span className="hidden md:inline">|</span>
          <span>División Software - Automatización - AI</span>
          <span className="hidden md:inline">|</span>
          <span>2026 Pereira Colombia</span>
          <span className="hidden md:inline">|</span>
          <div className="flex items-center gap-1">
            <WhatsAppIcon />
            <span>3146539014</span>
          </div>
        </div>
      </footer>
    </div>
  );
}