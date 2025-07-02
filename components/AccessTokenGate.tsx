import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface AccessTokenGateProps {
    onAccessGranted: () => void;
}

const ACCESS_TOKEN = 'ICPC-SOLVER-2024';
const SESSION_KEY = 'app_access_granted';

const AccessTokenGate: React.FC<AccessTokenGateProps> = ({ onAccessGranted }) => {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    const handleAccess = () => {
        if (token === ACCESS_TOKEN) {
            setError('');
            sessionStorage.setItem(SESSION_KEY, 'true');
            onAccessGranted();
        } else {
            setError('Token truy cập không chính xác. Vui lòng thử lại.');
        }
    };

    return (
        <div className="fixed inset-0 bg-primary bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-secondary rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-600">
                <div className="flex flex-col items-center text-center">
                    <KeyIcon className="h-12 w-12 text-accent mb-4" />
                    <h2 className="text-2xl font-bold text-light mb-2">Yêu Cầu Token Truy Cập</h2>
                    <p className="text-slate-400 mb-6">
                        Vui lòng nhập token để sử dụng ứng dụng.
                    </p>
                </div>
                <div className="space-y-4">
                    <input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAccess()}
                        placeholder="Nhập token..."
                        className="w-full px-4 py-2 bg-primary border border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none text-light placeholder-slate-500"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        onClick={handleAccess}
                        disabled={!token}
                        className="w-full flex justify-center items-center bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-sky-400 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessTokenGate;