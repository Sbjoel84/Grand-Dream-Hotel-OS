import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { getRoleLabel } from '../../utils/permissions';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-white mb-2">Access Restricted</h1>
      <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
        Your assigned role (
        <span className="text-amber-400 font-semibold">{user ? getRoleLabel(user.role) : 'Guest'}</span>
        ) does not have authorization permissions for this module. Please contact the General Manager or switch to an authorized role in the sidebar simulator.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>
          Go Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} icon={<Home className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
