import { useSession } from "@/features/auth/contexts/AuthContext";
import { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { createTankService, getTanksService, updateTankService } from "../services/tank.service";
import { CreateTankPayload, Tank, UpdateTankPayload } from "../types/tank";

interface TankContextType {
   tanks: Tank[];
   isLoading: boolean;
   createTank: (data: CreateTankPayload) => Promise<void>;
   updateTank: (data: UpdateTankPayload, tankId: string) => Promise<void>;
   fetchTanks: () => Promise<void>;
}

const TankContext = createContext<TankContextType | null>(null);

export function useTank() {
    const value = useContext(TankContext);
    if(!value) {
        throw new Error("useTank must be wrapped in a <TankProvider />");
    }
    return value;
}

export function TankProvider({ children }: PropsWithChildren) {
   const { token } = useSession();

   const [tanks, setTanks] = useState<Tank[]>([]);
   const [isLoading, setIsLoading] = useState(false);

   const fetchTanks = useCallback(async () => {
      if(!token) return; 
      try {
         setIsLoading(true);
         const response = await getTanksService();
         
         setTanks(response.data.items || []); 
      } catch(error) {
         console.error('Error al obtener los tanques', error);
      } finally {
         setIsLoading(false);
      }
   }, [token]);

    return (
        <TankContext.Provider
         value={{
            tanks,
            isLoading,
            // Obtener
            fetchTanks,
            
            // Crear
            createTank: async (data: CreateTankPayload) => {
               try {
                  const newTank = await createTankService(data);
                  
                  setTanks((prevTanks) => [...prevTanks, newTank]);
               } catch (error) {
                  console.error('Error al crear el tanque', error);
                  throw error;
               }
            },
            
            // Actualizar
            updateTank: async (data: UpdateTankPayload, tankId: string) => {
               if (!token) throw new Error('No autenticado');
               
               try {
                   const updatedTank = await updateTankService(tankId, data);

                   setTanks((prevTanks) =>
                      prevTanks.map((t) => {
                            if (t.id === tankId) {
                               return updatedTank;
                            }
                            return t;
                      })
                   );
               } catch (error) {
                   console.error('Error al actualizar el tanque', error);
                   throw error;
               }
            },
         }}
      >
      {children}
      </TankContext.Provider>
    );
}