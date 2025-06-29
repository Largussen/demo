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

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
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
                    countUp(numberElement, targetValue, 2000, prefix, suffix); // 2 saniyede tamamlansın
                }
                
                // Animasyon bir kez çalıştıktan sonra gözlemlemeyi bırak
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Tüm .animate-on-scroll öğelerini gözlemlemeye başla
    animateElements.forEach(element => {
        observer.observe(element);
    });

    // jVectorMap Haritası Başlatma
    // jQuery'nin yüklendiğinden emin olmak için hazır olduğunda çalıştır
    $(document).ready(function(){
        console.log('jQuery ve jVectorMap başlatılıyor...'); // Bu mesajı konsolda görmelisiniz

        // Kök değişkenlerinden renk almak için geçici bir element kullanma
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();

        // İhracat yaptığınız ülkeler ve renkleri
        // Lütfen bu listeyi kendi ihracat yaptığınız ülkelerin ISO 2-harfli kodlarıyla güncelleyin
        // Örnek: 'TR': primaryColor (Türkiye), 'US': primaryColor (Amerika), 'DE': primaryColor (Almanya) vb.
        const exportCountries = {
            'TR': primaryColor, // Türkiye
            'US': primaryColor, // Amerika Birleşik Devletleri
            'DE': primaryColor, // Almanya
            'GB': primaryColor, // Birleşik Krallık
            'FR': primaryColor, // Fransa
            'ES': primaryColor, // İspanya
            'IT': primaryColor, // İtalya
            'RU': primaryColor, // Rusya
            'CN': primaryColor, // Çin
            'IN': primaryColor, // Hindistan
            'AE': primaryColor, // Birleşik Arap Emirlikleri
            'SA': primaryColor, // Suudi Arabistan
            'EG': primaryColor, // Mısır
            'ZA': primaryColor, // Güney Afrika
            'AU': primaryColor, // Avustralya
            'CA': primaryColor, // Kanada
            'BR': primaryColor, // Brezilya
            // İhracat yaptığınız diğer ülkeleri buraya ekleyebilirsiniz
        };

        $('#world-map').vectorMap({
            map: 'world_mill', // Dünya haritası projeksiyonu (düzleştirilmiş)
            backgroundColor: '#f8f8f8', // Haritanın arkaplan rengi
            series: {
                regions: [{
                    values: exportCountries, // Vurgulanacak ülkeler ve renkleri
                    scale: [primaryColor], // Ölçek, vurgu rengini belirliyor
                    normalizeFunction: 'polynomial' // Renk normalizasyon fonksiyonu
                }]
            },
            onRegionTipShow: function(e, el, code){
                // Mouse ile üzerine gelindiğinde ülke adını ve ek bilgi gösterme
                if (exportCountries[code]) {
                    el.html(el.html() + ' (İhracat Yapılıyor)');
                } else {
                    el.html(el.html()); // Sadece ülke adını göster
                }
            }
        });
        console.log('jVectorMap başlatma kodu tamamlandı.'); // Bu mesajı da konsolda görmelisiniz
    });
});