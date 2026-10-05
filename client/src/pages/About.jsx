import PhotoSlot from '../components/PhotoSlot.jsx';
import { Interior, galleryArt } from '../components/illustrations.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { business } from '../config/business.js';

export default function About() {
  useDocumentTitle('About');
  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-bold md:text-5xl">About {business.name}</h1>
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-start">
        <div className="max-w-prose space-y-4 text-lg leading-relaxed text-espresso/90">
          <p>We’re a café focused on good coffee, simple food and a comfortable place to sit. This page is where the owner’s real story goes: who started the café, what you serve and what makes it yours.</p>
          {business.isSample && <p className="rounded-xl bg-cream-deep p-4 text-base">Sample content. Please replace this text and the photos with details and images verified and authorized by the café owner.</p>}
        </div>
        <PhotoSlot photo={business.photos[1]} art={Interior} label="Sample ambience photo" className="h-72 w-full rounded-2xl" />
      </div>
      <h2 className="mt-16 text-3xl font-semibold">Gallery</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((n) => <PhotoSlot key={n} photo={business.photos[n + 2]} art={galleryArt[n]} className="h-44 w-full rounded-2xl md:h-56" />)}
      </div>
    </div>
  );
}
