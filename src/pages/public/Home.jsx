import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import Hero from "../../components/profile/Hero";
import AboutMe from "../../components/profile/AboutMe";
import SkillsPreview from "../../components/profile/SkillsPreview";
import FeaturedProjects from "../../components/profile/FeaturedProjects";
import ContactCTA from "../../components/profile/ContactCTA";
import PageLoader from "../../components/common/PageLoader";
import PageError from "../../components/common/PageError";

import { getProfile } from "../../services/profile.service";
import { getProjects } from "../../services/project.service";
import { getSkills } from "../../services/skill.service";
import usePageSEO from "../../hooks/usePageSEO";

// Read a count from the profile (API) and keep it inside safe limits
const readCount = (value, fallback, min, max) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? Math.min(max, Math.max(min, n)) : fallback;
};

const Home = () => {
  usePageSEO({
    title: "Denny Charles Raj | Full Stack Developer & UI Architect",
    description:
      "Official developer portfolio of Denny Charles Raj (DCR) showcasing modern full-stack web applications, system architectures, and technical skill mastery.",
  });

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [perCategory, setPerCategory] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

  const loadHomeData = async () => {
    setLoading(true);
    setLoaderGone(false);
    try {
      // Fetch in parallel; one failing request shouldn't take the whole page down
      const [profileRes, projectsRes, skillsRes] = await Promise.allSettled([
        getProfile(),
        getProjects(),
        getSkills(),
      ]);

      // The hero and contact sections need the profile, so this one is required
      if (profileRes.status === "rejected") throw profileRes.reason;
      const profileData = profileRes.value.data ?? null;
      setProfile(profileData);

      // How many to show comes from the profile settings (admin-editable), with safe limits
      const projectsLimit = readCount(profileData?.homeProjectsCount, 5, 2, 6);
      setPerCategory(readCount(profileData?.homeSkillsPerCategory, 6, 3, 10));

      const allProjects =
        projectsRes.status === "fulfilled" ? (projectsRes.value.data ?? []) : [];
      // featured projects first, then the rest, up to the limit
      const ordered = [
        ...allProjects.filter((p) => p.featured),
        ...allProjects.filter((p) => !p.featured),
      ];
      setProjects(ordered.slice(0, projectsLimit));

      // keep the full list: the skills section groups it by category itself
      setSkills(skillsRes.status === "fulfilled" ? (skillsRes.value.data ?? []) : []);

      setError("");
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  // Free hosting can take a few seconds to wake up: say so instead of looking frozen
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 3500);
    return () => clearTimeout(t);
  }, [loading]);

  // Keep the loader mounted just long enough to fade out OVER the hero,
  // so the particles start gathering while it dissolves (no hard cut)
  useEffect(() => {
    if (loading || error) return;
    const t = setTimeout(() => setLoaderGone(true), 800);
    return () => clearTimeout(t);
  }, [loading, error]);

  if (error && !loading) return <PageError error={error} onRetry={loadHomeData} />;

  return (
    <>
      {!loading && (
        <div className="flex flex-col bg-transparent">
          <Hero profile={profile} />
          <AboutMe about={profile?.aboutMe} profile={profile} />
          <FeaturedProjects projects={projects} />
          <SkillsPreview skills={skills} perCategory={perCategory} />
          <ContactCTA profile={profile} />
        </div>
      )}

      {!loaderGone &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#0c0a09] transition-opacity duration-700 ease-out ${
              loading ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <PageLoader message={slow ? "Waking things up…" : undefined} />
          </div>,
          document.body
        )}
    </>
  );
};

export default Home;
