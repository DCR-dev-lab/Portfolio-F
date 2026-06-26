import { useEffect, useState } from 'react';
import { Mail, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactCTA = ({ profile }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.2 }
        );

        const element = document.getElementById('contact-section');
        if (element) observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <section id="contact-section" className="flex justify-center items-center h-screen py-24 px-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-purple-200 font-medium">Let's Connect</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Ready to Work Together?
                    </h2>

                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision. Let's create something amazing together!
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        {profile?.email && (
                            <a href={`mailto:${profile.email}`}
                                className="group bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Email Me
                            </a>
                        )}
                        {profile?.phone && (
                            <a href={`tel:${profile.phone}`}
                                className="group bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Call Me
                            </a>
                        )}
                    </div>

                    <Link to="/contact"
                        className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all">
                        Get In Touch
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ContactCTA;
