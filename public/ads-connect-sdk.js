/**
 * ADS Connect SDK - Client para Sites Parceiros
 * 
 * SDK JavaScript para integração de tracking de impressões e cliques
 * em sites parceiros da plataforma ADS Connect.
 * 
 * @version 1.0.0
 * @author ADS Connect
 */

(function (window) {
    'use strict';

    // ============================================================================
    // CONFIGURAÇÃO
    // ============================================================================

    const ADSConnect = {
        config: {
            siteId: null,
            apiKey: null,
            supabaseUrl: null,
            debug: false,
        },

        // ============================================================================
        // INICIALIZAÇÃO
        // ============================================================================

        /**
         * Inicializa o SDK com as credenciais do site
         * @param {Object} config - Configuração
         * @param {string} config.siteId - UUID do site parceiro
         * @param {string} config.apiKey - API Key do site
         * @param {string} config.supabaseUrl - URL do projeto Supabase
         * @param {boolean} [config.debug=false] - Modo debug
         */
        init(config) {
            if (!config.siteId || !config.apiKey || !config.supabaseUrl) {
                throw new Error('ADS Connect: siteId, apiKey e supabaseUrl são obrigatórios');
            }

            this.config = {
                siteId: config.siteId,
                apiKey: config.apiKey,
                supabaseUrl: config.supabaseUrl.replace(/\/$/, ''), // Remove trailing slash
                debug: config.debug || false,
            };

            this.log('SDK inicializado', this.config);

            // Registrar tempo de carregamento da página
            window.pageLoadTime = Date.now();
        },

        // ============================================================================
        // TRACKING DE IMPRESSÕES
        // ============================================================================

        /**
         * Registra uma impressão de anúncio
         * @param {Object} data - Dados da impressão
         * @param {string} data.adId - UUID do anúncio
         * @param {string} data.slotId - UUID do slot
         * @param {Object} [data.context] - Contexto adicional
         * @returns {Promise<Object>} Resposta da API
         */
        async trackImpression(data) {
            const url = `${this.config.supabaseUrl}/functions/v1/track-impression`;

            const payload = {
                ad_id: data.adId,
                slot_id: data.slotId,
                site_id: this.config.siteId,
                context: {
                    viewport_width: window.innerWidth,
                    viewport_height: window.innerHeight,
                    user_agent: navigator.userAgent,
                    referrer: document.referrer,
                    page_url: window.location.href,
                    device_type: this.detectDevice(),
                    ...data.context,
                },
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Site-Key': this.config.apiKey,
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                this.log('Impressão registrada', result);
                return result;
            } catch (error) {
                this.error('Erro ao registrar impressão', error);
                throw error;
            }
        },

        // ============================================================================
        // TRACKING DE CLIQUES
        // ============================================================================

        /**
         * Registra um clique em anúncio
         * @param {Object} data - Dados do clique
         * @param {string} data.adId - UUID do anúncio
         * @param {string} data.slotId - UUID do slot
         * @param {string} [data.impressionId] - UUID da impressão relacionada
         * @param {Object} [data.context] - Contexto adicional
         * @returns {Promise<Object>} Resposta da API
         */
        async trackClick(data) {
            const url = `${this.config.supabaseUrl}/functions/v1/track-click`;

            const payload = {
                ad_id: data.adId,
                impression_id: data.impressionId,
                slot_id: data.slotId,
                site_id: this.config.siteId,
                context: {
                    user_agent: navigator.userAgent,
                    referrer: document.referrer,
                    page_url: window.location.href,
                    device_type: this.detectDevice(),
                    time_on_page: Date.now() - window.pageLoadTime,
                    ...data.context,
                },
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Site-Key': this.config.apiKey,
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                this.log('Clique registrado', result);
                return result;
            } catch (error) {
                this.error('Erro ao registrar clique', error);
                throw error;
            }
        },

        // ============================================================================
        // HELPERS
        // ============================================================================

        /**
         * Detecta o tipo de device
         * @returns {string} 'desktop', 'mobile' ou 'tablet'
         */
        detectDevice() {
            const ua = navigator.userAgent;

            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                return 'tablet';
            }
            if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                return 'mobile';
            }
            return 'desktop';
        },

        /**
         * Log de debug
         */
        log(...args) {
            if (this.config.debug) {
                console.log('[ADS Connect]', ...args);
            }
        },

        /**
         * Log de erro
         */
        error(...args) {
            console.error('[ADS Connect]', ...args);
        },
    };

    // ============================================================================
    // VIEWABLE IMPRESSION TRACKER
    // ============================================================================

    /**
     * Classe para tracking de impressões viewable usando Intersection Observer
     */
    class ViewableImpressionTracker {
        constructor(element, data) {
            this.element = element;
            this.data = data;
            this.startTime = null;
            this.tracked = false;
            this.impressionId = null;

            // Configurar Intersection Observer
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    threshold: 0.5, // 50% do anúncio visível
                }
            );

            this.observer.observe(element);
        }

        handleIntersection(entries) {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !this.tracked) {
                    // Anúncio ficou visível
                    this.startTime = Date.now();

                    // Aguardar 500ms visível antes de rastrear
                    setTimeout(() => {
                        if (this.isStillVisible()) {
                            this.trackImpression();
                        }
                    }, 500);
                }
            });
        }

        isStillVisible() {
            const rect = this.element.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

            return (
                rect.top >= 0 &&
                rect.bottom <= viewportHeight &&
                rect.top < viewportHeight &&
                rect.bottom > 0
            );
        }

        async trackImpression() {
            if (this.tracked) return;

            const timeVisible = Date.now() - this.startTime;

            try {
                const response = await ADSConnect.trackImpression({
                    adId: this.data.adId,
                    slotId: this.data.slotId,
                    context: {
                        is_viewable: true,
                        time_visible: timeVisible,
                        ...this.data.context,
                    },
                });

                this.tracked = true;
                this.impressionId = response.impression_id;

                ADSConnect.log('✅ Impressão viewable registrada:', response);
            } catch (error) {
                ADSConnect.error('❌ Erro ao registrar impressão viewable:', error);
            }

            // Parar de observar
            this.observer.disconnect();
        }

        getImpressionId() {
            return this.impressionId;
        }
    }

    // ============================================================================
    // CLICK TRACKER
    // ============================================================================

    /**
     * Classe para tracking de cliques com debounce
     */
    class ClickTracker {
        constructor() {
            this.clicking = false;
            this.lastClickTime = 0;
        }

        async handleClick(event, data) {
            event.preventDefault();

            // Debounce: prevenir cliques muito rápidos
            const now = Date.now();
            if (now - this.lastClickTime < 1000) {
                ADSConnect.log('⚠️ Clique muito rápido, ignorado');
                return;
            }

            if (this.clicking) {
                ADSConnect.log('⚠️ Clique já em processamento');
                return;
            }

            this.clicking = true;
            this.lastClickTime = now;

            try {
                const response = await ADSConnect.trackClick({
                    adId: data.adId,
                    impressionId: data.impressionId,
                    slotId: data.slotId,
                    context: {
                        click_x: event.clientX,
                        click_y: event.clientY,
                    },
                });

                if (!response.blocked && response.redirect_url) {
                    // Pequeno delay para garantir que o tracking foi salvo
                    setTimeout(() => {
                        window.location.href = response.redirect_url;
                    }, 100);
                } else if (response.blocked) {
                    ADSConnect.log('⚠️ Clique bloqueado (fraud score:', response.fraud_score, ')');
                    alert('Ação não permitida. Por favor, tente novamente mais tarde.');
                }
            } catch (error) {
                ADSConnect.error('❌ Erro no tracking de clique:', error);
                // Fallback: redirecionar mesmo com erro
                if (data.fallbackUrl) {
                    window.location.href = data.fallbackUrl;
                }
            } finally {
                this.clicking = false;
            }
        }
    }

    // ============================================================================
    // EXPORTAR
    // ============================================================================

    window.ADSConnect = ADSConnect;
    window.ViewableImpressionTracker = ViewableImpressionTracker;
    window.ClickTracker = ClickTracker;

})(window);
