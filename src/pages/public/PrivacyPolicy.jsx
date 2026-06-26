import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loader1 from "../../components/common/loader/Loader1";
import { useEffect, useState } from "react";

const PrivacyPolicy = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader1 />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />

      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-20">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">Privacy Policy</p>
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-lg leading-8 text-gray-300">
            This website is built as a personal portfolio and is intended to share information about my work and contact details.
          </p>
        </div>

        <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-purple-200">Information We Collect</h2>
          <p className="leading-8 text-gray-300">
            If you contact me through the website, I may receive the information you provide such as your name, email address, or message content. I only use this information to respond to your inquiry.
          </p>
        </section>

        <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-purple-200">How I Use Your Information</h2>
          <ul className="list-disc space-y-3 pl-6 text-gray-300 leading-8">
            <li>To respond to messages sent through the contact form.</li>
            <li>To share project-related information or follow up on inquiries.</li>
            <li>To improve the website experience and content.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-purple-200">Data Protection</h2>
          <p className="leading-8 text-gray-300">
            I do not sell or rent personal information. I take reasonable care to protect any information you send me, but no method of transmission over the internet is completely secure.
          </p>
        </section>

        <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-purple-200">Contact</h2>
          <p className="leading-8 text-gray-300">
            If you have any questions about this Privacy Policy, please contact me through the contact page.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
