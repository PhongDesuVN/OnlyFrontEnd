import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Check, X } from 'lucide-react';
import Footer from '../../Components/FormLogin_yen/Footer';
import Cookies from 'js-cookie';

const apiRoot = 'http://localhost:8083/api';

export default function TransportUnitOverview() {
    const [allUnits, setAllUnits] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [error,   setError]     = useState('');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res   = await fetch(`${apiRoot}/transport-units?page=0&size=1000`,
                    { headers:{Authorization:`Bearer ${Cookies.get('authToken')}`}});
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data  = await res.json();
                setAllUnits(Array.isArray(data) ? data : data.content ?? []);
                setError('');
            } catch { setError('Không thể tải dữ liệu.'); }
            finally  { setLoading(false); }
        })();
    }, []);

    const total = useMemo(() => allUnits.reduce((acc,u)=>{
        if (u.status==='PENDING_APPROVAL') acc.pending++;
        else if (u.status==='ACTIVE')     acc.active++;
        else if (u.status==='INACTIVE')   acc.inactive++;
        return acc;
    },{pending:0,active:0,inactive:0}), [allUnits]);

    const InfoCard = ({ label, value, icon }) => (
        <div className="bg-amber-50 rounded-xl shadow border border-yellow-100 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <div className="text-yellow-500 mb-3">{icon}</div>
            <p className="text-sm font-semibold uppercase text-gray-600 tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );


    return (
        <div className="mt-4">
            {loading ? (
                <p className="p-8 text-center text-gray-600 bg-white rounded-xl shadow">Đang tải...</p>
            ) : error ? (
                <p className="p-8 text-center text-red-600 bg-white rounded-xl shadow">{error}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 mt-6">
                    <InfoCard label="Đang chờ" value={total.pending} icon={<Clock size={32}/>}/>
                    <InfoCard label="Hoạt động" value={total.active} icon={<Check size={32}/>}/>
                    <InfoCard label="Không hoạt động" value={total.inactive} icon={<X size={32}/>}/>
                </div>

            )}
            <Footer/>
        </div>
    );
}
