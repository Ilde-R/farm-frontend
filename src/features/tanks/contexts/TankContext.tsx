import { useSession } from "@/features/auth/contexts/AuthContext";
import { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { createTank, getTanks } from "../services/tank.service";
import { CreateTankPayload, TankResponse } from "../types/tank";

interface TankContextType {
   tanks: TankResponse[];
   isLoading: boolean;
   create: (data: CreateTankPayload) => Promise<void>
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
   const [isLoading, setIsLoading] = useState(false);

   const fetchTanks = useCallback(async () => {
      if(!token) return;
      try{
         setIsLoading(true)
         const response = await getTanks(token as string)
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
            fetchTanks,
            create: async(data: CreateTankPayload) => {
               try {
                  await createTank(data, token as string);
                  await fetchTanks();
               } catch (error) {
                  console.error(
                     'Error al crear el tanque', 
                     error
                  )
                  throw error;
               }
            }
         }}
      >
      {children}
      </TankContext.Provider>
    )
}