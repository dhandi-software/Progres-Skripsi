export function TrustedPartnersSection() {
    const partners = [
        "ANTAM", "FREEPORT", "VALE", "ADARO", "BUKIT ASAM"
    ];

    return (
        <section className="w-full py-20 bg-white border-b border-zinc-100/50">
            <div className="container mx-auto px-4 md:px-6 flex flex-col items-center gap-12">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-zinc-950">
                        Mitra <span className="text-orange-500">Kerja Praktek</span>
                    </h3>
                </div>
                
                <div className="w-full flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    {partners.map((partner, idx) => (
                        <div key={idx} className="h-12 md:h-16 flex items-center justify-center">
                             <img 
                                src={`https://placehold.co/200x80/white/333333?text=${partner.replace(" ", "+")}&font=montserrat`}
                                alt={`${partner} Logo`}
                                className="h-full w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 pointer-events-none mix-blend-multiply"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
