import { useEffect, useState } from "react";

import Hero from "../../components/profile/Hero";
import AboutMe from "../../components/profile/AboutMe";
import SkillsPreview from "../../components/profile/SkillsPreview";
import FeaturedProjects from "../../components/profile/FeaturedProjects";
import ContactCTA from "../../components/profile/ContactCTA";
import Navbar from "../../components/common/Navbar";

import { getProfile } from "../../services/profile.service";
import { getProjects } from "../../services/project.service";
import { getSkills } from "../../services/skill.service";

import Loader1 from "../../components/common/loader/Loader1";

const Home = () => {
    const [profile, setProfile] = useState(null);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const profileRes = await getProfile();
                const projectsRes = await getProjects();
                const skillsRes = await getSkills();
                setProfile(profileRes.data ?? null);
                setProjects((projectsRes.data ?? []).slice(0, 3)); // featured
                setSkills((skillsRes.data ?? []).slice(0, 6)); // preview
            } catch (err) {
                setError(err.message || "Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        loadHomeData();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
            <div className="text-center">
                {/* <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading...</p> */}
                <Loader1 />
            </div>
        </div>
    )
    if (error) return <p className="p-8 text-red-500">{error}</p>;

    return (
        <div>
            <Navbar />
            <Hero profile={profile} />
            <AboutMe about={profile?.aboutMe} />
            <SkillsPreview skills={skills} />
            <FeaturedProjects projects={projects} />
            <ContactCTA />
        </div>
    );
};

export default Home;
