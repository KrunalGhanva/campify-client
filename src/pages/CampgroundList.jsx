import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAllCampgrounds } from '../api/campgrounds';
import CampgroundCard from '../components/CampgroundCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button, Alert, EmptyState, Icon } from '../components/ui';

const CampgroundList = () => {
    const [campgrounds, setCampgrounds] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [search, setSearch]           = useState('');
    const mapContainerRef = useRef(null);
    const mapRef          = useRef(null);
    const mapToken        = import.meta.env.VITE_MAPBOX_TOKEN;

    useEffect(() => {
        const fetchCampgrounds = async () => {
            try {
                const data = await getAllCampgrounds();
                setCampgrounds(data.campgrounds || []);
            } catch (err) {
                setError(err.response?.data?.error || 'Could not load campgrounds. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchCampgrounds();
    }, []);

    /* Mapbox cluster map */
    useEffect(() => {
        if (!loading && mapToken && campgrounds.length > 0 && mapContainerRef.current && !mapRef.current) {
            mapboxgl.accessToken = mapToken;
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/outdoors-v12',   // outdoors style
                center: [-103.59179687498357, 40.66995747013945],
                zoom: 3
            });
            map.addControl(new mapboxgl.NavigationControl());

            map.on('load', () => {
                map.addSource('campgrounds', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: campgrounds
                            .filter(c => c.geometry?.type === 'Point' && c.geometry.coordinates?.length === 2)
                            .map(c => ({
                                type: 'Feature',
                                geometry: c.geometry,
                                properties: { id: c._id, title: c.title, description: c.description, location: c.location }
                            }))
                    },
                    cluster: true, clusterMaxZoom: 14, clusterRadius: 50
                });

                map.addLayer({ id: 'clusters', type: 'circle', source: 'campgrounds', filter: ['has', 'point_count'],
                    paint: { 'circle-color': ['step', ['get', 'point_count'], '#2F5D46', 10, '#264B39', 30, '#1F2421'], 'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30] }
                });
                map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'campgrounds', filter: ['has', 'point_count'],
                    layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 12 },
                    paint: { 'text-color': '#ffffff' }
                });
                map.addLayer({ id: 'unclustered-point', type: 'circle', source: 'campgrounds', filter: ['!', ['has', 'point_count']],
                    paint: { 'circle-color': '#A64B1B', 'circle-radius': 7, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
                });

                map.on('click', 'clusters', (e) => {
                    const [f] = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                    map.getSource('campgrounds').getClusterExpansionZoom(f.properties.cluster_id, (err, zoom) => {
                        if (!err) map.easeTo({ center: f.geometry.coordinates, zoom });
                    });
                });

                map.on('click', 'unclustered-point', (e) => {
                    const { id, title, description, location } = e.features[0].properties;
                    const coords = e.features[0].geometry.coordinates.slice();
                    while (Math.abs(e.lngLat.lng - coords[0]) > 180) coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;

                    const wrap = document.createElement('div');
                    wrap.style.cssText = 'font-family:Inter,sans-serif;min-width:160px;';
                    wrap.innerHTML = `
                        <strong style="font-size:0.9rem;color:#1F2421">${title || 'Campground'}</strong>
                        <p style="font-size:0.75rem;color:#5F625B;margin:4px 0">${location || ''}</p>
                        <a href="/campgrounds/${encodeURIComponent(id)}" style="font-size:0.78rem;color:#2F5D46;font-weight:600;">View details</a>`;

                    new mapboxgl.Popup({ offset: 12 }).setLngLat(coords).setDOMContent(wrap).addTo(map);
                });

                ['clusters', 'unclustered-point'].forEach(layer => {
                    map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
                    map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
                });
            });

            mapRef.current = map;
        }
        return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, [loading, campgrounds, mapToken]);

    const filtered = campgrounds.filter(c =>
        !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.location?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSpinner label="Loading campgrounds…" />;
    if (error) {
        return (
            <div className="page-head">
                <Alert title="Couldn’t load campgrounds" onRetry={() => window.location.reload()}>{error}</Alert>
            </div>
        );
    }

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1>Campgrounds</h1>
                    <p>{campgrounds.length} campground{campgrounds.length !== 1 ? 's' : ''} shared by the community</p>
                </div>
                <Button variant="primary" icon="plus" to="/campgrounds/new">Add campground</Button>
            </div>

            {mapToken ? (
                <div ref={mapContainerRef} className="map-box" role="region" aria-label="Map of all campgrounds" />
            ) : (
                <Alert variant="warning">Map unavailable. Set <code>VITE_MAPBOX_TOKEN</code> to enable it.</Alert>
            )}

            {campgrounds.length > 0 && (
                <form className="toolbar" role="search" onSubmit={e => e.preventDefault()}>
                    <div className="input-icon toolbar__search">
                        <Icon name="search" size={16} />
                        <input
                            type="search"
                            className="input"
                            aria-label="Search campgrounds by name or location"
                            placeholder="Search by name or location"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {search && <span className="muted" role="status">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>}
                </form>
            )}

            {!campgrounds.length ? (
                <EmptyState
                    title="No campgrounds yet"
                    action={<Button variant="primary" icon="plus" to="/campgrounds/new">Add the first one</Button>}
                >
                    Nobody has listed a campground. Yours could be the first.
                </EmptyState>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon="search"
                    title="No matches"
                    action={<Button onClick={() => setSearch('')}>Clear search</Button>}
                >
                    Nothing matches “{search}”. Try a different name or place.
                </EmptyState>
            ) : (
                <div className="camp-grid">
                    {filtered.map(c => <CampgroundCard key={c._id} campground={c} />)}
                </div>
            )}
        </div>
    );
};

export default CampgroundList;
