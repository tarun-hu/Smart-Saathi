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
import NavBar from "../components/NavBar";

const Contact = () => {
  return (
    <>
      <NavBar />
      <div className='mx-30 mt-12 mb-30 min-h-screen relative flex flex-row justify-between items-start '>
        <SupportForm className='bg-amber-50' />
        <Card id='faq' className='w-sm bg-amber-50 min-h-[73vh] p-5'>
          <h3 className='font-semibold'>FAQ</h3>
          <Accordion className='text-black' type='single' collapsible>
            {Data.map((element, id) => (
              <AccordionItem key={id} value={element.id}>
                <AccordionTrigger>{element.ques}</AccordionTrigger>
                <AccordionContent>
                  <p>{element.ans}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </>
  );
};

export default Contact;
