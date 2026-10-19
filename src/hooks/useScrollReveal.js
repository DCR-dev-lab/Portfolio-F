import { useEffect, useState, useRef } from "react";

/**
 * useScrollReveal
 * Custom hook to detect when an element scrolls into view via IntersectionObserver.
 * Provides clean unobserve/cleanup handling and triggers enter animation classes.
 *
 * @param {Object} options
 * @param {number} options.threshold - Threshold ratio (0.0 - 1.0) for trigger.
 * @param {boolean} options.triggerOnce - Whether to unobserve after first trigger.
 * @returns {[React.MutableRefObject, boolean]} - [ref to attach to DOM element, isVisible boolean]
 */
export const useScrollReveal = (options = {}) => {
    const { threshold = 0.15, triggerOnce = true } = options;
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const node = elementRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(node);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [threshold, triggerOnce]);

    return [elementRef, isVisible];
};

export default useScrollReveal;
