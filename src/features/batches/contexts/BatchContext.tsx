import { useSession } from "@/features/auth/contexts/AuthContext";
import { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { createBatchService, getBatchesService } from "../services/batch.service";
import { Batch, CreateBatchPayload } from "../types/batch";

interface BatchContextType {
    batches: Batch[];
    isLoading: boolean;
    createBatch: (data: CreateBatchPayload) => Promise<void>;
    fetchBatches: () => Promise<void>;
}

const BatchContext = createContext<BatchContextType | null>(null);

export function useBatch() {
    const value = useContext(BatchContext);
    if(!value) {
        throw new Error("useBatch must be wrapped in a <BatchProvider />");
    }
    return value;
}

export function BatchProvider({ children }: PropsWithChildren) {
    const {token} = useSession();

    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const fetchBatches = useCallback(async () => {
        if(!token) return;
        try {
            setIsLoading(true);
            const pageSize = 10;
            const firstPage = await getBatchesService(1, pageSize);
            const pageCount = Math.ceil(firstPage.data.total / pageSize);
            const remainingPages = await Promise.all(
                Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
                    getBatchesService(index + 2, pageSize)
                )
            );
            setBatches([
                ...firstPage.data.items,
                ...remainingPages.flatMap((response) => response.data.items),
            ]);
        } catch(error) {
            console.error('Error al obtener los lotes', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return (
        <BatchContext.Provider
            value= {{
                batches,
                isLoading,
                //obtener
                fetchBatches,
                //crear
                createBatch: async (data: CreateBatchPayload) => {
                    const newBatch = await createBatchService(data);
                    setBatches(prev => [...prev, newBatch]);
                }
            }}
        >
        {children}    
        </BatchContext.Provider>
    )
}