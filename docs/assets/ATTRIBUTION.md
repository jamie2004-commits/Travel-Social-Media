# World-map data attribution

The offline planning wireframe uses **Natural Earth 1:110m Admin 0 Countries, version 5.1.2**. Natural Earth data is public domain; attribution is retained here for provenance.

- [Natural Earth terms of use](https://www.naturalearthdata.com/about/terms-of-use/)
- [Natural Earth downloads and map scales](https://www.naturalearthdata.com/downloads/)
- [Version-pinned source GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson)
- [Project source repository](https://github.com/nvkelso/natural-earth-vector)

Retrieved 8 September 2026. The local `world-countries.geojson` retains all 177 source country/territory features, with coordinates rounded to four decimal places and unused attributes removed. Polygon topology was otherwise unchanged. A separate approximate Singapore point at longitude 103.8198, latitude 1.3521 was added as an illustrative marker because Singapore has no polygon in this low-resolution source. It has `marker_only: true`; it is not a geographic boundary or city-count record.

Each feature includes `NAME`, `ISO_A3`, `ADM0_A3`, `SOURCE_ISO_A3`, `LABEL_X`, and `LABEL_Y`. `ISO_A3` is a convenient rendering identifier: where the source value is `-99`, it uses `ISO_A3_EH`, then `ADM0_A3`. Codes `CYN`, `SOL`, and `KOS` are Natural Earth fallback identifiers, not official ISO 3166-1 alpha-3 codes. Country count logic in a future application must use its separately reviewed country/territory catalogue.

This small-scale layer omits some small countries and islands. It is suitable for an illustrative world overview, not authoritative border decisions, complete country selection, or close-up navigation. The source's geographic treatment is retained solely for the planning illustration. Singapore is the only added marker. Renderers should support both Polygon/MultiPolygon boundaries and the added Point feature.
