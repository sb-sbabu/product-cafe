import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrewStore } from '../../stores/brewStore';
import { Coffee, X, Zap, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import type { RoastProfile } from '../../lib/daily-brew/types';

export const ThePress = () => {
    const {
        menu,
        isPressOpen,
        stats,
        press,
        sip,
        generateMockBrew,
        refreshMenu
    } = useBrewStore();

    const { steamPressure } = stats;

    // Simulate decay every minute
    useEffect(() => {
        const interval = setInterval(refreshMenu, 60000);
        return () => clearInterval(interval);
    }, [refreshMenu]);

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
            {/* THE PRESS (Trigger) */}
            <motion.button
                onClick={press}
                className={clsx(
                    "relative flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300 group",
                    isPressOpen
                        ? "bg-slate-900/90 text-white w-[400px]"
                        : "bg-black/40 hover:bg-black/60 text-white/90"
                )}
                layout
            >
                {/* Steam Animation (Only when closed and has pressure) */}
                {!isPressOpen && steamPressure > 0 && (
                    <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bottom-0 left-1/2 w-4 h-4 bg-white/20 blur-md rounded-full"
                                animate={{
                                    y: [-10, -40],
                                    x: [0, (i % 2 === 0 ? 10 : -10)],
                                    opacity: [0, 0.5, 0],
                                    scale: [0.5, 1.5],
                                }}
                                transition={{
                                    duration: 2 + i,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 z-10 w-full">
                    <div className={clsx(
                        "p-1.5 rounded-full transition-colors",
                        steamPressure > 0 ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/50"
                    )}>
                        <Coffee size={18} />
                    </div>

                    <AnimatePresence mode="wait">
                        {isPressOpen ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-medium text-sm flex-1 text-left"
                            >
                                The Daily Brew
                            </motion.span>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-start"
                            >
                                <span className="text-xs font-bold text-white tracking-wide">
                                    {steamPressure > 0 ? `${steamPressure} New Shots` : 'No Pressure'}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isPressOpen && (
                        <div className="p-1 hover:bg-white/10 rounded-full cursor-pointer" onClick={(e) => { e.stopPropagation(); press(); }}>
                            <X size={16} />
                        </div>
                    )}
                </div>
            </motion.button>

            {/* THE POUR (Dropdown Stream) */}
            <AnimatePresence>
                {isPressOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="mt-2 w-[400px] max-h-[60vh] overflow-y-auto bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 no-scrollbar"
                    >
                        {/* Mock Data Generator for Dev */}
                        <button
                            onClick={generateMockBrew}
                            className="text-xs text-white/30 hover:text-amber-400 w-full text-center pb-2 border-b border-white/5"
                        >
                            + Add Mock Brew (Dev)
                        </button>

                        {menu.length === 0 ? (
                            <div className="text-center py-10 text-white/30 italic">
                                The pot is empty. Time to brew?
                            </div>
                        ) : (
                            menu.map((item) => (
                                <BrewCard key={item.id} item={item} onSip={() => sip(item.id)} />
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BrewCard = ({ item, onSip }: { item: any; onSip: () => void }) => {
    const getRoastColor = (roast: RoastProfile) => {
        switch (roast) {
            case 'dark': return 'border-l-amber-500 bg-amber-500/10';
            case 'medium': return 'border-l-emerald-500 bg-emerald-500/5';
            case 'light': return 'border-l-indigo-500 bg-indigo-500/5';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={clsx(
                "relative p-3 rounded-r-xl border-l-4 border-white/5 hover:bg-white/5 transition-colors cursor-pointer group",
                getRoastColor(item.roast),
                item.isRead && "opacity-50 grayscale"
            )}
            onClick={onSip}
        >
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1">
                    {item.source} • {Math.round(item.caffeineScore)}mg
                    {item.roast === 'dark' && <Zap size={8} className="text-amber-400 fill-amber-400" />}
                </span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <Clock size={8} />
                    {Math.floor((Date.now() - item.timestamp) / 60000)}m ago
                </span>
            </div>
            <h4 className="text-sm font-semibold text-white/90 leading-tight mb-1 group-hover:text-amber-100">{item.title}</h4>
            <p className="text-xs text-white/60 line-clamp-2">{item.message}</p>
        </motion.div>
    );
};
