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
                
                // Animasyon bir kez çalıştıktan sonra (stat-item değilse bile) gözlemlemeyi bırak
                // observer.unobserve(entry.target); // Eğer her animasyon sadece bir kez tetiklenecekse bu satırı aktif bırak
                // Eğer scroll yukarı çıkıp tekrar aşağı inince animasyonun tekrar çalışmasını istiyorsan yukarıdaki satırı yorum satırı yap veya sil.
                // Not: animate-on-scroll her zaman çalışır, stat-item için ek kontrol var.
            } else {
                 // Eğer öğe görünür alandan çıkarsa 'animated' sınıfını kaldır (isteğe bağlı, tekrar animasyon için)
                 // entry.target.classList.remove('animated'); 
                 // if (entry.target.classList.contains('stat-item')) {
                 //    entry.target.dataset.counted = 'false'; // Tekrar sayılabilir yapsın
                 //    entry.target.querySelector('.stat-number').textContent = '0'; // Sayıyı sıfırla
                 // }
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
    const map = L.map('world-map').setView([20, 0], 2); // [Enlem, Boylam], Zoom seviyesi (2, dünya görünümü için uygun)

    // OpenStreetMap tile katmanını ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // ROOT değişkeninden primaryColor'ı al (CSS'ten)
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();

    // İhracat yaptığınız ülkeler ve renkleri (ISO 3 harfli kodlar ve renkler)
    // JVectorMap'teki ISO 2 harfli kodları (TR, US) ISO 3 harfliye (TUR, USA) dönüştürdük.
    // Lütfen bu listeyi kendi ihracat yaptığınız ülkelerin ISO 3-harfli kodlarıyla güncelleyin
    const exportCountriesData = {
        'TUR': { color: primaryColor, info: 'Türkiye: Önemli Bir Pazar' }, 
        'USA': { color: primaryColor, info: 'Amerika Birleşik Devletleri: Geniş Erişim' }, 
        'DEU': { color: primaryColor, info: 'Almanya: Avrupa\'nın Kalbi' }, 
        'GBR': { color: primaryColor, info: 'Birleşik Krallık: Stratejik Ortak' }, 
        'FRA': { color: primaryColor, info: 'Fransa: Batı Avrupa Pazarı' }, 
        'ESP': { color: primaryColor, info: 'İspanya: Akdeniz Bağlantısı' }, 
        'ITA': { color: primaryColor, info: 'İtalya: Güney Avrupa\'da Güçlü' }, 
        'RUS': { color: primaryColor, info: 'Rusya: Doğu\'ya Uzanan Köprü' }, 
        'CHN': { color: primaryColor, info: 'Çin: Asya\'nın Büyükleri' }, 
        'IND': { color: primaryColor, info: 'Hindistan: Yükselen Pazar' }, 
        'ARE': { color: primaryColor, info: 'Birleşik Arap Emirlikleri: Ortadoğu Merkezi' }, 
        'SAU': { color: primaryColor, info: 'Suudi Arabistan: Körfez Bölgesi' }, 
        'EGY': { color: primaryColor, info: 'Mısır: Kuzey Afrika\'ya Açılan Kapı' }, 
        'ZAF': { color: primaryColor, info: 'Güney Afrika: Afrika Kıtası' }, 
        'AUS': { color: primaryColor, info: 'Avustralya: Okyanusya Erişimi' }, 
        'CAN': { color: primaryColor, info: 'Kanada: Kuzey Amerika Partneri' }, 
        'BRA': { color: primaryColor, info: 'Brezilya: Güney Amerika\'nın Devi' }, 
        // İhracat yaptığınız diğer ülkeleri buraya ekleyebilirsiniz
        // ÖNEMLİ: Ülke kodlarının ISO 3 harfli olduğundan emin olun (örn: JPN, MEX, ARG, EGYPT değil EGY vb.)
    };

    // GeoJSON verisini yükle ve haritaya ekle
    // Bu dosya, dünya ülkelerinin coğrafi sınırlarını içerir.
    fetch('js/world-countries.geojson') 
        .then(response => {
            if (!response.ok) {
                // Hata durumunda konsola detaylı bilgi yaz
                throw new Error(`GeoJSON yüklenemedi. HTTP Durumu: ${response.status} ${response.statusText}. Dosya yolunu kontrol edin: js/world-countries.geojson`);
            }
            return response.json();
        })
        .then(geojson => {
            L.geoJson(geojson, {
                style: function(feature) {
                    // Her ülkenin özelliklerinden ISO_A3 kodunu al (GeoJSON dosyasında bu isimle)
                    const iso3 = feature.properties.ISO_A3;
                    const data = exportCountriesData[iso3]; // Kendi verimizle eşleştir

                    // Eğer o ülkeye ait veri varsa, özel renklendir
                    if (data) {
                        return {
                            fillColor: data.color,      // Veri varsa belirlenen renk
                            weight: 1,                  // Sınır kalınlığı
                            opacity: 1,                 // Sınır şeffaflığı
                            color: 'white',             // Sınır çizgisi rengi
                            fillOpacity: 0.8            // Dolgu şeffaflığı (daha opak yaptım)
                        };
                    }
                    // Veri yoksa varsayılan gri tonunda stil
                    return {
                        fillColor: '#dcdcdc', // Daha açık gri
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.6
                    };
                },
                onEachFeature: function(feature, layer) {
                    // Haritadaki her ülke için bir etkileşim tanımla
                    const countryName = feature.properties.NAME; // Ülke adı
                    const iso3 = feature.properties.ISO_A3;
                    const data = exportCountriesData[iso3];

                    // Hover (fare üzerine gelince) durumu
                    layer.on({
                        mouseover: function(e) {
                            const layer = e.target;
                            layer.setStyle({
                                weight: 3, // Sınır kalınlığını artır
                                color: '#666', // Sınır rengini değiştir
                                dashArray: '',
                                fillOpacity: 0.9 // Dolgu şeffaflığını artır
                            });
                            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                                layer.bringToFront(); // Katmanı öne getir
                            }
                            // Tooltip (bilgi kutusu) gösterme
                            layer.bindTooltip(data ? data.info : `${countryName}: Veri Yok`).openTooltip();
                        },
                        mouseout: function(e) {
                            // Fare çekildiğinde eski stiline döndür
                            // Leaflet'in resetStyle fonksiyonu ile kolayca yapılabilir
                            // Ancak Leaflet 1.9.4 için resetStyle doğrudan GeoJSON katmanında çalışmayabilir
                            // Bu yüzden stil fonksiyonunu tekrar çağırıyoruz
                            layer.setStyle(this.options.style(feature)); 
                            layer.closeTooltip();
                        },
                        click: function(e) {
                            // Tıklama olayı (isteğe bağlı, detaylı bilgi için popup)
                            if (data) {
                                layer.bindPopup(`<b>${countryName}</b><br>${data.info}`).openPopup();
                            } else {
                                layer.bindPopup(`<b>${countryName}</b><br>Bu ülkeye ait detaylı veri bulunmamaktadır.`).openPopup();
                            }
                            // Tıklanan ülkeye zoom yapma (isteğe bağlı)
                            map.fitBounds(layer.getBounds());
                        }
                    });
                }
            }).addTo(map);
        })
        .catch(error => console.error('GeoJSON yükleme hatası:', error));

}); // DOMContentLoaded bitişi
