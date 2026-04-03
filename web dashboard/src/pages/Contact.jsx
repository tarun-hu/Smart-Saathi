import React from "react";
import SupportForm from "../components/SupportForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import Data from "../data/faq.json";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/Button";
import NavBar from "../components/NavBar";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";

const Contact = () => {
  return (
    <>
      <NavBar />

      {/* Hero Section */}
      <section className='w-full bg-white p-30 border-b border-slate-200/30'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex gap-4 items-center mb-6'>
            <div className='p-3 bg-brand-accent/10 rounded-xl'>
              <MessageSquare className='w-6 h-6 text-brand-accent' />
            </div>
            <div>
              <h1 className='text-4xl font-extrabold text-slate-900 mb-3'>
                Get in Touch
              </h1>
              <p className='text-lg text-slate-600 max-w-2xl'>
                Have a question or encountered an issue? We're here to help. Reach out to our support team
                and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & FAQ Section */}
      <section className='w-full bg-neutral-800 p-30 border-b border-slate-200/30'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch'>
            {/* Form */}
            <div className='flex flex-col'>
              <div className='flex gap-3 items-center mb-8'>
                <Mail className='w-5 h-5 text-white' />
                <h2 className='text-2xl font-extrabold text-white'>Report an Issue</h2>
              </div>
              <SupportForm className='bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_12px_-8px_rgba(0,0,0,0.08)] flex-1' />
            </div>

            {/* FAQ */}
            <div className='flex flex-col'>
              <div className='flex gap-3 items-center mb-8'>
                <HelpCircle className='w-5 h-5 text-white' />
                <h2 className='text-2xl font-extrabold text-white'>Frequently Asked</h2>
              </div>
              <Card className='bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_4px_12px_-8px_rgba(0,0,0,0.08)] flex-1'>
                <Accordion className='text-slate-900' type='single' collapsible>
                  {Data.map((element, id) => (
                    <AccordionItem key={id} value={element.id}>
                      <AccordionTrigger className='hover:text-brand-accent transition-colors'>
                        {element.ques}
                      </AccordionTrigger>
                      <AccordionContent className='text-slate-600'>
                        <p>{element.ans}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
