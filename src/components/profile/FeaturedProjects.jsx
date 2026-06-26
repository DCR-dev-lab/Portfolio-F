import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import portfolioPlaceholder from '../../assets/images/portfolio-placeholder.svg';

const FeaturedProjects = ({ projects }) => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Mock data if no projects provided
    const displayProjects = projects?.length > 0 ? projects : [
        {
            _id: '1',
            title: 'E-Commerce Platform',
            description: 'A full-stack e-commerce solution with real-time inventory management and seamless checkout experience.',
            imageUrl: portfolioPlaceholder,
            tags: ['React', 'Node.js', 'MongoDB'],
            liveUrl: '#',
            githubUrl: '#',
            featured: true
        },
        {
            _id: '2',
            title: 'AI Content Generator',
            description: 'Intelligent content creation tool powered by machine learning algorithms for marketing teams.',
            imageUrl: portfolioPlaceholder,
            tags: ['Python', 'TensorFlow', 'React'],
            liveUrl: '#',
            githubUrl: '#',
            featured: true
        },
        {
            _id: '3',
            title: 'Portfolio CMS',
            description: 'Beautiful and intuitive content management system designed specifically for creative professionals.',
            imageUrl: portfolioPlaceholder,
            tags: ['Next.js', 'Tailwind', 'Sanity'],
            liveUrl: '#',
            githubUrl: '#',
            featured: false
        }
    ];

    if (!displayProjects || displayProjects.length === 0) return null;

    return (
        <section ref={sectionRef} className="relative py-32 px-6 bg-slate-50 overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="relative max-w-7xl mx-auto">
                {/* Section Header */}
                <div
                    className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                >
                    <div>
                        <div className="inline-block mb-4">
                            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Featured Work
                            </span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
                            Recent Projects
                        </h2>
                        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                    </div>

                    <Link to="/projects"
       
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                    >
                        <span>View All Projects</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayProjects.map((project, index) => (
                        <div
                            key={project._id}
                            className={`group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                            style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            <div className="relative h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                                {/* Image Container */}
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={project.imageUrl || portfolioPlaceholder}
                                        alt={project.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {project.liveUrl && (
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-3 rounded-full bg-white text-purple-600 hover:bg-purple-600 hover:text-white transition-all transform hover:scale-110"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        )}
                                        {project.githubUrl && (
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-3 rounded-full bg-white text-gray-800 hover:bg-gray-800 hover:text-white transition-all transform hover:scale-110"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Github className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Featured Badge */}
                                    {project.featured && (
                                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            Featured
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                                        {project.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {project.description}
                                    </p>

                                    {/* Tags */}
                                    {project.tags && project.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-xs font-semibold border border-purple-100"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Border Accent */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div
                    className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                >
                    <p className="text-gray-600 mb-4">
                        Want to see more of my work?
                    </p>
                    <Link to="/projects"
                        className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-4 transition-all group"
                    >
                        <span>Explore Full Portfolio</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProjects;
