import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { business } from '../config/business.js';

export default function Privacy() {
  useDocumentTitle('Privacy notice');
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-4xl font-bold">Privacy notice</h1>
      {business.isSample && <p className="mt-4 rounded-xl bg-cream-deep p-4">Draft for the demo. The café owner should review this notice, and a legal professional should confirm it meets local requirements before launch.</p>}
      <div className="mt-6 space-y-6 leading-relaxed">
        <section><h2 className="text-2xl font-semibold">What we collect</h2>
          <p className="mt-2">When you request a reservation we collect your name, phone number, date, time and party size. When you send a message we collect your name, email, optional phone number and your message.</p></section>
        <section><h2 className="text-2xl font-semibold">Why we collect it</h2>
          <p className="mt-2">We use these details only to respond to your request or message, such as calling you to confirm a table.</p></section>
        <section><h2 className="text-2xl font-semibold">Who can see it</h2>
          <p className="mt-2">Only authorized café staff can view requests and messages. The website is hosted on third-party services that store this data on the café’s behalf.</p></section>
        <section><h2 className="text-2xl font-semibold">Your choices</h2>
          <p className="mt-2">To ask for your details to be corrected or deleted, contact us at {business.email} or {business.phone}.</p></section>
      </div>
    </div>
  );
}
