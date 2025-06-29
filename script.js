document.addEventListener('DOMContentLoaded', () => {
    // Header kaydırma efekti
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // 50px aşağı kaydırıldığında
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Sayfa içi smooth scroll (eğer navigasyon linkleri aynı sayfada belirli id'lere bağlıysa)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            // Eğer hedef dış bir sayfaya değilse (products.html gibi), smooth scroll yap
            if (targetId.startsWith('#')) {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                // Eğer farklı bir HTML sayfasına gidiyorsa, normal link davranışı
                window.location.href = targetId;
            }
        });
    });

    // Sayı sayma animasyonu fonksiyonu
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
                element.textContent = prefix + targetValue + suffix; // Tam hedef değere ulaştığından emin ol
            }
        };

        requestAnimationFrame(updateCount);
    };

    // Scroll animasyonları için Intersection Observer
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null, // Viewport'ı kök olarak kullan
        rootMargin: '0px', // Kenar boşluğu ekleme
        threshold: 0.2 // Öğenin %20'si görünür olduğunda tetikle
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Eğer öğe görünür alana girerse 'animated' sınıfını ekle
                entry.target.classList.add('animated');

                // Eğer bu bir stat-item ise, sayıyı animasyonlu bir şekilde saydır
                if (entry.target.classList.contains('stat-item')) {
                    const numberElement = entry.target.querySelector('.stat-number');
                    const targetValue = parseInt(entry.target.dataset.targetValue);
                    const prefix = entry.target.dataset.prefix || '';
                    const suffix = entry.target.dataset.suffix || '';
                    // Sadece bir kez sayması için, animasyon bittikten sonra gözlemi durdur
                    if (!entry.target.dataset.counted) { // Henüz sayılmadıysa
                        countUp(numberElement, targetValue, 2000, prefix, suffix); // 2 saniyede tamamlansın
                        entry.target.dataset.counted = 'true'; // Sayıldığını işaretle
                    }
                }
            }
        });
    }, observerOptions);

    // Tüm .animate-on-scroll öğelerini gözlemlemeye başla
    animateElements.forEach(element => {
        observer.observe(element);
    });


    // =========================================================
    // LEAFLET HARİTA KODU BURADA BAŞLIYOR
    // =========================================================

    // Harita div'inin ID'si: 'world-map'
    const map = L.map('world-map', { scrollWheelZoom: false }).setView([20, 0], 2); // [Enlem, Boylam], Zoom seviyesi (2, dünya görünümü için uygun)

    // OpenStreetMap tile katmanını ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // ROOT değişkeninden primaryColor'ı al (CSS'ten)
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();

    // İhracat yaptığınız ülkeler ve renkleri (ISO 3 harfli kodlar ve renkler)
    // Lütfen bu listeyi kendi ihracat yaptığınız ülkelerin ISO 3-harfli kodlarıyla güncelleyin
    const exportCountriesData = {
        
        'IDN': { color: 'red', info: 'Endonezya: Satış Bölgesi' },
        'BGD': { color: 'red', info: 'Bangladeş: Satış Bölgesi' },
        'IND': { color: 'red', info: 'Hindistan: Satış Bölgesi' },
        'MRT': { color: 'red', info: 'Moritanya: Satış Bölgesi' },
        'MAR': { color: 'red', info: 'Fas: Satış Bölgesi' },
        'DZA': { color: 'red', info: 'Cezayir: Satış Bölgesi' },
        'TUN': { color: 'red', info: 'Tunus: Satış Bölgesi' },
        'LBY': { color: 'red', info: 'Libya: Satış Bölgesi' },
        'SDN': { color: 'red', info: 'Sudan: Satış Bölgesi' },
        'ETH': { color: 'red', info: 'Etiyopya: Satış Bölgesi' },
        'EGY': { color: 'red', info: 'Mısır: Satış Bölgesi' },
        'JOR': { color: 'red', info: 'Ürdün: Satış Bölgesi' },
        'PSE': { color: 'red', info: 'Filistin: Satış Bölgesi' },
        'SYR': { color: 'red', info: 'Suriye: Satış Bölgesi' },
        'IRQ': { color: 'red', info: 'Irak: Satış Bölgesi' },
        'IRN': { color: 'red', info: 'İran: Satış Bölgesi' },
        'BIH': { color: 'red', info: 'Bosna Hersek: Satış Bölgesi' },
        'ALB': { color: 'red', info: 'Arnavutluk: Satış Bölgesi' },
        'SRB': { color: 'red', info: 'Sırbistan: Satış Bölgesi' },
        'SAU': { color: 'red', info: 'Suudi Arabistan: Satış Bölgesi' },
        'CMR': { color: 'red', info: 'Kamerun: Satış Bölgesi' },
        'MNG': { color: 'red', info: 'Moğolistan: Satış Bölgesi' },
        // İhracat yaptığınız diğer ülkeleri buraya ekleyebilirsiniz
    };

    // GeoJSON verisini yükle ve haritaya ekle
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
                    const countryName = feature.properties.NAME || 'Bilinmeyen Ülke'; // Yedek isim korundu ama mouseover'da kullanılmayacak
                    const iso3 = feature.properties['ISO3166-1-Alpha-3'];
                    const data = exportCountriesData[iso3];

                    // Sadece data varsa tooltip'i bind et, içerik olarak direkt data.info kullanıldı
                    if (data) {
                        layer.bindTooltip(`<b>${data.info}</b>`, { // DEĞİŞİKLİK BURADA: data.info kullanıldı
                            sticky: true // Fareyi takip etmesi için sticky
                        });
                    }

                    layer.on({
                        mouseover: function(e) {
                            const layer = e.target;
                            // Stil değişikliği kaldırıldı. Ülke rengi koyulaşmayacak.
                            // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            //     layer.bringToFront(); // Z-index yükseltme de kaldırıldı
                            // }
                            // Eğer bu layer'a bir tooltip bind edilmişse, aç
                            if (layer.getTooltip()) {
                                layer.openTooltip();
                            }
                        },
                        mouseout: function(e) {
                            // Stil değişikliği kaldırıldı.
                            // layer.setStyle(this.options.style(feature));
                            // Sadece layer'a bir tooltip bind edilmişse kapat
                            if (layer.getTooltip()) {
                                layer.closeTooltip();
                            }
                        },
                        click: function(e) {
                            // Tıklama olayında ise tam bilgiyi (Ülke Adı ve Satış Bölgesi) göstermeye devam et
                            if (data) {
                                layer.bindPopup(`<b>${countryName}</b><br>${data.info}`).openPopup();
                            } else {
                                layer.bindPopup(`<b>${countryName}</b><br>Bu ülkeye ait detaylı veri bulunmamaktadır.`).openPopup();
                            }
                            map.fitBounds(layer.getBounds());
                        }
                    });
                }
            }).addTo(map);
        })
        .catch(error => console.error('GeoJSON yükleme hatası:', error));

}); // DOMContentLoaded bitişi
