import { useState, useEffect, useMemo, useCallback, useRef } from "react";

const defaultGetCategory = (item) => item?.category;

/**
 * Fetches a catalog list and manages loading, error, search query,
 * and category filtering state for catalog pages.
 */
const useCatalogFilter = ({
    fetcher,
    errorMessage = "Failed to load items.",
    getCategory = defaultGetCategory,
    matchesSearch = () => true,
    initialSearch = "",
    initialCategory = "All",
}) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const getCategoryRef = useRef(getCategory);
    getCategoryRef.current = getCategory;

    const matchesSearchRef = useRef(matchesSearch);
    matchesSearchRef.current = matchesSearch;

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetcherRef.current();
            setItems(res?.data ?? []);
            setError("");
        } catch (err) {
            console.error(errorMessage, err);
            setError(err.message || errorMessage);
        } finally {
            setLoading(false);
        }
    }, [errorMessage]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const categories = useMemo(() => {
        const unique = new Set(
            items.map((item) => getCategoryRef.current(item)).filter(Boolean)
        );
        return ["All", ...Array.from(unique)];
    }, [items]);

    const filteredItems = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        return items.filter((item) => {
            const matchesQuery =
                !normalizedSearch || matchesSearchRef.current(item, normalizedSearch);
            const matchesCat =
                selectedCategory === "All" ||
                getCategoryRef.current(item) === selectedCategory;

            return matchesQuery && matchesCat;
        });
    }, [items, searchQuery, selectedCategory]);

    return {
        items,
        loading,
        error,
        refetch,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        categories,
        filteredItems,
    };
};

export default useCatalogFilter;
