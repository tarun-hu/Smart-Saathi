import NavBar from "../components/NavBar";
import AiVoice from "../assets/illustrations/undraw_ai-voice-interface_7uqq.svg?react";
import MedicalCare from "../assets/illustrations/undraw_medical-care_7m9g.svg?react";
import Dashboard from "../assets/illustrations/undraw_dashboard_p93p.svg?react";
import { Brain, ShieldCheck, Sparkles, Mic } from "lucide-react";

const principles = [
  {
    title: "Voice-First Access",
    description:
      "Interactions are designed around natural speech so seniors can use the product comfortably without navigating complex menus.",
    icon: Mic,
  },
  {
    title: "Safety by Default",
    description:
      "Alerts, reminders, and health context are prioritized so family members can respond quickly when something important changes.",
    icon: ShieldCheck,
  },
  {
    title: "Human-Centered AI",
    description:
      "AI assists decision-making while keeping family members in control with transparent, actionable insights.",
    icon: Brain,
  },
];

const About = () => {
  return (
    <>
      <NavBar />
      <main className='w-full'>
        <section className='relative overflow-hidden border-y border-white/25 bg-white p-30'>
          <div className='pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-brand-accent/12 blur-3xl' />
          <div className='pointer-events-none absolute -left-16 bottom-20 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl' />

          <div className='relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]'>
            <div>
              <h1 className='mt-4 text-5xl font-black leading-tight text-neutral-900 lg:text-6xl'>
                Making elderly care safer, smarter, and more accessible.
              </h1>
              <p className='mt-6 max-w-3xl text-lg leading-relaxed text-neutral-700'>
                Smart Saathi is built with a simple goal to make elderly care
                safer, smarter, and more accessible. As more seniors live
                independently, everyday challenges like memory decline, health
                management, and isolation become serious concerns.
              </p>
            </div>

            <div className='flex justify-center'>
              <AiVoice className='mx-auto h-auto w-full max-w-md drop-shadow-[-16px_20px_24px_rgba(15,23,42,0.42)]' />
            </div>
          </div>
        </section>

        <section className='border-b border-neutral-300 bg-neutral-300 p-30'>
          <div className='grid gap-5 lg:grid-cols-3'>
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className='rounded-2xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50 p-6 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.65)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-26px_rgba(15,23,42,0.75)]'>
                  <span className='inline-flex items-center justify-center rounded-xl border border-brand-accent/30 bg-brand-accent/10 p-2.5 text-brand-accent'>
                    <Icon size={20} strokeWidth={2.4} />
                  </span>
                  <h3 className='mt-4 text-2xl font-extrabold tracking-tight text-slate-900'>
                    {item.title}
                  </h3>
                  <p className='mt-3 text-[0.98rem] leading-relaxed text-slate-600'>
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className='bg-neutral-100 p-30'>
          <div className='grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]'>
            <div className='order-2 flex justify-center lg:order-1'>
              <MedicalCare className='h-auto w-full max-w-lg drop-shadow-[0_20px_22px_rgba(15,23,42,0.25)]' />
            </div>
            <div className='order-1 lg:order-2'>
              <h2 className='text-4xl font-extrabold text-neutral-900'>
                What We Believe
              </h2>
              <p className='mt-5 text-lg leading-relaxed text-neutral-700'>
                We combine AI, speech recognition, and healthcare IoT to create
                a system that understands users naturally and supports them in
                real time. Instead of relying on complex apps and small
                interfaces, Smart Saathi focuses on what matters most:
                simplicity, accessibility, and care.
              </p>
            </div>
          </div>

          <div className='mt-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]'>
            <div>
              <h2 className='text-4xl font-extrabold text-neutral-900'>
                What We Do
              </h2>
              <p className='mt-5 text-lg leading-relaxed text-neutral-700'>
                Smart Saathi provides a seamless way for elderly individuals to
                interact with technology using voice-first communication. By
                continuously capturing inputs and health data, it builds a
                real-time understanding of a user's condition and needs.
              </p>
              <p className='mt-5 text-lg leading-relaxed text-neutral-700'>
                Family members stay connected, informed, and ready to act when
                needed, ensuring safety without compromising independence.
              </p>
            </div>

            <div className='flex justify-center'>
              <Dashboard className='h-auto w-full max-w-lg drop-shadow-[0_20px_22px_rgba(15,23,42,0.25)]' />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
