document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                window.location.href = targetId;
            }
        });
    });

    const countUp = (element, targetValue, duration = 2000, prefix = '', suffix = '') => {
        let startValue = 0;
        const startTime = performance.now();

        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentValue = Math.floor(progress * targetValue);

            element.textContent = prefix + currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = prefix + targetValue + suffix;
            }
        };

        requestAnimationFrame(updateCount);
    };

    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');

                if (entry.target.classList.contains('stat-item')) {
                    const numberElement = entry.target.querySelector('.stat-number');
                    const targetValue = parseInt(entry.target.dataset.targetValue);
                    const prefix = entry.target.dataset.prefix || '';
                    const suffix = entry.target.dataset.suffix || '';
                    if (!entry.target.dataset.counted) {
                        countUp(numberElement, targetValue, 2000, prefix, suffix);
                        entry.target.dataset.counted = 'true';
                    }
                }
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        observer.observe(element);
    });

    const map = L.map('world-map', { scrollWheelZoom: false }).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();

    const exportCountriesData = {
        'IDN': { color: 'red', info: 'Endonezya' },
        'BGD': { color: 'red', info: 'Bangladeş' },
        'IND': { color: 'red', info: 'Hindistan' },
        'MRT': { color: 'red', info: 'Moritanya' },
        'MAR': { color: 'red', info: 'Fas' },
        'DZA': { color: 'red', info: 'Cezayir' },
        'TUN': { color: 'red', info: 'Tunus' },
        'LBY': { color: 'red', info: 'Libya' },
        'SDN': { color: 'red', info: 'Sudan' },
        'ETH': { color: 'red', info: 'Etiyopya' },
        'EGY': { color: 'red', info: 'Mısır' },
        'JOR': { color: 'red', info: 'Ürdün' },
        'PSE': { color: 'red', info: 'Filistin' },
        'SYR': { color: 'red', info: 'Suriye' },
        'IRQ': { color: 'red', info: 'Irak' },
        'IRN': { color: 'red', info: 'İran' },
        'BIH': { color: 'red', info: 'Bosna Hersek' },
        'ALB': { color: 'red', info: 'Arnavutluk' },
        'SRB': { color: 'red', info: 'Sırbistan' },
        'SAU': { color: 'red', info: 'Suudi Arabistan' },
        'CMR': { color: 'red', info: 'Kamerun' },
        'MNG': { color: 'red', info: 'Moğolistan' },
    };

    fetch('world-countries.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(`GeoJSON yüklenemedi. HTTP Durumu: ${response.status} ${response.statusText}. Dosya yolunu kontrol edin: world-countries.geojson`);
            }
            return response.json();
        })
        .then(geojson => {
            L.geoJson(geojson, {
                style: function(feature) {
                    const iso3 = feature.properties['ISO3166-1-Alpha-3'];
                    const data = exportCountriesData[iso3];
                    if (data) {
                        return {
                            fillColor: data.color,
                            weight: 1,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.8
                        };
                    }
                    return {
                        fillColor: '#dcdcdc',
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.6
                    };
                },
                onEachFeature: function(feature, layer) {
                    const countryName = feature.properties.NAME || 'Bilinmeyen Ülke';
                    const iso3 = feature.properties['ISO3166-1-Alpha-3'];
                    const data = exportCountriesData[iso3];

                    if (data) {
                        layer.bindTooltip(`<b>${data.info}</b>`, {
                            sticky: true
                        });
                    }

                    layer.on({
                        mouseover: function(e) {
                            const layer = e.target;
                            
                            if (layer.getTooltip()) {
                                layer.openTooltip();
                            }
                        },
                        mouseout: function(e) {
                            const layer = e.target;
                            
                            if (layer.getTooltip()) {
                                layer.closeTooltip();
                            }
                        },
                        click: function(e) {
                            
                        }
                    });
                }
            }).addTo(map);
        })
        .catch(error => console.error('GeoJSON yükleme hatası:', error));

});
