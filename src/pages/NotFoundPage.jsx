import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 bg-mesh-gradient text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8" />
        </div>

        <h1 className="text-6xl font-extrabold text-white font-heading">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested medical page or diagnostic report resource could not be located on the MedGuardian AI server.
        </p>

        <div className="flex justify-center gap-3">
          <Button variant="primary" size="md" icon={Home} onClick={() => navigate('/app/dashboard')}>
            Return to Health Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
