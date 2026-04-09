import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { pengajuanApi } from "~/api/pengajuan";
import { bimbinganApi } from "~/api/bimbinganApi";
import { ProfileHeader } from "./components/profile-header";
import { BadgeWall } from "./components/badge-wall";
import { ProgressStats } from "./components/progress-stats";

export function ProfileMahasiswaDesktop() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [bimbinganTasks, setBimbinganTasks] = useState<any[]>([]);

    const fetchData = () => {
        pengajuanApi.getProfile().then(setProfile).catch(console.error);
        if (user?.id) {
            bimbinganApi.getMahasiswaAllTasks()
                .then(tasks => {
                    if (tasks && Array.isArray(tasks)) {
                        setBimbinganTasks(tasks); // Keep all tasks for badge logic (revisions included)
                    }
                })
                .catch(console.error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto font-geist animate-in fade-in duration-700">
            <ProfileHeader profile={profile} onUpdate={fetchData} />
            <ProgressStats bimbinganTasks={bimbinganTasks} />
            <BadgeWall bimbinganTasks={bimbinganTasks} />
            
            {/* Additional info footer */}
            <div className="text-center py-12 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-400">
                    Sistem Manajemen Skripsi &bull; Universitas Pancasila
                </p>
            </div>
        </div>
    );
}
