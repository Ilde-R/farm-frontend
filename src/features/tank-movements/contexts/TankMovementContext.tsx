import { useSession } from "@/features/auth/contexts/AuthContext";
import { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { createTankMovementOutflowsService, createTankMovementTransferService, getTankMovementService } from "../services/tank-movement.service";
import {
    CreateTankMovementOutflowPayload,
    CreateTankMovementTransferPayload,
    GetTankMovementsResponse,
} from "../types/tank-movement";

type TankMovementsData = GetTankMovementsResponse["data"];

interface TankMovementContextType {
    tankMovements: TankMovementsData | null
    isLoading: boolean
    fetchTankMovements: (tankId: string, filters?: { from?: string; to?: string }) => Promise<void>
    createTankMovementTransfer: (data: CreateTankMovementTransferPayload) => Promise<void>
    createTankMovementOutflows: (data: CreateTankMovementOutflowPayload) => Promise<void>
}

const TankMovementContext = createContext<TankMovementContextType | null>(null);


export function useTankMovement() {
    const value = useContext(TankMovementContext);
    if(!value) {
        throw new Error("useTankMovement must be wrapped in a <TankMovementProvider />")
    }
    return value
}

export function TankMovementProvider({children}: PropsWithChildren) {
    const {token} = useSession();

    const [tankMovements, setTankMovements] = useState<TankMovementsData | null>(null);
    const [isLoading, setIsLoading] = useState(false)

    const fetchTankMovements = useCallback(async (
        tankId: string,
        filters?: { from?: string; to?: string },
    ) => {
        if (!token) throw new Error("No autenticado");
        if (!tankId) throw new Error("Se requiere el ID del tanque para consultar sus movimientos.");

        try {
            setIsLoading(true);
            const response = await getTankMovementService(tankId, filters);
            setTankMovements(response.data);
        } catch (error) {
            console.error('Error al obtener los movimientos del tanque', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return (
        <TankMovementContext.Provider
        value={{
            tankMovements,
            isLoading,

            //Obtener
            fetchTankMovements,

            // Transferencua
            createTankMovementTransfer: async (data: CreateTankMovementTransferPayload) => {
                setIsLoading(true);
                try {
                    await createTankMovementTransferService(data);
                    setTankMovements(null);
                } catch (error) {
                    console.error('Error al crear el movimiento de transferencia', error)
                    throw error 
                } finally {
                    setIsLoading(false);
                }
            },

            // Movimiento normal
            createTankMovementOutflows: async (data: CreateTankMovementOutflowPayload) => {
                setIsLoading(true);
                try {
                    await createTankMovementOutflowsService(data);
                    setTankMovements(null);
                } catch (error) {
                    console.error('Error al crear el movimiento', error)
                    throw error
                } finally {
                    setIsLoading(false);
                }
            }
        }}
        >
            {children}
        </TankMovementContext.Provider>
    )
}