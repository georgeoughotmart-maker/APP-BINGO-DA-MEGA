import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { User, Card, Draw, Settings } from './types';
import { 
  Trophy, 
  Settings as SettingsIcon, 
  LogOut, 
  PlusCircle, 
  History, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// --- Components ---

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-lottery-green p-2 rounded-xl shadow-lg shadow-lottery-green/20">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-lottery-dark tracking-tighter uppercase italic">Bingo Premiado</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <Link to="/" className="text-gray-600 hover:text-lottery-green px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors">Início</Link>
                <Link to="/results" className="text-gray-600 hover:text-lottery-green px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors">Resultados</Link>
                {user.isAdmin && (
                  <Link to="/admin" className="text-gray-600 hover:text-lottery-green px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors">Admin</Link>
                )}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm font-bold text-gray-700 flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
                    <UserIcon className="h-4 w-4 mr-1.5 text-lottery-green" />
                    {user.username}
                  </span>
                  <button 
                    onClick={onLogout}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user && (
                <>
                  <Link to="/" className="block px-3 py-2 text-gray-600 font-medium">Início</Link>
                  <Link to="/results" className="block px-3 py-2 text-gray-600 font-medium">Resultados</Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 text-gray-600 font-medium">Admin</Link>
                  )}
                  <button onClick={onLogout} className="block w-full text-left px-3 py-2 text-red-500 font-medium">Sair</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/api/register' : '/api/login';
    console.log(`Attempting ${isRegister ? 'registration' : 'login'} at ${endpoint}`);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      console.log(`Response status: ${res.status}`);
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Erro ao conectar ao servidor. Verifique sua conexão.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-lottery-green/10 via-white to-lottery-gold/10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-lottery-green rounded-3xl shadow-xl shadow-lottery-green/30 mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-lottery-dark tracking-tighter uppercase italic">{isRegister ? 'Criar Conta' : 'Bem-vindo'}</h2>
          <p className="text-gray-500 font-medium mt-2">Sua sorte começa aqui!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Usuário</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-lottery-green/50 transition-all font-medium"
              placeholder="Seu nome de usuário"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-lottery-green/50 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full btn-primary py-4 text-lg">
            {isRegister ? 'Criar Conta da Sorte' : 'Entrar no Jogo'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-lottery-green font-bold hover:text-lottery-dark transition-colors"
          >
            {isRegister ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se agora'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const NumberPicker = ({ onComplete, settings }: { onComplete: (numbers: number[]) => void, settings: Settings }) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const price = parseFloat(settings.card_price);
  
  const toggleNumber = (n: number) => {
    if (selected.includes(n)) {
      setSelected(selected.filter(x => x !== n));
    } else if (selected.length < 10) {
      setSelected([...selected, n].sort((a, b) => a - b));
    }
  };

  if (showPayment) {
    const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=Olá! Acabei de comprar uma cartela no Bingo Premiado. Segue o comprovante do PIX para os números: ${selected.join(', ')}`;
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center max-w-lg mx-auto"
      >
        <div className="inline-flex items-center justify-center p-5 bg-green-100 rounded-3xl mb-6 shadow-inner">
          <CreditCard className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-3xl font-black text-lottery-dark mb-2 uppercase italic tracking-tighter">Quase lá!</h3>
        <p className="text-gray-500 mb-8 font-medium">Para liberar sua cartela, realize o pagamento via PIX e envie o comprovante pelo WhatsApp.</p>
        
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8 shadow-inner">
          <div className="text-xs text-gray-400 uppercase font-black tracking-widest mb-2">Chave PIX</div>
          <div className="text-xl font-mono font-bold text-lottery-green break-all bg-white p-4 rounded-2xl border border-gray-100">{settings.pix_key}</div>
          <div className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Valor: <span className="text-xl text-lottery-dark">R$ {price.toFixed(2)}</span></div>
        </div>

        <div className="flex flex-col gap-4">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onComplete(selected)}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center shadow-xl shadow-green-100"
          >
            Enviar Comprovante via WhatsApp
          </a>
          <button 
            onClick={() => setShowPayment(false)}
            className="text-gray-400 font-bold hover:text-gray-600 transition-colors"
          >
            Voltar e alterar números
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-lottery-dark uppercase italic tracking-tighter">Escolha seus 10 números</h3>
          <p className="text-gray-500 font-medium">Selecione 10 números da sorte entre 1 e 60</p>
        </div>
        <div className="bg-lottery-green/10 px-6 py-3 rounded-2xl border border-lottery-green/20">
          <span className="text-xs text-lottery-green font-black uppercase tracking-widest block mb-1">Selecionados</span>
          <div className="text-3xl font-black text-lottery-green leading-none">{selected.length}/10</div>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2.5 mb-10">
        {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => toggleNumber(n)}
            className={`
              number-ball-btn
              ${selected.includes(n) 
                ? 'bg-lottery-green text-white border-lottery-green shadow-lg shadow-lottery-green/30 scale-110 z-10' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-lottery-green/30 hover:bg-lottery-green/5'}
            `}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
        <div className="flex items-center text-lottery-dark bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
          <CreditCard className="h-6 w-6 mr-3 text-lottery-green" />
          <span className="font-black uppercase tracking-wider text-sm">Valor: R$ {price.toFixed(2)}</span>
        </div>
        <button
          disabled={selected.length !== 10}
          onClick={() => setShowPayment(true)}
          className={`
            w-full sm:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all
            ${selected.length === 10 
              ? 'bg-lottery-green text-white hover:bg-lottery-dark shadow-xl shadow-lottery-green/20' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          Confirmar Números
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cardsRes, settingsRes] = await Promise.all([
        fetch(`/api/user/cards/${user.id}`),
        fetch('/api/settings')
      ]);
      setCards(await cardsRes.json());
      setSettings(await settingsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handlePurchase = async (numbers: number[]) => {
    if (!settings) return;
    try {
      const res = await fetch('/api/cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          numbers,
          weekNumber: parseInt(settings.current_week)
        })
      });
      if (res.ok) {
        setShowPicker(false);
        fetchData();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00a859', '#ffd700', '#ffffff']
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lottery-green"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-lottery-dark tracking-tighter uppercase italic">Olá, {user.username}!</h1>
          <div className="flex items-center mt-2">
            <span className="bg-lottery-green/10 text-lottery-green px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest border border-lottery-green/20">
              Total de semanas: {settings?.current_week}
            </span>
          </div>
        </div>
        {!showPicker && (
          <button 
            onClick={() => setShowPicker(true)}
            className="flex items-center justify-center space-x-3 bg-lottery-green text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-lottery-dark transition-all shadow-xl shadow-lottery-green/20"
          >
            <PlusCircle className="h-6 w-6" />
            <span>Nova Cartela da Sorte</span>
          </button>
        )}
      </div>

      {showPicker ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <button onClick={() => setShowPicker(false)} className="text-lottery-green font-black uppercase tracking-widest text-sm flex items-center hover:text-lottery-dark transition-colors">
              <X className="h-4 w-4 mr-2" />
              Cancelar e voltar
            </button>
          </div>
          {settings && <NumberPicker onComplete={handlePurchase} settings={settings} />}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.length === 0 ? (
            <div className="col-span-full glass-card p-16 text-center border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-lottery-dark uppercase italic tracking-tighter">Nenhuma cartela comprada</h3>
              <p className="text-gray-500 mt-2 font-medium">Sua sorte está esperando! Comece a jogar agora mesmo.</p>
              <button 
                onClick={() => setShowPicker(true)}
                className="mt-8 btn-primary"
              >
                Comprar minha primeira cartela
              </button>
            </div>
          ) : (
            cards.map(card => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card overflow-hidden relative group hover:shadow-2xl transition-all"
              >
                {card.purchased === 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 text-center">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-yellow-100 max-w-[240px]">
                      <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                      <div className="text-sm font-black text-gray-900 uppercase tracking-widest">Aguardando Aprovação</div>
                      <div className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">Envie o comprovante via WhatsApp para liberar sua sorte!</div>
                    </div>
                  </div>
                )}
                <div className="bg-lottery-green/5 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-black text-lottery-green uppercase tracking-widest">Cartela #{card.id}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Semana {card.week_number}</span>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-5 gap-3">
                    {card.numbers.map(n => (
                      <div key={n} className="lottery-ball h-11 w-11 bg-white border-gray-100 text-lottery-dark text-sm">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ResultsPage = ({ user }: { user: User }) => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drawsRes, cardsRes] = await Promise.all([
          fetch('/api/draws'),
          fetch(`/api/user/cards/${user.id}`)
        ]);
        setDraws(await drawsRes.json());
        setCards(await cardsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const calculateHits = (cardNumbers: number[], drawNumbers: number[]) => {
    return cardNumbers.filter(n => drawNumbers.includes(n)).length;
  };

  const getPrize = (hits: number) => {
    if (hits === 10) return "60% do Prêmio Total";
    if (hits === 1 || hits === 2) return "10% do Prêmio Total";
    return null;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lottery-green"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-black text-lottery-dark tracking-tighter uppercase italic mb-10">Resultados e Prêmios</h1>

      {draws.length === 0 ? (
        <div className="glass-card p-16 text-center border border-gray-100">
          <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="h-10 w-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Aguardando o primeiro sorteio da sorte...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {draws.map(draw => (
            <div key={draw.id} className="glass-card overflow-hidden">
              <div className="bg-lottery-green px-8 py-5 flex justify-between items-center shadow-lg">
                <h3 className="text-white font-black text-xl uppercase italic tracking-tighter">Sorteio Semana {draw.week_number}</h3>
                <CheckCircle2 className="text-white/50 h-7 w-7" />
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-4 mb-10">
                  {draw.numbers.map(n => (
                    <div key={n} className="lottery-ball h-14 w-14 bg-white border-lottery-green/30 text-lottery-green text-xl shadow-lg ring-4 ring-lottery-green/5">
                      {n}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-8">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Seus Acertos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.filter(c => c.week_number === draw.week_number && c.purchased === 1).map(card => {
                      const hits = calculateHits(card.numbers, draw.numbers);
                      const prize = getPrize(hits);
                      return (
                        <div key={card.id} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CARTELA #{card.id}</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {card.numbers.map(n => (
                                <span key={n} className={`text-xs font-black h-6 w-6 rounded-full flex items-center justify-center ${draw.numbers.includes(n) ? 'bg-lottery-green text-white' : 'bg-gray-200 text-gray-500'}`}>
                                  {n}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-lottery-dark leading-none">{hits} acertos</div>
                            {prize && (
                              <div className="text-xs font-black text-lottery-green uppercase tracking-wider mt-2 flex items-center justify-end bg-lottery-green/10 px-3 py-1 rounded-full">
                                <Trophy className="h-3 w-3 mr-1.5" />
                                {prize}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {cards.filter(c => c.week_number === draw.week_number && c.purchased === 1).length === 0 && (
                      <p className="text-gray-400 text-sm font-medium italic col-span-full">Você não teve cartelas aprovadas para esta semana.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pendingCards, setPendingCards] = useState<Card[]>([]);
  const [week, setWeek] = useState('');
  const [drawNumbers, setDrawNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'pending' | 'draw'>('pending');

  const fetchData = async () => {
    const [settingsRes, pendingRes] = await Promise.all([
      fetch('/api/settings'),
      fetch('/api/admin/cards/pending')
    ]);
    setSettings(await settingsRes.json());
    setPendingCards(await pendingRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    alert('Configurações salvas!');
  };

  const handleApprove = async (cardId: number) => {
    await fetch('/api/admin/cards/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId })
    });
    fetchData();
  };

  const handleDelete = async (cardId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta cartela?')) return;
    await fetch('/api/admin/cards/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId })
    });
    fetchData();
  };

  const handleAddDraw = async () => {
    if (drawNumbers.length === 0 || !week) return;
    await fetch('/api/admin/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_number: parseInt(week), numbers: drawNumbers })
    });
    alert('Sorteio realizado!');
    setDrawNumbers([]);
    setWeek('');
  };

  const toggleDrawNumber = (n: number) => {
    if (drawNumbers.includes(n)) {
      setDrawNumbers(drawNumbers.filter(x => x !== n));
    } else {
      setDrawNumbers([...drawNumbers, n].sort((a, b) => a - b));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-black text-lottery-dark tracking-tighter uppercase italic mb-10 flex items-center">
        <SettingsIcon className="h-10 w-10 mr-4 text-lottery-green" />
        Painel Administrativo
      </h1>

      <div className="flex border-b border-gray-200 mb-10 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === 'pending' ? 'border-lottery-green text-lottery-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Aprovações ({pendingCards.length})
        </button>
        <button 
          onClick={() => setActiveTab('draw')}
          className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === 'draw' ? 'border-lottery-green text-lottery-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Sorteios
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-8 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${activeTab === 'settings' ? 'border-lottery-green text-lottery-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Configurações
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {activeTab === 'pending' && (
          <section className="glass-card overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-black text-lottery-dark uppercase italic tracking-tighter">Cartelas Aguardando Pagamento</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingCards.length === 0 ? (
                <div className="p-20 text-center text-gray-400 italic font-medium">Nenhuma cartela pendente no momento.</div>
              ) : (
                pendingCards.map(card => (
                  <div key={card.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-black text-lg text-lottery-dark">{card.username}</span>
                        <span className="text-[10px] bg-lottery-green/10 text-lottery-green px-3 py-1 rounded-full font-black uppercase tracking-widest border border-lottery-green/20">Semana {card.week_number}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {card.numbers.map(n => (
                          <span key={n} className="lottery-ball h-8 w-8 bg-white border-gray-100 text-[10px] text-gray-600">{n}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApprove(card.id)}
                        className="bg-green-600 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center shadow-lg shadow-green-100"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Aprovar
                      </button>
                      <button 
                        onClick={() => handleDelete(card.id)}
                        className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'draw' && (
          <section className="glass-card p-8">
            <h2 className="text-2xl font-black text-lottery-dark uppercase italic tracking-tighter mb-8">Inserir Novo Sorteio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Número da Semana</label>
                  <input 
                    type="number" 
                    value={week}
                    onChange={e => setWeek(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-lottery-green/50 transition-all font-medium"
                    placeholder="Ex: 1"
                  />
                </div>
                <button 
                  onClick={handleAddDraw}
                  disabled={drawNumbers.length === 0 || !week}
                  className="w-full btn-primary py-4 text-lg"
                >
                  Publicar Sorteio Oficial
                </button>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Números Sorteados ({drawNumbers.length})</label>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-inner">
                  {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => toggleDrawNumber(n)}
                      className={`h-8 w-8 rounded-full text-[10px] font-black transition-all border-2 ${drawNumbers.includes(n) ? 'bg-lottery-green text-white border-lottery-green shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-lottery-green/30'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="glass-card p-8">
            <h2 className="text-2xl font-black text-lottery-dark uppercase italic tracking-tighter mb-8">Configurações do Sistema</h2>
            <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Valor da Cartela (R$)</label>
                  <input 
                    type="number" 
                    value={settings?.card_price}
                    onChange={e => setSettings({...settings!, card_price: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-lottery-green/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Total de Sorteios</label>
                  <input 
                    type="number" 
                    value={settings?.total_weeks}
                    onChange={e => setSettings({...settings!, total_weeks: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-lottery-green/50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Total de Semanas</label>
                  <input 
                    type="number" 
                    value={settings?.current_week}
                    onChange={e => setSettings({...settings!, current_week: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-lottery-green/50 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Chave PIX para Recebimento</label>
                  <input 
                    type="text" 
                    value={settings?.pix_key}
                    onChange={e => setSettings({...settings!, pix_key: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-lottery-green/50 transition-all font-medium"
                    placeholder="E-mail, CPF ou Aleatória"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">WhatsApp para Comprovantes</label>
                  <input 
                    type="text" 
                    value={settings?.whatsapp_number}
                    onChange={e => setSettings({...settings!, whatsapp_number: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-lottery-green/50 transition-all font-medium"
                    placeholder="Ex: 5511999999999"
                  />
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full btn-primary py-4 text-lg">
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bingo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('bingo_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bingo_user');
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#f0f7f4] font-sans text-gray-900 selection:bg-lottery-green selection:text-white">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <main className="pb-20">
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
            />
            <Route 
              path="/" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/results" 
              element={user ? <ResultsPage user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user?.isAdmin ? <AdminPanel /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-100 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">© 2026 Bingo Premiado. Jogue com responsabilidade.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
