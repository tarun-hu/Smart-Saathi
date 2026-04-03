import React from "react";
import NavBar from "../components/NavBar";
import Highlight from "../assets/patterns/highlight.svg?react";
import {
    Brain,
    ChartNoAxesCombined,
    MapPinned,
    Mic,
    Pill,
    Radar,
    ShieldCheck,
    Siren,
    Sparkles,
} from "lucide-react";

const seniorFeatures = [
    {
        title: "One-tap SOS",
        description:
            "A single button press triggers an instant alert to all caregivers with live GPS location and timestamp. Voice-activated distress detection recognises phrases like \"Help, I have fallen\" and responds automatically in under 2 seconds.",
        icon: Siren,
    },
    {
        title: "AI Voice Assistant",
        description:
            "Powered by Google Speech-to-Text and NLP intent classification. Seniors speak naturally - \"Call my daughter\", \"When's my next medicine?\" - and the AI processes the intent with no typing required. Supports EMERGENCY_SOS, LOG_MEDICATION, and GENERAL_QUERY intents.",
        icon: Mic,
    },
    {
        title: "Medication Reminders",
        description:
            "TTS-powered voice reminders notify users at the exact scheduled time without requiring menu navigation. Missed doses are logged and caregivers are instantly alerted. Particularly valuable for managing diabetes, hypertension, or cardiovascular conditions.",
        icon: Pill,
    },
    {
        title: "Cognitive Exercises",
        description:
            "Daily brain exercises - memory recall, pattern recognition, verbal fluency - with scoring and trend tracking. Scores are surfaced in the caregiver dashboard as brain health metrics over time.",
        icon: Brain,
    },
];

const caregiverFeatures = [
    {
        title: "Real-time Dashboard",
        description:
            "A React.js dashboard providing real-time insights: medication adherence, GPS location, vitals, mood trends, hydration, and brain exercise scores. Built with Supabase real-time subscriptions - no page refresh needed.",
        icon: ChartNoAxesCombined,
    },
    {
        title: "Live Location Tracking",
        description:
            "Caregivers view the senior's location on a live map. Geofence alerts trigger notifications when the senior leaves a pre-defined safe zone. Location is shared automatically during SOS events.",
        icon: MapPinned,
    },
    {
        title: "Secure Pairing",
        description:
            "An encrypted 8-character pairing code generated from the dashboard. Expires after 5 minutes for security. The senior enters the code in the app to establish an encrypted, verified connection.",
        icon: ShieldCheck,
    },
    {
        title: "Anomaly Detection",
        description:
            "AI flags deviations from the senior's established routine - unusually sedentary periods, missed check-ins, irregular vitals - as anomalies surfaced prominently in the dashboard for caregiver review.",
        icon: Radar,
    },
];

const FeatureItem = ({ feature }) => {
    const Icon = feature.icon;

    return (
        <article
            className='
                group
                rounded-2xl
                border border-slate-200/90
                bg-linear-to-b from-white to-slate-50
                p-6
                shadow-[0_12px_30px_-24px_rgba(15,23,42,0.65)]
                transition-all duration-250
                hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-26px_rgba(15,23,42,0.75)]
            '>
            <div className='flex items-start gap-4'>
                <div
                    className='
                        inline-flex items-center justify-center
                        rounded-xl
                        border border-brand-accent/30
                        bg-brand-accent/10
                        p-2.5
                        text-brand-accent
                        transition-transform duration-250
                        group-hover:scale-105
                    '>
                    <Icon size={20} strokeWidth={2.4} />
                </div>
                <div>
                    <h3 className='text-xl font-extrabold tracking-tight text-slate-900'>
                        {feature.title}
                    </h3>
                    <p className='mt-2.5 text-[0.98rem] leading-relaxed text-slate-600'>
                        {feature.description}
                    </p>
                </div>
            </div>
        </article>
    );
};

const PhoneMockup = ({ screenImage, title }) => {
    return (
        <div className='w-76 shrink-0 drop-shadow-[0_26px_24px_rgba(15,23,42,0.22)]'>
            <div className='w-full relative aspect-842/1589'>
                <div
                    className='
            overflow-hidden
            rounded-[2.6rem]
                        bg-black
                        absolute inset-x-[11%] inset-y-[5%]
            shadow-[0_14px_28px_-16px_rgba(2,6,23,0.7)]
          '>
                    <img
                        src={screenImage}
                        alt={title}
                        draggable={false}
                        className='object-center h-full w-full select-none object-cover'
                    />
                </div>
                <img
                    src='/iphone_gray.png'
                    alt='iPhone mockup'
                    draggable={false}
                    className='z-10 h-full w-full select-none absolute drop-shadow-[0_16px_20px_rgba(2,6,23,0.28)]'
                />
            </div>
        </div>
    );
};

const Features = () => {
    return (
        <>
            <NavBar />
            <main className='w-full'>
                <section className='relative overflow-hidden border-y border-white/25 bg-white px-7 py-14 md:px-10 lg:px-30'>
                    <div className='pointer-events-none absolute -top-18 -right-14 h-56 w-56 rounded-full bg-cyan-300/30 blur-2xl' />
                    <div className='pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-indigo-300/35 blur-2xl' />

                    <p className='inline-flex items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/10 px-4 py-1 text-sm font-semibold text-brand-accent'>
                        <Sparkles size={16} />
                        SmartSaathi Features
                    </p>
                    <h1 className='mt-4 max-w-4xl text-4xl font-black leading-tight text-slate-900 md:text-5xl lg:text-6xl'>
                        Everything SmartSaathi can do
                    </h1>
                    <p className='mt-5 max-w-3xl text-lg leading-relaxed text-slate-700'>
                        Eight core capabilities designed around the real needs of elderly
                        users and their caregivers, distilled from research and the
                        SmartSaathi project objectives.
                    </p>
                </section>

                <section className='border-b border-neutral-300 bg-neutral-300 p-30'>
                    <div className='grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center'>
                        <div>
                            <h2 className='mb-6 text-2xl font-bold tracking-[0.08em] text-black md:text-3xl'>
                                SENIOR-FACING FEATURES
                            </h2>
                            <div className='grid gap-4'>
                                {seniorFeatures.map((feature) => (
                                    <FeatureItem key={feature.title} feature={feature} />
                                ))}
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <PhoneMockup
                                screenImage='/temp/home2_filled.png'
                                title='Senior App'
                            />
                        </div>
                    </div>
                </section>

                <section className='bg-neutral-100 p-30'>
                    <div className='grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center'>
                        <div className='flex justify-center'>
                            <PhoneMockup
                                screenImage='/temp/nearby.png'
                                title='Caretaker Dashboard'
                            />
                        </div>

                        <div>
                            <h2 className='mb-6 text-2xl font-bold tracking-[0.08em] text-slate-900 md:text-3xl'>
                                CAREGIVER-FACING FEATURES
                            </h2>
                            <div className='grid gap-4'>
                                {caregiverFeatures.map((feature) => (
                                    <FeatureItem key={feature.title} feature={feature} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Features;
