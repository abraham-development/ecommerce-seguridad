-- ================================================================
-- AFCR Seguridad — Seed Data
-- Run this after the migration is applied
-- ================================================================

-- ========================
-- BRANDS
-- ========================
INSERT INTO public.brands (name, description) VALUES
  ('Hikvision', 'Líder mundial en videovigilancia con tecnología AcuSense e IA avanzada'),
  ('Dahua', 'Soluciones integrales de videovigilancia con IA incorporada'),
  ('Axis', 'Pioneros en cámaras IP de red, calidad y confiabilidad profesional'),
  ('Reolink', 'Seguridad inteligente accesible para el hogar y pequeñas empresas'),
  ('Ezviz', 'Smart home security con integración a ecosistemas inteligentes'),
  ('TP-Link Tapo', 'Vigilancia conectada WiFi simple y económica')
ON CONFLICT DO NOTHING;

-- ========================
-- CATEGORIES
-- ========================
INSERT INTO public.categories (name, slug, description) VALUES
  ('Cámaras IP', 'camaras-ip', 'Cámaras de red de alta definición con grabación remota'),
  ('Domo', 'domo', 'Cámaras tipo domo discretas y resistentes al vandalismo'),
  ('PTZ', 'ptz', 'Cámaras Pan-Tilt-Zoom con seguimiento automático de objetivos'),
  ('Exterior', 'exterior', 'Cámaras resistentes a la intemperie para uso exterior IP66/IP67'),
  ('Interior', 'interior', 'Cámaras compactas para vigilancia en interiores'),
  ('NVR/DVR', 'nvr-dvr', 'Grabadores de video en red para almacenamiento centralizado'),
  ('Accesorios', 'accesorios', 'Soportes, cables, fuentes de alimentación y más')
ON CONFLICT DO NOTHING;

-- ========================
-- PRODUCTS (20 items)
-- ========================
-- Using subqueries to get brand/category IDs dynamically

