import { useEffect, useRef, useState, useCallback } from 'react';
import Matter, { Engine, Runner, Body, World, Constraint, Events } from 'matter-js';

export interface PhysicsObject {
    id: string;
    body: Body;
    constraint?: Constraint;
    width: number;
    height: number;
}

export interface UseMatterDOMReturn {
    engineReady: boolean;
    addBody: (id: string, body: Body, width: number, height: number, constraint?: Constraint) => void;
    removeBody: (id: string) => void;
    clearBodies: () => void;
    setGravity: (y: number, x?: number) => void;
    getBody: (id: string) => Body | undefined;
    engine: Engine | null;
}

export const useMatterDOM = (containerRef: React.RefObject<HTMLDivElement>): UseMatterDOMReturn => {
    const engineRef = useRef<Engine | null>(null);
    const runnerRef = useRef<Runner | null>(null);
    const objectsRef = useRef<PhysicsObject[]>([]);
    const [engineReady, setEngineReady] = useState(false);
    const updateHandlerRef = useRef<((...args: unknown[]) => void) | null>(null);

    const cleanup = useCallback(() => {
        if (runnerRef.current) {
            Matter.Runner.stop(runnerRef.current);
            runnerRef.current = null;
        }

        if (engineRef.current) {
            if (updateHandlerRef.current) {
                Events.off(engineRef.current, 'afterUpdate', updateHandlerRef.current);
                updateHandlerRef.current = null;
            }

            objectsRef.current.forEach(obj => {
                if (obj.constraint) {
                    Matter.World.remove(engineRef.current!.world, obj.constraint);
                }
                Matter.Body.destroy(obj.body);
            });
            objectsRef.current = [];

            World.clear(engineRef.current.world, false);
            Engine.clear(engineRef.current);
            engineRef.current = null;
        }

        setEngineReady(false);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const engine = Engine.create({
            enableSleeping: false,
            positionIterations: 6,
            velocityIterations: 4
        });
        engineRef.current = engine;

        const container = containerRef.current;
        const updateDimensions = () => {
            if (!containerRef.current || !engineRef.current) return;
            const w = containerRef.current.clientWidth || window.innerWidth;
            const h = containerRef.current.clientHeight || window.innerHeight;
            return { w, h };
        };

        const dims = updateDimensions();
        if (!dims) return;
        const { w: width, h: height } = dims;

        // Bounding boxes — floor bounces, walls/ceiling are static
        const floor = Matter.Bodies.rectangle(width / 2, height + 50, width * 2, 100, {
            isStatic: true,
            restitution: 0.6,
            label: 'floor'
        });
        const leftWall = Matter.Bodies.rectangle(-50, height / 2, 100, height * 3, {
            isStatic: true,
            label: 'wall'
        });
        const rightWall = Matter.Bodies.rectangle(width + 50, height / 2, 100, height * 3, {
            isStatic: true,
            label: 'wall'
        });
        const ceiling = Matter.Bodies.rectangle(width / 2, -1000, width * 3, 100, {
            isStatic: true,
            label: 'ceiling'
        });

        World.add(engine.world, [floor, leftWall, rightWall, ceiling]);

        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        setEngineReady(true);

        const updateHandler = () => {
            objectsRef.current.forEach(obj => {
                const el = document.getElementById(obj.id);
                if (el) {
                    const x = obj.body.position.x - obj.width / 2;
                    const y = obj.body.position.y - obj.height / 2;
                    el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${obj.body.angle}rad)`;
                }
            });
        };

        updateHandlerRef.current = updateHandler;
        Events.on(engine, 'afterUpdate', updateHandler);

        const handleResize = () => {
            if (!containerRef.current || !engineRef.current) return;
            const dims = updateDimensions();
            if (!dims) return;
            const { w, h } = dims;

            // Reposition boundaries
            Matter.Body.setPosition(floor, { x: w / 2, y: h + 50 });
            Matter.Body.setPosition(rightWall, { x: w + 50, y: h / 2 });
            Matter.Body.setPosition(leftWall, { x: -50, y: h / 2 });
            Matter.Body.setPosition(ceiling, { x: w / 2, y: -1000 });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cleanup();
        };
    }, [containerRef, cleanup]);

    const addBody = useCallback((id: string, body: Body, width: number, height: number, constraint?: Constraint) => {
        if (!engineRef.current) return;
        if (constraint) {
            World.add(engineRef.current.world, constraint);
        }
        World.add(engineRef.current.world, body);
        objectsRef.current.push({ id, body, width, height, constraint });
    }, []);

    const removeBody = useCallback((id: string) => {
        if (!engineRef.current) return;
        const idx = objectsRef.current.findIndex(o => o.id === id);
        if (idx !== -1) {
            const obj = objectsRef.current[idx];
            if (obj.constraint) {
                World.remove(engineRef.current.world, obj.constraint);
            }
            World.remove(engineRef.current.world, obj.body);
            Body.destroy(obj.body);
            objectsRef.current.splice(idx, 1);
        }
    }, []);

    const clearBodies = useCallback(() => {
        if (!engineRef.current) return;
        objectsRef.current.forEach(obj => {
            if (obj.constraint) {
                World.remove(engineRef.current!.world, obj.constraint);
            }
            World.remove(engineRef.current!.world, obj.body);
            Body.destroy(obj.body);
        });
        objectsRef.current = [];
    }, []);

    const setGravity = useCallback((y: number, x: number = 0) => {
        if (engineRef.current) {
            engineRef.current.world.gravity.y = y;
            engineRef.current.world.gravity.x = x;
        }
    }, []);

    const getBody = useCallback((id: string): Body | undefined => {
        return objectsRef.current.find(o => o.id === id)?.body;
    }, []);

    return {
        engineReady,
        addBody,
        removeBody,
        clearBodies,
        setGravity,
        getBody,
        engine: engineRef.current
    };
};
