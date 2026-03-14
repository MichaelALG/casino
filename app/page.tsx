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

// --- INTERFACES ---
interface Casino {
  id: number;
  nombre: string;
  categoria: string;
  dia: string;
  metaMensual: number; // Meta de Ventas
  metaUtilidad: number;
  pin: string;
  utilidad: number; 
  ventasAcumuladas: number; 
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
  const [loggedInUserPin, setLoggedInUserPin] = useState<string>(''); 
  
  const [inputs, setInputs] = useState<Record<number, { utilidad: string, ventas: string }>>({}); 
  const [diaActual, setDiaActual] = useState(1);
  const [filtroAdmin, setFiltroAdmin] = useState('TODOS');
  const [showConfig, setShowConfig] = useState(false);
  const [configTarget, setConfigTarget] = useState<number | null>(null); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeInputId, setActiveInputId] = useState<number | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

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

    // Sincronización en tiempo real
    const channel = supabase.channel('realtime-casinos').on('postgres_changes', { event: '*', schema: 'public', table: 'casinos' }, () => {
      fetchSupabaseData();
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('casinos_msgs', JSON.stringify(messagesConfig));
    }
  }, [messagesConfig, isMounted]);

  const formatoPesos = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
  const getPromedioEsperado = (meta: number) => (meta / 30) * diaActual;

  const evaluarCasino = (casino: any) => {
    const metaV = Number(casino.metaMensual || 0);
    const metaU = Number(casino.metaUtilidad || 0);
    const utilAcumulada = Number(casino.utilidad || 0);
    const ventasAcum = Number(casino.ventasAcumuladas || 0);

    const promedioEsperado = getPromedioEsperado(metaU);
    const porcentajeMensual = metaU > 0 ? (utilAcumulada / metaU) * 100 : 0;
    const porcentajeVentas = metaV > 0 ? (ventasAcum / metaV) * 100 : 0;
    const rendimientoDiario = promedioEsperado > 0 ? (utilAcumulada / promedioEsperado) * 100 : 0;
    
    const faltanteParaCumplir = metaU - utilAcumulada;
    const faltanteVentas = metaV - ventasAcum;
    
    const config = messagesConfig.find(m => rendimientoDiario >= m.min && rendimientoDiario < m.max) || messagesConfig[0];
    const isExitoso = rendimientoDiario >= 100;

    return {
      ...casino,
      metaMensual: metaV,
      metaUtilidad: metaU,
      utilidad: utilAcumulada,
      ventasAcumuladas: ventasAcum,
      porcentajeMensual,
      porcentajeVentas,
      rendimientoDiario,
      promedioEsperado,
      faltanteParaCumplir,
      faltanteVentas,
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
      setIsAuthenticated(true);
      fetchSupabaseData();
    } else {
      const existePIN = casinos.some(c => c.pin === pinInput);
      if (existePIN) {
        setUserRole('user');
        setLoggedInUserPin(pinInput); 
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
    setLoggedInUserPin('');
  };

  const openConfirmation = (id: number) => {
    const v = inputs[id]?.ventas;
    const u = inputs[id]?.utilidad;
    if ((v === '' || v === undefined) && (u === '' || u === undefined)) {
      return alert("Por favor ingresa al menos un valor (Ventas o Utilidad).");
    }
    setActiveInputId(id);
    setShowConfirmModal(true);
  };

  const confirmEntry = async () => {
    if (!activeInputId) return;
    
    const ventasToAdd = parseFloat(inputs[activeInputId]?.ventas || '0');
    const utilidadToAdd = parseFloat(inputs[activeInputId]?.utilidad || '0');
    
    const now = new Date();
    const fechaStr = now.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    
    const casinoActual = casinos.find(c => c.id === activeInputId);
    if (!casinoActual) return;

    const nuevasVentas = Number(casinoActual.ventasAcumuladas || 0) + ventasToAdd;
    const nuevaUtilidad = Number(casinoActual.utilidad || 0) + utilidadToAdd;
    const esCero = utilidadToAdd === 0 && ventasToAdd === 0;

    setCasinos(prev => prev.map(c => c.id === activeInputId ? { 
      ...c, 
      ventasAcumuladas: nuevasVentas,
      utilidad: nuevaUtilidad, 
      fecha: fechaStr 
    } : c));
    
    setInputs(prev => ({ ...prev, [activeInputId]: { utilidad: '', ventas: '' } }));
    setShowConfirmModal(false);
    setActiveInputId(null);

    await supabase.from('casinos').update({ 
      ventasAcumuladas: nuevasVentas,
      utilidad: nuevaUtilidad, 
      fecha: fechaStr, 
      alertaCero: esCero 
    }).eq('id', activeInputId);
  };

  const updateCasinoMeta = async (id: number, field: string, value: any) => {
    let finalValue: any = value;
    if (field !== 'pin' && field !== 'nombre' && field !== 'categoria' && field !== 'dia') {
      finalValue = parseFloat(value) || 0;
    }

    const updates: any = { [field]: finalValue };
    setCasinos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    await supabase.from('casinos').update(updates).eq('id', id);
  };

  const handleSystemPinUpdate = async (newPin: string) => {
    setSystemPin(newPin);
    await supabase.from('app_config').update({ system_pin: newPin }).eq('id', 1);
  };

  const casinosFiltrados = casinos.filter(c => {
    if (userRole === 'admin') {
      if (filtroAdmin === 'TODOS') return true;
      const evalC = evaluarCasino(c);
      if (filtroAdmin === 'CRITICOS') return evalC.rendimientoDiario < 50;
      if (filtroAdmin === 'EXITOSOS') return evalC.rendimientoDiario >= 100;
      return c.categoria === filtroAdmin;
    }
    return c.pin === loggedInUserPin;
  });

  const totales = casinosFiltrados.reduce((acc, c) => {
    const evalC = evaluarCasino(c);
    return {
      metaVentas: acc.metaVentas + Number(evalC.metaMensual),
      ventasReales: acc.ventasReales + Number(evalC.ventasAcumuladas),
      metaUtilidad: acc.metaUtilidad + Number(evalC.metaUtilidad),
      utilidadReal: acc.utilidadReal + Number(evalC.utilidad)
    };
  }, { metaVentas: 0, ventasReales: 0, metaUtilidad: 0, utilidadReal: 0 });

  const exportarCSV = () => {
    let csv = "Local,Meta Ventas,Ventas Reales,Meta Utilidad,Utilidad Real,Falta Para Cumplir %,Rendimiento Diario %,Fecha Cierre\n";
    casinosFiltrados.forEach(c => {
      const data = evaluarCasino(c);
      csv += `${data.nombre},${data.metaMensual},${data.ventasAcumuladas},${data.metaUtilidad},${data.utilidad},${data.faltanteParaCumplir},${data.rendimientoDiario.toFixed(2)}%,${data.fecha || 'N/A'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_casinos.csv";
    link.click();
  };
  
  const InstallModal = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 p-6 rounded-2xl border border-emerald-500/30 w-full max-w-md relative">
        <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
        <div className="text-center mb-6">
          <Smartphone size={32} className="text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">Instalar Aplicación</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <h4 className="font-bold text-emerald-400 mb-2">📱 En Android (Chrome)</h4>
            <ol className="text-sm text-gray-300 list-decimal list-inside">
              <li>Toca los <strong>3 puntitos</strong> arriba a la derecha.</li>
              <li>Selecciona <strong>"Agregar a la pantalla principal"</strong>.</li>
            </ol>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <h4 className="font-bold text-blue-400 mb-2">🍏 En iPhone (Safari)</h4>
            <ol className="text-sm text-gray-300 list-decimal list-inside">
              <li>Toca el botón <strong>Compartir</strong> (cuadro con flecha).</li>
              <li>Toca <strong>"Agregar a inicio"</strong> (ícono con un +).</li>
            </ol>
          </div>
        </div>
        <button onClick={() => setShowInstallModal(false)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl mt-6">Entendido</button>
      </div>
    </div>
  );

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white relative p-4">
        {showInstallModal && <InstallModal />}
        <div className="absolute top-4 right-4 z-20">
           <button onClick={() => setShowInstallModal(true)} className="flex items-center gap-2 bg-gray-800 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold">
             <Smartphone size={16} /> Instalar App
           </button>
        </div>
        <div className="z-10 text-center mb-8">
          <Shield className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
          <h1 className="text-3xl font-bold text-emerald-400">Casino Control</h1>
          <p className="text-gray-500 mt-2">Sistema Conectado a la Nube</p>
        </div>
        <div className="z-10 bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-sm">
          <input 
            type="password" 
            value={pinInput} 
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0,4))}
            className="w-full text-center text-2xl tracking-[1em] bg-gray-800 border border-gray-600 rounded px-4 py-3 mb-6 focus:outline-none focus:border-emerald-500"
            placeholder="****"
          />
          <button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition">
            Acceder
          </button>
        </div>
      </div>
    );
  }

  const abonoVentas = parseFloat(inputs[activeInputId!]?.ventas || '0');
  const abonoUtilidad = parseFloat(inputs[activeInputId!]?.utilidad || '0');
  const porcentajeTiempo = Math.round((diaActual / 30) * 100);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 p-4 md:p-8">
      {showInstallModal && <InstallModal />}
      
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 w-full max-w-sm text-center">
             <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={48} />
             <h3 className="text-xl font-bold mb-4">Confirmar Cierre</h3>
             <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700">
               <p className="text-gray-400 text-sm mb-2">Se sumarán a los acumulados:</p>
               <p className="text-emerald-400 font-bold mb-1">Ventas: {formatoPesos(abonoVentas)}</p>
               <p className="text-blue-400 font-bold">Utilidad: {formatoPesos(abonoUtilidad)}</p>
             </div>
             <div className="flex gap-4">
               <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold">Cancelar</button>
               <button onClick={confirmEntry} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-bold">Sí, Sumar</button>
             </div>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN RESTAURADA (CON EL DÍA) */}
      <nav className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Casino Control <span className="text-emerald-400">2026</span></h1>
            <p className="text-xs text-gray-500">🟢 En línea - BD Sincronizada</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => setShowInstallModal(true)} className="flex items-center gap-1 bg-gray-800 text-emerald-400 p-2 rounded-lg text-xs font-bold md:hidden border border-emerald-500/50">
             <Smartphone size={16} /> Instalar
          </button>

          <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
            {userRole === 'admin' ? (
              <span className="text-emerald-400 flex items-center gap-1 text-sm font-bold"><Shield size={16}/> ADMIN</span>
            ) : (
              <span className="text-blue-400 flex items-center gap-1 text-sm font-bold">
                <User size={16}/> Local
              </span>
            )}
            <div className="w-px h-4 bg-gray-600"></div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 flex items-center gap-1 text-xs">
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
          <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
              <p className="text-[10px] text-gray-400 uppercase mb-1">Total Meta Ventas</p>
              <p className="text-lg font-bold text-white">{formatoPesos(totales.metaVentas)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-emerald-900 text-center">
              <p className="text-[10px] text-emerald-400 uppercase mb-1">Ventas Reales</p>
              <p className="text-lg font-bold text-emerald-400">{formatoPesos(totales.ventasReales)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
              <p className="text-[10px] text-gray-400 uppercase mb-1">Total Meta Utilidad</p>
              <p className="text-lg font-bold text-white">{formatoPesos(totales.metaUtilidad)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-blue-900 text-center">
              <p className="text-[10px] text-blue-400 uppercase mb-1">Utilidad Real Hoy</p>
              <p className="text-lg font-bold text-blue-400">{formatoPesos(totales.utilidadReal)}</p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFiltroAdmin('TODOS')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'TODOS' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Todos</button>
              <button onClick={() => setFiltroAdmin('GAMBLING')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'GAMBLING' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Gambling</button>
              <button onClick={() => setFiltroAdmin('SOCIEDADES')} className={`px-3 py-1 rounded text-xs ${filtroAdmin === 'SOCIEDADES' ? 'bg-white text-gray-900' : 'bg-gray-700'}`}>Sociedades</button>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setShowInstallModal(true)} className="hidden md:flex items-center gap-1 px-3 py-1 rounded text-xs bg-gray-800 text-emerald-400 border border-emerald-500/50">
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
            <div className="mb-6 bg-gray-800 p-6 rounded-xl border border-emerald-500/50 shadow-lg relative">
              <button onClick={() => setShowConfig(false)} className="absolute top-4 right-4 bg-red-600/20 text-red-400 flex items-center gap-1 px-3 py-1 rounded">
                <X size={16} /> Cerrar
              </button>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2"><Sigma size={18} className="inline"/> Configurar Metas y PINs</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {casinos.map(c => (
                      <div key={c.id} onClick={() => setConfigTarget(c.id)} className={`p-2 rounded cursor-pointer ${configTarget === c.id ? 'bg-emerald-900/50 border border-emerald-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-sm">{c.nombre}</p>
                          <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400">PIN: {c.pin}</span>
                        </div>
                        {configTarget === c.id && (
                          <div className="grid grid-cols-2 gap-2 mt-3" onClick={e => e.stopPropagation()}>
                            <div className="col-span-2">
                              <label className="text-xs text-gray-400">PIN de Acceso Local</label>
                              <input type="text" maxLength={4} value={c.pin} onChange={e => updateCasinoMeta(c.id, 'pin', e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-900 p-1 rounded text-sm text-center" />
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
                   <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2"><KeyRound size={18}/> Seguridad Master</h3>
                   <div className="bg-gray-700 p-3 rounded border border-emerald-500/30">
                     <label className="text-xs text-gray-400 block mb-1">Cambiar PIN Administrador</label>
                     <input type="password" value={systemPin} onChange={e => handleSystemPinUpdate(e.target.value.replace(/\D/g, '').slice(0,4))} className="w-full bg-gray-900 p-2 rounded text-lg tracking-widest text-center text-emerald-400" />
                   </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {casinosFiltrados.map(casino => {
          const data = evaluarCasino(casino);
          return (
            <div key={data.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl flex flex-col relative">
              
              {/* RESTAURADO: LOGO EN LA ESQUINA */}
              <div className={`p-4 ${data.bg} border-b border-black/20 relative transition-colors duration-500`}>
                <img 
                  src="https://z-cdn-media.chatglm.cn/files/9a8f0b6a-4eb0-4355-958e-f0eba195dc97.png?auth_key=1873295030-16af9abaa2f147b5b6f8ada3e9491b35-0-ce3104328fea8a435aa665bd9b5b7482" 
                  alt="Ruleta" 
                  className="absolute top-2 left-2 w-10 h-10 rounded-full border-2 border-white shadow-md object-cover opacity-90"
                />
                <div className="flex justify-between items-center ml-12">
                  <span className="text-[10px] font-bold bg-black/20 px-2 py-1 rounded uppercase tracking-wider">{data.categoria}</span>
                  <span className="text-xs font-bold text-white/70">{data.fecha || 'Sin cierres'}</span>
                </div>
                <h2 className="text-2xl font-black text-center text-white mt-4 mb-2 tracking-tight uppercase">{data.nombre}</h2>
              </div>

              <div className="p-6 flex-grow">
                
                {/* --- SECCIÓN VENTAS --- */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                  <div>
                    <p className="text-gray-400 text-[11px] uppercase">Meta de Ventas</p>
                    <p className="font-bold text-white">{formatoPesos(data.metaMensual)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[11px] uppercase">Acumulado Ventas</p>
                    <p className="font-bold text-emerald-400 text-lg">{formatoPesos(data.ventasAcumuladas)}</p>
                  </div>
                </div>

                {/* NUEVO: ESTADÍSTICAS Y BARRA DELGADA DE VENTAS */}
                <div className="flex justify-between text-[10px] text-gray-400 px-1 mb-1">
                  <span>Falta para ventas: <span className={`font-bold ${data.faltanteVentas <= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatoPesos(Math.max(0, data.faltanteVentas))}</span></span>
                  <span className={data.porcentajeVentas >= porcentajeTiempo ? 'text-green-400 font-bold' : 'text-white'}>Logro: {data.porcentajeVentas.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-gray-900 rounded-full relative overflow-hidden mb-5">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(data.porcentajeVentas, 100)}%` }}></div>
                </div>

                <div className="border-t border-gray-700 my-4"></div>

                {/* --- SECCIÓN UTILIDAD --- */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                  <div>
                    <p className="text-gray-400 text-[11px] uppercase">Meta Utilidad</p>
                    <p className="font-bold text-blue-400">{formatoPesos(data.metaUtilidad)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[11px] uppercase">Total Acumulado</p>
                    <p className="font-bold text-white text-lg">{formatoPesos(data.utilidad)}</p>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] px-1 mb-2">
                  <span className="text-gray-400">Deberías llevar: <span className="text-blue-300 font-bold">{formatoPesos(data.promedioEsperado)}</span></span>
                  <span className="text-gray-400">Falta cumplir: <span className={`font-bold ${data.faltanteParaCumplir <= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatoPesos(Math.max(0, data.faltanteParaCumplir))}</span></span>
                </div>

                {/* RESTAURADO: MARCADOR AZUL DEL TIEMPO */}
                <div className="text-[10px] font-bold text-gray-400 px-1 mt-3 mb-5 text-right">
                   <span className={data.porcentajeMensual >= porcentajeTiempo ? 'text-green-400' : 'text-white'}>
                     Logro Utilidad: {data.porcentajeMensual.toFixed(1)}%
                   </span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full relative mb-6">
                  <div className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10" style={{ left: `${porcentajeTiempo}%` }}>
                    <span className="text-blue-400 text-[10px] font-bold absolute bottom-full mb-1 bg-gray-900/80 px-1 rounded border border-blue-500/30 whitespace-nowrap">
                      Día {diaActual} ({porcentajeTiempo}%)
                    </span>
                    <div className="w-1 h-5 bg-blue-500 rounded"></div>
                  </div>
                  <div className={`h-full ${data.barColor} transition-all duration-1000 rounded-full`} style={{ width: `${Math.min(data.porcentajeMensual, 100)}%` }}></div>
                </div>

                {/* DOBLE INGRESO DE DATOS */}
                <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-600 mt-2">
                  <label className="text-[10px] text-emerald-400 font-bold uppercase block mb-3 text-center">Cierre de Turno</label>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Ventas:</span>
                      <input
                        type="number" placeholder="$ Ingresar Ventas"
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-emerald-500 text-sm"
                        value={inputs[data.id]?.ventas || ''}
                        onChange={(e) => setInputs((prev) => ({ ...prev, [data.id]: { ...prev[data.id], ventas: e.target.value } }))}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16">Utilidad:</span>
                      <input
                        type="number" placeholder="$ Ingresar Utilidad"
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                        value={inputs[data.id]?.utilidad || ''}
                        onChange={(e) => setInputs((prev) => ({ ...prev, [data.id]: { ...prev[data.id], utilidad: e.target.value } }))}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => openConfirmation(data.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition shadow-lg"
                  >
                    Guardar Datos del Turno
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4 text-center z-40">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          <span>ITA - Integración Tecnológica Avanzada 2026</span>
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