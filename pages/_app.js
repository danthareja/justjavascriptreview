import { Provider as AuthProvider } from "next-auth/client";
import { QueryClient, QueryClientProvider } from "react-query";

import "../styles/globals.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default MyApp;
