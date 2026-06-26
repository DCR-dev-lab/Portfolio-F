import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loader1 from "../../components/common/loader/Loader1";
import { useEffect, useState } from "react";

const TermsOfService = () => {
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
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">Terms of Service</p>
          <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
          <p className="text-lg leading-8 text-gray-300">
            By visiting this website, you agree to the following terms and conditions.
          </p>
        </div>

        <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-purple-200">Use of the Website</h2>
          <p className="leading-8 text-gray-300">
            This website is provided for informational and portfolio purposes. You may browse the content for personal use, but you may not copy, reuse, or redistribute it without permission.
          </p>
        </section>

        <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-purple-200">Intellectual Property</h2>
          <p className="leading-8 text-gray-300">
            All content, design, and visual elements on this website are owned by the site owner unless otherwise stated.
          </p>
        </section>

        <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-purple-200">Disclaimer</h2>
          <p className="leading-8 text-gray-300">
            The information provided on this website is for general informational purposes. I make no guarantees regarding accuracy, completeness, or availability of the content.
          </p>
        </section>

        <section className="rounded-3xl border border-white/15 bg-slate-950/50 p-8">
          <h2 className="mb-4 text-2xl font-semibold text-purple-200">Contact</h2>
          <p className="leading-8 text-gray-300">
            If you have any questions about these terms, please reach out through the contact page.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
