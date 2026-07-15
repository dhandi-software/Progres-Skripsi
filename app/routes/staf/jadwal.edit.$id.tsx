import React from 'react';
import { useOutletContext } from 'react-router';
import type { ContextType } from '~/root';
import { EditJadwalDesktop, EditJadwalMobile } from '~/features/staf/jadwal';

export default function JadwalEditRoute() {
    const { isMobile } = useOutletContext<ContextType>();

    return isMobile ? <EditJadwalMobile /> : <EditJadwalDesktop />;
}
