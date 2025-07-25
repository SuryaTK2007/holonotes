import { type AppClient, AppWebsocket, HolochainError } from "@holochain/client";
import { createContext, FC, useEffect, useRef, useState } from "react";

export const ClientContext = createContext<ClientContextValues>({
  client: undefined,
  error: undefined,
  loading: false,
});

const ClientProvider: FC<ClientProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();
  const holochainClient = useRef<AppClient | undefined>(undefined);

  const value = {
    client: holochainClient.current,
    error,
    loading,
  };

  useEffect(() => {
    const connectClient = async () => {
      setLoading(true);
      try {
        holochainClient.current = await AppWebsocket.connect();
      } catch (error) {
        setError(error as HolochainError);
        console.error("Failed to establish websocket connection:", error);
      } finally {
        setLoading(false);
      }
    };
    connectClient();
  }, []);

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

interface ClientContextValues {
  client: AppClient | undefined;
  error: HolochainError | undefined;
  loading: boolean;
}

interface ClientProviderProps {
  children: React.ReactNode;
}

export default ClientProvider;
