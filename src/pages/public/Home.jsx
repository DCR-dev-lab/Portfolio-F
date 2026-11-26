import { useEffect, useState } from "react";

import Hero from "../../components/profile/Hero";
import AboutMe from "../../components/profile/AboutMe";
import SkillsPreview from "../../components/profile/SkillsPreview";
import FeaturedProjects from "../../components/profile/FeaturedProjects";
import ContactCTA from "../../components/profile/ContactCTA";
import WaypointRail from "../../components/common/WaypointRail";
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

const CACHE_KEY = "dcr_home_cache_v1";

const getCachedHomeData = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCachedHomeData = (data) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    sessionStorage.setItem("dcr_visited_home", "true");
  } catch {
    // quota exceeded or private mode, safe to ignore
  }
};

const Home = () => {
  usePageSEO({
    title: "Denny Charles Raj | Full Stack Developer & UI Architect",
    description:
      "Official developer portfolio of Denny Charles Raj (DCR) showcasing modern full-stack web applications, system architectures, and technical skill mastery.",
  });

  const [cached] = useState(() => getCachedHomeData());
  const isReturnVisit = Boolean(cached?.profile);

  const [profile, setProfile] = useState(() => cached?.profile ?? null);
  const [projects, setProjects] = useState(() => cached?.projects ?? []);
  const [skills, setSkills] = useState(() => cached?.skills ?? []);
  const [perCategory, setPerCategory] = useState(() => cached?.perCategory ?? 8);
  const [loading, setLoading] = useState(() => !isReturnVisit);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);

  const loadHomeData = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
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
      const projectsLimit = readCount(profileData?.homeProjectsCount, 7, 1, 20);
      const computedPerCategory = readCount(profileData?.homeSkillsPerCategory, 8, 1, 20);
      setPerCategory(computedPerCategory);

      const allProjects =
        projectsRes.status === "fulfilled" ? (projectsRes.value.data ?? []) : [];
      // featured projects first, then the rest, up to the limit
      const ordered = [
        ...allProjects.filter((p) => p.featured),
        ...allProjects.filter((p) => !p.featured),
      ];
      const finalProjects = ordered.slice(0, projectsLimit);
      setProjects(finalProjects);

      // keep the full list: the skills section groups it by category itself
      const finalSkills = skillsRes.status === "fulfilled" ? (skillsRes.value.data ?? []) : [];
      setSkills(finalSkills);

      // Store in session cache for instant future returns
      setCachedHomeData({
        profile: profileData,
        projects: finalProjects,
        skills: finalSkills,
        perCategory: computedPerCategory,
      });

      setError("");
    } catch (err) {
      // If we already have cached data rendered, don't flash an error screen
      if (!isReturnVisit) {
        setError(err.message || "Failed to load data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData(isReturnVisit);
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

  if (error && !loading) return <PageError error={error} onRetry={() => loadHomeData(false)} />;

  return (
    <>
      <WaypointRail />
      <div className="flex flex-col bg-transparent">
        <Hero profile={profile} isReturnVisit={isReturnVisit} />
        <AboutMe about={profile?.aboutMe} profile={profile} />
        <FeaturedProjects projects={projects} loading={loading && projects.length === 0} />
        <SkillsPreview skills={skills} perCategory={perCategory} loading={loading && skills.length === 0} />
        <ContactCTA profile={profile} />
      </div>

      {slow && loading && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-[11px] font-mono text-stone-300 backdrop-blur-md shadow-lg animate-pulse"
        >
          Waking things up…
        </div>
      )}
    </>
  );
};

export default Home;
