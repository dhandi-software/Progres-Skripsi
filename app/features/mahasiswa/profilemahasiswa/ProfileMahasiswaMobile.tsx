import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { pengajuanApi } from "~/api/pengajuan";
import { bimbinganApi } from "~/api/bimbinganApi";
import { ProfileHeader } from "./components/profile-header";
import { ProfileDetails } from "./components/profile-details";
import { BadgeWall } from "./components/badge-wall";
import { ProgressStats } from "./components/progress-stats";

export function ProfileMahasiswaMobile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [bimbinganTasks, setBimbinganTasks] = useState<any[]>([]);

    const fetchData = () => {
        pengajuanApi.getProfile().then(setProfile).catch(console.error);
        if (user?.id) {
            bimbinganApi.getMahasiswaAllTasks()
                .then(tasks => {
                    const grouped = tasks.reduce((acc: any, task: any) => {
                        if (!acc[task.topik] || task.versi > acc[task.topik].versi) acc[task.topik] = task;
                        return acc;
                    }, {});
                    setBimbinganTasks(Object.values(grouped));
                })
                .catch(console.error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    return (
        <div className="space-y-6 pb-20 font-geist animate-in slide-in-from-bottom-4 duration-700">
            <ProfileHeader profile={profile} onUpdate={fetchData} />
            <div className="px-5 space-y-6">
                <ProfileDetails profile={profile} onUpdate={fetchData} />
                <ProgressStats bimbinganTasks={bimbinganTasks} />
                <BadgeWall bimbinganTasks={bimbinganTasks} />
            </div>
            
            <div className="text-center py-8">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    Portofolio Akademik &bull; UP
                </p>
            </div>
        </div>
    );
}
