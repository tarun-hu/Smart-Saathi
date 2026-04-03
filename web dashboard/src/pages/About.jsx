import NavBar from "../components/NavBar";
import AiVoice from "../assets/illustrations/undraw_ai-voice-interface_7uqq.svg?react";
import MedicalCare from "../assets/illustrations/undraw_medical-care_7m9g.svg?react";
import Dashboard from "../assets/illustrations/undraw_dashboard_p93p.svg?react";

const About = () => {
  return (
    <>
      <NavBar />
      <main className='mx-8 mt-12 mb-20 lg:mx-20'>
        <section className='relative overflow-hidden rounded-[2.25rem] border border-neutral-200 bg-amber-50 p-8 shadow-sm lg:p-12'>
          <div className='pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-brand-accent/12 blur-3xl' />
          <div className='pointer-events-none absolute -left-16 bottom-20 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl' />

          <div className='relative'>
            <div className='grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-[0.22em] text-brand-accent'>
                  About Us
                </p>
                <h1 className='mt-4 text-5xl font-black leading-tight text-neutral-900 lg:text-6xl'>
                  Making elderly care safer, smarter, and more accessible.
                </h1>
                <p className='mt-6 max-w-3xl text-lg leading-relaxed text-neutral-700'>
                  SmartSaathi is built with a simple goal to make elderly care
                  safer, smarter, and more accessible. As more seniors live
                  independently, everyday challenges like memory decline, health
                  management, and isolation become serious concerns.
                </p>
              </div>

              <div className='rounded-3xl border border-neutral-200 bg-white/90 p-6'>
                <AiVoice className='mx-auto h-auto w-full max-w-md' />
              </div>
            </div>

            <div className='mt-10 grid items-center gap-10 rounded-3xl bg-neutral-100 p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8'>
              <div className='order-2 lg:order-1'>
                <MedicalCare className='h-auto w-full max-w-lg' />
              </div>
              <div className='order-1 lg:order-2'>
                <h2 className='text-3xl font-extrabold text-neutral-900'>
                  What We Believe
                </h2>
                <p className='mt-5 text-lg leading-relaxed text-neutral-700'>
                  We combine AI, speech recognition, and healthcare IoT to
                  create a system that understands users naturally and supports
                  them in real time. Instead of relying on complex apps and
                  small interfaces, SmartSaathi focuses on what matters most:
                  simplicity, accessibility, and care.
                </p>
              </div>
            </div>

            <div className='mt-10 grid items-center gap-10 rounded-3xl bg-amber-50 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8'>
              <div>
                <h2 className='text-3xl font-extrabold text-neutral-900'>
                  What We Do
                </h2>
                <p className='mt-5 text-lg leading-relaxed text-neutral-700'>
                  SmartSaathi provides a seamless way for elderly individuals to
                  interact with technology using voice-first communication. By
                  continuously capturing inputs and health data, it builds a
                  real-time understanding of a user's condition and needs.
                </p>
                <p className='mt-5 text-lg leading-relaxed text-neutral-700'>
                  Caregivers and family members stay connected, informed, and
                  ready to act when needed, ensuring safety without compromising
                  independence.
                </p>
              </div>
              <div>
                <Dashboard className='h-auto w-full max-w-lg' />
              </div>
            </div>

            <blockquote className='mt-10 rounded-2xl border border-neutral-200 bg-neutral-100 px-6 py-5 text-lg font-semibold leading-relaxed text-neutral-800 lg:text-2xl'>
              SmartSaathi helps families care proactively, not reactively,
              through voice-first support, real-time health context, and
              caregiver-ready alerts.
            </blockquote>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
