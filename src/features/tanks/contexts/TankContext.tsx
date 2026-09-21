import { useSession } from "@/features/auth/contexts/AuthContext";
import { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { createTankService, getTanksService, updateTankService } from "../services/tank.service";
import { CreateTankPayload, TankResponse, UpdateTankPayload } from "../types/tank";

interface TankContextType {
   tanks: TankResponse[];
   isLoading: boolean;
   createTank: (data: CreateTankPayload) => Promise<void>
   updateTank: (data: UpdateTankPayload, tankId: string) => Promise<void>

   fetchTanks: () => Promise<void>
}

const TankContext = createContext<TankContextType | null>(null);

export function useTank() {
    const value = useContext(TankContext);
    if(!value) {
        throw new Error("useTank must be wrapped in a <TankProvider />")
    }
    return value;
}

export function TankProvider({children}: PropsWithChildren) {
   const {token} = useSession();

   const [tanks, setTanks] = useState<TankResponse[]>([])
   const [tank, setTank] = useState<TankResponse[]>([])
   const [isLoading, setIsLoading] = useState(false);

   const fetchTanks = useCallback(async () => {
      if(!token) return;
      try{
         setIsLoading(true)
         const response = await getTanksService(token as string)
         setTanks(response.data.items || [])
      } catch(error){
         console.error('Error al obtener los tanques', error)
      } finally {
         setIsLoading(false);
      }
   }, [token])

    return(
        <TankContext.Provider
         value={{
            tanks,
            isLoading,
            //Obtener
            fetchTanks,
            //Crear
            createTank: async(data: CreateTankPayload) => {
               try {
                  await createTankService(data, token as string);
                  await fetchTanks();
               } catch (error) {
                  console.error(
                     'Error al crear el tanque', 
                     error
                  )
                  throw error;
               }
            },
            //Actualizar
            updateTank: async (data: UpdateTankPayload, tankId: string) => {
               if (!token) throw new Error('No autenticado');
               await updateTankService(tankId, data, token);

               setTanks((prevTanks) =>
                  prevTanks.map((tank) => {
                        if (tank.id === tankId) {
                           return { ...tank, ...data };
                        }
                        return tank;
                  })
               );
            },
         }}
      >
      {children}
      </TankContext.Provider>
    )
}