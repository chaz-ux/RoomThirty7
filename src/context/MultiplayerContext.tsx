import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { database } from '../firebase';
import { ref, set, onValue, update, get, onDisconnect, remove } from 'firebase/database';

export type GameMode = 'local' | 'online' | null;

export interface Player {
    id: string;
    name: string;
    isHost?: boolean;
}

interface MultiplayerContextType {
    mode: GameMode;
    roomCode: string | null;
    players: Player[];
    currentPlayerId: string | null;
    isHost: boolean;
    sharedState: any;
    
    setMode: (mode: GameMode) => void;
    createOnlineRoom: (hostName: string) => Promise<string>;
    joinOnlineRoom: (code: string, playerName: string) => Promise<boolean>;
    addLocalPlayer: (name: string) => void;
    removeLocalPlayer: (id: string) => void;
    setSharedState: (newState: Partial<any>) => void;
    leaveRoom: () => void;
}

export const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 6);
const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

export const MultiplayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<GameMode>(null);
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
    const [sharedState, setSharedStateInternal] = useState<any>({});

    // Listen to Firebase if online
    useEffect(() => {
        if (mode === 'online' && roomCode && database) {
            const roomRef = ref(database, `rooms/${roomCode}`);
            const unsubscribe = onValue(roomRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setPlayers(data.players ? Object.values(data.players) : []);
                    setSharedStateInternal(data.gameState || {});
                } else {
                    // Room closed
                    leaveRoom();
                }
            });
            return () => unsubscribe(); // Firebase v9 onValue returns unsubscribe func
        }
    }, [mode, roomCode]);

    const setMode = (newMode: GameMode) => {
        setModeState(newMode);
        if (newMode === 'local') {
            // currentPlayerId will be set when first player is added in addLocalPlayer
            setCurrentPlayerId(null);
        }
    };

    const createOnlineRoom = async (hostName: string) => {
        if (!database) throw new Error("Firebase database not initialized. Check firebase.ts");
        
        const code = generateRoomCode();
        const hostId = 'p-' + generateId();
        const roomRef = ref(database, `rooms/${code}`);
        
        const hostPlayer: Player = { id: hostId, name: hostName, isHost: true };
        
        await set(roomRef, {
            createdAt: Date.now(),
            players: { [hostId]: hostPlayer },
            gameState: {}
        });

        // Delete room when host disconnects
        onDisconnect(roomRef).remove().catch(() => {});

        setModeState('online');
        setRoomCode(code);
        setCurrentPlayerId(hostId);
        return code;
    };

    const joinOnlineRoom = async (code: string, playerName: string) => {
        if (!database) throw new Error("Firebase database not initialized.");
        
        const roomRef = ref(database, `rooms/${code}`);
        const snapshot = await get(roomRef);
        
        if (snapshot.exists()) {
            const playerId = 'p-' + generateId();
            const playerRef = ref(database, `rooms/${code}/players/${playerId}`);
            
            const newPlayer: Player = { id: playerId, name: playerName, isHost: false };
            await set(playerRef, newPlayer);
            
            onDisconnect(playerRef).remove().catch(() => {});

            setModeState('online');
            setRoomCode(code);
            setCurrentPlayerId(playerId);
            return true;
        }
        return false;
    };

    const addLocalPlayer = (name: string) => {
        const newId = 'p-' + generateId();
        setPlayers(prev => [...prev, { id: newId, name }]);
        // First player added becomes the current player for turn tracking
        if (currentPlayerId === null) {
            setCurrentPlayerId(newId);
        }
    };

    const removeLocalPlayer = (id: string) => {
        setPlayers(prev => prev.filter(p => p.id !== id));
    };

    const setSharedState = async (newState: Partial<any>) => {
        if (mode === 'online' && roomCode && database) {
            const stateRef = ref(database, `rooms/${roomCode}/gameState`);
            await update(stateRef, newState);
        } else {
            setSharedStateInternal((prev: any) => ({ ...prev, ...newState }));
        }
    };

    const leaveRoom = () => {
        if (mode === 'online' && roomCode && currentPlayerId && database) {
            const isHostCheck = players.find(p => p.id === currentPlayerId)?.isHost;
            if (isHostCheck) {
                remove(ref(database, `rooms/${roomCode}`));
            } else {
                remove(ref(database, `rooms/${roomCode}/players/${currentPlayerId}`));
            }
        }
        setModeState(null);
        setRoomCode(null);
        setPlayers([]);
        setCurrentPlayerId(null);
        setSharedStateInternal({});
    };

    // Calculate if current player is host
    const isHost = mode === 'local' || (players.find(p => p.id === currentPlayerId)?.isHost ?? false);

    return (
        <MultiplayerContext.Provider value={{
            mode, roomCode, players, currentPlayerId, isHost, sharedState,
            setMode, createOnlineRoom, joinOnlineRoom, addLocalPlayer, removeLocalPlayer, setSharedState, leaveRoom
        }}>
            {children}
        </MultiplayerContext.Provider>
    );
};

export const useMultiplayer = () => {
    const context = useContext(MultiplayerContext);
    if (!context) throw new Error("useMultiplayer must be used within MultiplayerProvider");
    return context;
};
