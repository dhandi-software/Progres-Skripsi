import React from 'react';
import { useOutletContext } from 'react-router';
import type { ContextType } from '~/root';
import { CreateJadwalDesktop, CreateJadwalMobile } from '~/features/staf/jadwal';

export default function JadwalCreateRoute() {
    const { isMobile } = useOutletContext<ContextType>();

    return isMobile ? <CreateJadwalMobile /> : <CreateJadwalDesktop />;
}