INSERT INTO public.products (name, slug, description, price, stock, brand_id, category_id, images, specs) VALUES
(
  'Hikvision DS-2CD2143G2-I 4MP AcuSense',
  'hikvision-ds-2cd2143g2-i-4mp',
  'Cámara IP domo 4MP con inteligencia artificial AcuSense, visión nocturna infrarroja de 40m, resistente al vandalismo IK10.',
  85000, 15,
  (SELECT id FROM brands WHERE name = 'Hikvision'),
  (SELECT id FROM categories WHERE slug = 'domo'),
  '{}',
  '{"resolution": "4MP (2688x1520)", "night_vision": "40m IR", "ip_rating": "IP67/IK10", "connectivity": "PoE/RJ45", "fov": "103°", "compression": "H.265+", "audio": "Micrófono integrado"}'::jsonb
),
(
  'Dahua IPC-HDW2849H-S-IL 8MP Smart Dual Light',
  'dahua-ipc-hdw2849h-s-il-8mp',
  'Cámara IP domo 8MP con luz dual inteligente, detección de personas y vehículos, visión nocturna a color.',
  120000, 8,
  (SELECT id FROM brands WHERE name = 'Dahua'),
  (SELECT id FROM categories WHERE slug = 'domo'),
  '{}',
  '{"resolution": "8MP (3840x2160) 4K", "night_vision": "30m color / 30m IR", "ip_rating": "IP67/IK10", "connectivity": "PoE", "fov": "102°", "compression": "H.265+"}'::jsonb
),
(
  'Hikvision DS-2DE4425IWG-E PTZ 4MP 25x',
  'hikvision-ds-2de4425iwg-e-ptz-4mp',
  'Cámara PTZ de red 4MP con zoom óptico 25x, seguimiento automático de objetivos, resistente a la intemperie.',
  450000, 3,
  (SELECT id FROM brands WHERE name = 'Hikvision'),
  (SELECT id FROM categories WHERE slug = 'ptz'),
  '{}',
  '{"resolution": "4MP", "zoom": "25x óptico / 16x digital", "night_vision": "100m IR", "ip_rating": "IP66", "connectivity": "PoE+/Ethernet", "fov": "58.1° ~ 2.5°"}'::jsonb
),
(
  'Reolink RLC-810A 4K PoE Exterior',
  'reolink-rlc-810a-4k-poe',
  'Cámara exterior 4K con detección inteligente de personas, vehículos y mascotas. Resistente IP66.',
  65000, 22,
  (SELECT id FROM brands WHERE name = 'Reolink'),
  (SELECT id FROM categories WHERE slug = 'exterior'),
  '{}',
  '{"resolution": "8MP (3840x2160) 4K", "night_vision": "30m IR", "ip_rating": "IP66", "connectivity": "PoE", "fov": "89°", "storage": "MicroSD hasta 256GB"}'::jsonb
),
(
  'Ezviz C6N 1080p Interior WiFi',
  'ezviz-c6n-1080p-interior',
  'Cámara interior WiFi con rotación 360°, seguimiento de movimiento, audio bidireccional.',
  28000, 45,
  (SELECT id FROM brands WHERE name = 'Ezviz'),
  (SELECT id FROM categories WHERE slug = 'interior'),
  '{}',
  '{"resolution": "1080p Full HD", "night_vision": "10m IR", "connectivity": "WiFi 2.4GHz", "fov": "360° horizontal", "storage": "MicroSD hasta 256GB / Cloud", "audio": "Bidireccional"}'::jsonb
),
(
  'TP-Link Tapo C320WS Exterior Color Night Vision',
  'tp-link-tapo-c320ws-exterior',
  'Cámara exterior 4MP con visión nocturna a color, resistente al agua y polvo.',
  38000, 30,
  (SELECT id FROM brands WHERE name = 'TP-Link Tapo'),
  (SELECT id FROM categories WHERE slug = 'exterior'),
  '{}',
  '{"resolution": "4MP (2560x1440)", "night_vision": "30m color", "ip_rating": "IP66", "connectivity": "WiFi 2.4/5GHz", "fov": "89°", "storage": "MicroSD hasta 512GB"}'::jsonb
),
(
  'Dahua NVR4108HS-8P-EI NVR 8 Canales PoE',
  'dahua-nvr4108hs-8p-ei-8-canales',
  'Grabador de red 8 canales con 8 puertos PoE integrados, soporte H.265+, resolución hasta 4K.',
  180000, 6,
  (SELECT id FROM brands WHERE name = 'Dahua'),
  (SELECT id FROM categories WHERE slug = 'nvr-dvr'),
  '{}',
  '{"channels": 8, "resolution": "Hasta 4K", "compression": "H.265+/H.264", "storage": "Hasta 2 HDDs 20TB", "connectivity": "8x PoE + 1x RJ45", "poe": "8 puertos 802.3af/at"}'::jsonb
),
(
  'Hikvision DS-7608NI-K2 NVR 8 Canales',
  'hikvision-ds-7608ni-k2-nvr-8',
  'NVR 8 canales de alta definición, soporte H.265+, decodificación hasta 4K, 2 bahías HDD.',
  155000, 10,
  (SELECT id FROM brands WHERE name = 'Hikvision'),
  (SELECT id FROM categories WHERE slug = 'nvr-dvr'),
  '{}',
  '{"channels": 8, "resolution": "Hasta 8MP", "compression": "H.265+", "storage": "2x HDD hasta 10TB c/u", "connectivity": "1x RJ45", "frame_rate": "80Mbps entrada"}'::jsonb
),
(
  'Axis P3245-V 2MP Fixed Dome',
  'axis-p3245-v-2mp-fixed-dome',
  'Cámara domo fija de gama profesional con enfoque automático, WDR Forensic Capture, resistente IK10.',
  210000, 4,
  (SELECT id FROM brands WHERE name = 'Axis'),
  (SELECT id FROM categories WHERE slug = 'domo'),
  '{}',
  '{"resolution": "2MP (1080p)", "night_vision": "IR incorporado", "ip_rating": "IP42/IK10", "connectivity": "PoE IEEE 802.3af", "compression": "H.264/H.265/MJPEG", "audio": "Sí"}'::jsonb
),
(
  'Reolink Argus 3 Pro Solar 4MP',
  'reolink-argus-3-pro-solar',
  'Cámara inalámbrica 4MP con panel solar incluido, batería recargable, sin necesidad de cables.',
  75000, 18,
  (SELECT id FROM brands WHERE name = 'Reolink'),
  (SELECT id FROM categories WHERE slug = 'exterior'),
  '{}',
  '{"resolution": "4MP (2560x1440)", "night_vision": "10m color / 10m IR", "ip_rating": "IP65", "connectivity": "WiFi 2.4GHz", "storage": "MicroSD + Nube", "power": "Solar + batería 5200mAh"}'::jsonb
),
(
  'Hikvision DS-2CD2T47G2-L 4MP ColorVu',
  'hikvision-ds-2cd2t47g2-l-4mp-colorvu',
  'Cámara bala exterior 4MP con tecnología ColorVu para imagen a color las 24hs, con audio integrado.',
  95000, 12,
  (SELECT id FROM brands WHERE name = 'Hikvision'),
  (SELECT id FROM categories WHERE slug = 'exterior'),
  '{}',
  '{"resolution": "4MP (2688x1520)", "night_vision": "60m color 24/7", "ip_rating": "IP67", "connectivity": "PoE", "fov": "86°", "audio": "Micrófono integrado", "compression": "H.265+"}'::jsonb
),
(
  'Dahua IPC-HFW2849S-S-IL 8MP Full-Color',
  'dahua-ipc-hfw2849s-s-il-8mp',
  'Cámara bala exterior 8MP con visión nocturna a color completa, luz blanca y LED IR.',
  110000, 9,
  (SELECT id FROM brands WHERE name = 'Dahua'),
  (SELECT id FROM categories WHERE slug = 'exterior'),
  '{}',
  '{"resolution": "8MP 4K (3840x2160)", "night_vision": "30m color", "ip_rating": "IP67", "connectivity": "PoE", "fov": "102°", "compression": "H.265+"}'::jsonb
),
(
  'Soporte de Pared Universal para Cámaras Domo',
  'soporte-pared-universal-domo',
  'Soporte de pared de aluminio resistente compatible con la mayoría de cámaras domo.',
  3500, 100,
  NULL,
  (SELECT id FROM categories WHERE slug = 'accesorios'),
  '{}',
  '{"dimensions": "120x80x60mm", "weight": "250g"}'::jsonb
),
(
  'Cable UTP Cat6 305m Exterior',
  'cable-utp-cat6-305m-exterior',
  'Rollo de cable UTP categoría 6 de 305 metros para uso exterior con doble cubierta.',
  42000, 20,
  NULL,
  (SELECT id FROM categories WHERE slug = 'accesorios'),
  '{}',
  '{"dimensions": "305m por rollo", "connectivity": "Cat6 UTP", "ip_rating": "Para exterior"}'::jsonb
),
(
  'Ezviz DB2C Video Timbre WiFi 1080p',
  'ezviz-db2c-video-timbre',
  'Video timbre inteligente con cámara 1080p, detección de movimiento y comunicación bidireccional.',
  52000, 25,
  (SELECT id FROM brands WHERE name = 'Ezviz'),
  (SELECT id FROM categories WHERE slug = 'interior'),
  '{}',
  '{"resolution": "1080p Full HD", "fov": "155° ultra wide", "connectivity": "WiFi 2.4GHz", "audio": "Bidireccional", "ip_rating": "IP65", "storage": "MicroSD / Nube"}'::jsonb
),
(
  'Hikvision DS-2CD2386G2-ISU/SL 8MP AcuSense',
  'hikvision-ds-2cd2386g2-isu-sl-8mp',
  'Cámara domo 8MP 4K AcuSense con sirena y luz estroboscópica integrada para disuasión activa.',
  145000, 7,
  (SELECT id FROM brands WHERE name = 'Hikvision'),
  (SELECT id FROM categories WHERE slug = 'domo'),
  '{}',
  '{"resolution": "8MP 4K (3840x2160)", "night_vision": "30m color / 30m IR", "ip_rating": "IP67/IK10", "connectivity": "PoE", "audio": "Sirena integrada + altavoz", "compression": "H.265+"}'::jsonb
),
(
  'Dahua SD49425XB-HNR PTZ 4MP 25x AI',
  'dahua-sd49425xb-hnr-ptz-4mp-ai',
  'Cámara PTZ 4MP con IA avanzada, zoom óptico 25x, seguimiento automático y reconocimiento facial.',
  520000, 2,
  (SELECT id FROM brands WHERE name = 'Dahua'),
  (SELECT id FROM categories WHERE slug = 'ptz'),
  '{}',
  '{"resolution": "4MP (2688x1520)", "zoom": "25x óptico", "night_vision": "100m IR", "ip_rating": "IP66/IK10", "connectivity": "PoE+", "fov": "Varifocal 5.4-135mm"}'::jsonb
),
(
  'TP-Link Tapo C210 3MP Interior Pan/Tilt',
  'tp-link-tapo-c210-3mp-interior',
  'Cámara interior WiFi 3MP con rotación horizontal 360° y vertical 114°, seguimiento automático.',
  22000, 60,
  (SELECT id FROM brands WHERE name = 'TP-Link Tapo'),
  (SELECT id FROM categories WHERE slug = 'interior'),
  '{}',
  '{"resolution": "3MP (2304x1296)", "night_vision": "9m IR", "connectivity": "WiFi 2.4GHz", "fov": "360° x 114°", "storage": "MicroSD hasta 512GB / Nube", "audio": "Bidireccional"}'::jsonb
),
(
  'Hikvision DS-7616NI-K2/16P NVR 16 Canales PoE',
  'hikvision-ds-7616ni-k2-16p-nvr',
  'NVR 16 canales con 16 puertos PoE, resolución hasta 4K, soporte hasta 8MP por canal.',
  380000, 4,
  (SELECT id FROM brands WHERE name = 'Hikvision'),
  (SELECT id FROM categories WHERE slug = 'nvr-dvr'),
  '{}',
  '{"channels": 16, "resolution": "Hasta 4K/8MP", "compression": "H.265+", "storage": "2x HDD hasta 10TB c/u", "poe": "16 puertos 802.3af/at", "frame_rate": "160Mbps"}'::jsonb
),
(
  'Reolink RLC-823A 4K PoE con Spotlight',
  'reolink-rlc-823a-4k-spotlight',
  'Cámara exterior 4K PoE con focos LED de color y sirena, visión nocturna a color activa.',
  82000, 14,
  (SELECT id FROM brands WHERE name = 'Reolink'),
  (SELECT id FROM categories WHERE slug = 'exterior'),
  '{}',
  '{"resolution": "8MP 4K (3840x2160)", "night_vision": "30m color activo", "ip_rating": "IP67", "connectivity": "PoE", "fov": "95°", "audio": "Sirena + altavoz", "storage": "MicroSD hasta 256GB"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
