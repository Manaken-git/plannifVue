import { defineConfig, loadEnv, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendOrigin = env.VITE_API_PROXY_TARGET || 'http://localhost:8081';
  const backendContext = (env.VITE_API_PROXY_CONTEXT || '/planning-data').replace(/\/$/, '');

  const solverOrigin = env.VITE_SOLVER_PROXY_TARGET || 'http://localhost:8080';

  const proxyFor = (): ProxyOptions => ({
    target: backendOrigin,
    changeOrigin: true,
    secure: false,
    rewrite: (path) => `${backendContext}${path}`,
  });

  const proxyForSolver = (): ProxyOptions => ({
    target: solverOrigin,
    changeOrigin: true,
    secure: false,
    headers: {
      Origin: solverOrigin,
    },
  });

  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/profs': proxyFor(),
        '/seances': proxyFor(),
        '/classes': proxyFor(),
        '/eleves': proxyFor(),
        '/matieres': proxyFor(),
        '/salles': proxyFor(),
        '/creneaux': proxyFor(),
        '/configs': proxyFor(),
        '/vacances': proxyFor(),
        '/plannings': proxyFor(),
        '/planning/jobs': proxyForSolver(),
        '/planning/solve': proxyForSolver(),
      },
    },
  };
});
