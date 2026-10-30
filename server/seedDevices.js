const { randomUUID } = require('crypto');
const { run, get, all } = require('./db');

async function seedDevicesCatalog() {
  console.log('Seeding Comprehensive Device, Brand, Model & Error Code Catalog...');

  const brandsCount = await get('SELECT COUNT(*) as count FROM brands');
  if (brandsCount.count > 0) {
    console.log(`Brands already seeded (${brandsCount.count} brands). Skipping duplicate seed.`);
    return;
  }

  // Define Brands and their Models by Category
  const catalog = [
    // 1. SMARTPHONES
    {
      category: 'smartphones',
      brands: [
        {
          name: 'Samsung',
          slug: 'samsung',
          popularity: 100,
          models: [
            'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
            'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
            'Galaxy S22 Ultra', 'Galaxy S22', 'Galaxy S21 FE',
            'Galaxy Z Fold 5', 'Galaxy Z Flip 5', 'Galaxy Z Fold 4', 'Galaxy Z Flip 4',
            'Galaxy A55 5G', 'Galaxy A54 5G', 'Galaxy A35 5G', 'Galaxy A34 5G',
            'Galaxy A15 5G', 'Galaxy A14 5G', 'Galaxy M34 5G', 'Galaxy M14 5G', 'Galaxy F54 5G'
          ]
        },
        {
          name: 'Apple',
          slug: 'apple',
          popularity: 99,
          models: [
            'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
            'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
            'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
            'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
            'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
            'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
            'iPhone SE (3rd Gen)', 'iPhone SE (2nd Gen)', 'iPhone XR', 'iPhone X'
          ]
        },
        {
          name: 'OnePlus',
          slug: 'oneplus',
          popularity: 90,
          models: [
            'OnePlus 12', 'OnePlus 12R', 'OnePlus 11', 'OnePlus 11R',
            'OnePlus 10 Pro', 'OnePlus 10T', 'OnePlus 10R',
            'OnePlus 9 Pro', 'OnePlus 9', 'OnePlus 9R', 'OnePlus 9RT',
            'OnePlus Open', 'OnePlus Nord 4', 'OnePlus Nord 3', 'OnePlus Nord CE 4',
            'OnePlus Nord CE 3 Lite', 'OnePlus Nord CE 2'
          ]
        },
        {
          name: 'Xiaomi',
          slug: 'xiaomi',
          popularity: 88,
          models: [
            'Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 13 Pro', 'Xiaomi 13T',
            'Xiaomi 12 Pro', 'Xiaomi 11T Pro', 'Xiaomi Pad 6'
          ]
        },
        {
          name: 'Redmi',
          slug: 'redmi',
          popularity: 87,
          models: [
            'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13 5G',
            'Redmi Note 12 Pro+ 5G', 'Redmi Note 12 Pro', 'Redmi Note 12',
            'Redmi 13C 5G', 'Redmi 12 5G', 'Redmi Note 11', 'Redmi Note 10 Pro Max'
          ]
        },
        {
          name: 'POCO',
          slug: 'poco',
          popularity: 82,
          models: [
            'POCO F6 Pro', 'POCO F6', 'POCO X6 Pro 5G', 'POCO X6 5G',
            'POCO X5 Pro 5G', 'POCO F5 5G', 'POCO M6 Pro 5G', 'POCO C65'
          ]
        },
        {
          name: 'Vivo',
          slug: 'vivo',
          popularity: 84,
          models: [
            'Vivo X100 Pro', 'Vivo X100', 'Vivo X90 Pro', 'Vivo V30 Pro',
            'Vivo V30', 'Vivo V29 Pro', 'Vivo T3 5G', 'Vivo T2 Pro 5G', 'Vivo Y200 5G'
          ]
        },
        {
          name: 'OPPO',
          slug: 'oppo',
          popularity: 83,
          models: [
            'OPPO Find N3 Flip', 'OPPO Find X6 Pro', 'OPPO Reno 11 Pro 5G',
            'OPPO Reno 11 5G', 'OPPO Reno 10 Pro+ 5G', 'OPPO F25 Pro 5G', 'OPPO A79 5G'
          ]
        },
        {
          name: 'Realme',
          slug: 'realme',
          popularity: 85,
          models: [
            'Realme GT 6', 'Realme GT 6T', 'Realme 12 Pro+ 5G', 'Realme 12 Pro 5G',
            'Realme 12+ 5G', 'Realme 11 Pro+ 5G', 'Realme Narzo 70 Pro 5G', 'Realme Narzo 60x'
          ]
        },
        {
          name: 'Google Pixel',
          slug: 'google-pixel',
          popularity: 86,
          models: [
            'Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 9 Pro Fold',
            'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
            'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
            'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a'
          ]
        },
        {
          name: 'Motorola',
          slug: 'motorola',
          popularity: 80,
          models: [
            'Edge 50 Ultra', 'Edge 50 Pro', 'Edge 50 Fusion',
            'Razr 50 Ultra', 'Razr 40 Ultra', 'Moto G84 5G', 'Moto G64 5G', 'Moto G54 5G'
          ]
        },
        {
          name: 'Nothing',
          slug: 'nothing',
          popularity: 78,
          models: [
            'Nothing Phone (2)', 'Nothing Phone (2a)', 'Nothing Phone (1)', 'CMF Phone 1'
          ]
        }
      ]
    },

    // 2. LAPTOPS & COMPUTERS
    {
      category: 'laptops-computers',
      brands: [
        {
          name: 'Dell',
          slug: 'dell',
          popularity: 95,
          models: [
            'XPS 15 9530', 'XPS 13 Plus', 'XPS 16', 'XPS 14',
            'Inspiron 15 3520', 'Inspiron 14 5430', 'Inspiron 16 5630',
            'Latitude 5430', 'Latitude 7440', 'Precision 5680',
            'G15 5530 Gaming', 'Alienware m16 R2', 'Alienware x14'
          ]
        },
        {
          name: 'HP',
          slug: 'hp',
          popularity: 94,
          models: [
            'Spectre x360 14', 'Spectre x360 16',
            'Envy x360 15', 'Envy 16',
            'Pavilion 15', 'Pavilion Plus 14', 'HP 15s',
            'Victus 16 Gaming', 'Victus 15 Gaming', 'OMEN Transcend 14', 'OMEN 16',
            'EliteBook 840 G10', 'ProBook 450 G10'
          ]
        },
        {
          name: 'Lenovo',
          slug: 'lenovo',
          popularity: 93,
          models: [
            'ThinkPad X1 Carbon Gen 11', 'ThinkPad T14 Gen 4', 'ThinkPad E14 Gen 5',
            'Yoga 9i Gen 8', 'Yoga Slim 7i', 'Yoga 7i 2-in-1',
            'IdeaPad Slim 5', 'IdeaPad Slim 3', 'IdeaPad Gaming 3',
            'Legion Pro 7i', 'Legion Pro 5i', 'Legion Slim 5', 'LOQ 15IRH8'
          ]
        },
        {
          name: 'Apple',
          slug: 'apple',
          popularity: 96,
          models: [
            'MacBook Air 13-inch (M3)', 'MacBook Air 15-inch (M3)',
            'MacBook Air 13-inch (M2)', 'MacBook Air 13-inch (M1)',
            'MacBook Pro 14-inch (M3 Pro/Max)', 'MacBook Pro 16-inch (M3 Pro/Max)',
            'MacBook Pro 14-inch (M2)', 'MacBook Pro 16-inch (M2)',
            'MacBook Pro 13-inch (M2)', 'Mac mini (M2)', 'iMac 24-inch (M3)', 'Mac Studio'
          ]
        },
        {
          name: 'ASUS',
          slug: 'asus',
          popularity: 91,
          models: [
            'ROG Zephyrus G14', 'ROG Zephyrus G16', 'ROG Strix SCAR 16',
            'TUF Gaming A15', 'TUF Gaming F15',
            'Zenbook 14 OLED', 'Zenbook Duo (2024)', 'Zenbook S 13 OLED',
            'Vivobook 15', 'Vivobook 16X', 'Vivobook Pro 15 OLED'
          ]
        },
        {
          name: 'Acer',
          slug: 'acer',
          popularity: 84,
          models: [
            'Predator Helios 16', 'Predator Helios Neo 16', 'Nitro 5', 'Nitro V 15',
            'Swift Go 14 OLED', 'Swift 3', 'Aspire 5', 'Aspire 7 Gaming', 'Aspire 3'
          ]
        }
      ]
    },

    // 3. TELEVISION
    {
      category: 'television',
      brands: [
        {
          name: 'Samsung',
          slug: 'samsung',
          popularity: 96,
          models: [
            '55" Crystal 4K UHD Smart TV (CU7700)', '65" Crystal 4K Vivid Pro (CUE70)',
            '55" QLED 4K Smart TV (Q60C)', '65" Neo QLED 4K (QN85C)',
            '55" OLED 4K (S90C)', '65" The Frame 4K LS03B', '43" Crystal 4K UHD'
          ]
        },
        {
          name: 'LG',
          slug: 'lg',
          popularity: 95,
          models: [
            '55" OLED evo C3 Series 4K', '65" OLED evo G3 Gallery', '55" OLED B3',
            '55" QNED80 4K Smart TV', '43" 4K UHD Smart TV (UR7500)', '32" HD Ready Smart LED'
          ]
        },
        {
          name: 'Sony',
          slug: 'sony',
          popularity: 94,
          models: [
            'Bravia 55" XR OLED 4K (A80L)', 'Bravia 65" 4K Google TV (X90L)',
            'Bravia 55" 4K Ultra HD (X74L)', 'Bravia 43" 4K LED (X80L)', 'Bravia 65" Mini LED (X95L)'
          ]
        },
        {
          name: 'TCL',
          slug: 'tcl',
          popularity: 82,
          models: [
            '55" QLED 4K Google TV (C645)', '65" Mini LED 4K (C755)', '43" 4K UHD (P635)', '55" Bezel-less Metallic 4K'
          ]
        },
        {
          name: 'Xiaomi',
          slug: 'xiaomi',
          popularity: 85,
          models: [
            'Xiaomi Smart TV X Series 55" 4K', 'Xiaomi Smart TV X Pro 55"', 'Mi TV 4A 43" Horizon Edition', 'Redmi Smart TV 32"'
          ]
        }
      ]
    },

    // 4. REFRIGERATORS
    {
      category: 'refrigerators',
      brands: [
        {
          name: 'LG',
          slug: 'lg',
          popularity: 96,
          models: [
            '260L 3 Star Smart Inverter Frost-Free Double Door (GL-S292RDSX)',
            '343L 3 Star Frost-Free Double Door (GL-T382VESX)',
            '185L 5 Star Direct Cool Single Door (GL-D201ABEU)',
            '655L Side-by-Side Inverter Refrigerator (GL-B257HDSY)',
            '423L Double Door Convertible (GL-T432APZY)'
          ]
        },
        {
          name: 'Samsung',
          slug: 'samsung',
          popularity: 95,
          models: [
            '253L 3 Star Inverter Frost Free Double Door (RT28C3053S8)',
            '301L 3 Star Convertible 5-in-1 (RT34C4513S8)',
            '183L 4 Star Direct-Cool Single Door (RR20C1824CR)',
            '653L Side-by-Side Convertible Refrigerator (RS76CG8003S9)',
            '322L 3 Star Curd Maestro Double Door'
          ]
        },
        {
          name: 'Whirlpool',
          slug: 'whirlpool',
          popularity: 90,
          models: [
            '265L 3 Star IntelliFresh Inverter Frost Free (IF INV CNV 278)',
            '192L 4 Star Direct Cool Single Door (205 WDE PRM 4S)',
            '300L Triple Door Refrigerator (FP 343D PROTTON)'
          ]
        },
        {
          name: 'Haier',
          slug: 'haier',
          popularity: 86,
          models: [
            '328L 3 Star Bottom Mounted Double Door (HEB-333DS-E)',
            '237L 3 Star Frost Free Double Door',
            '531L 4-Door Side-by-Side Inverter Refrigerator'
          ]
        },
        {
          name: 'Godrej',
          slug: 'godrej',
          popularity: 82,
          models: [
            '223L 3 Star Nano Shield Inverter Frost Free (RT EONVALOR 260B)',
            '180L 4 Star Direct Cool (RD EDGENEO 207D)'
          ]
        }
      ]
    },

    // 5. WASHING MACHINES
    {
      category: 'washing-machines',
      brands: [
        {
          name: 'Samsung',
          slug: 'samsung',
          popularity: 95,
          models: [
            '8.0 kg Hygiene Steam Front Load (WW80T554DAX)',
            '7.0 kg AI Control Ecobubble Front Load (WW70T502DAX)',
            '9.0 kg Ecobubble Front Load (WW90TP84DSX)',
            '7.0 kg Wobble Top Load (WA70A4002GS)',
            '8.0 kg Activ DualWash Top Load (WA80BG4546BD)'
          ]
        },
        {
          name: 'LG',
          slug: 'lg',
          popularity: 95,
          models: [
            '8.0 kg 5 Star AI Direct Drive Front Load (FHP1208Z3M)',
            '7.0 kg Inverter Direct Drive Front Load (FHM1207ZDL)',
            '9.0 kg TurboWash 360 Front Load (FHP1409Z4P)',
            '7.0 kg Smart Inverter Top Load (T70SKSF1Z)',
            '8.0 kg TurboDrum Top Load (T80SKSV1Z)'
          ]
        },
        {
          name: 'Bosch',
          slug: 'bosch',
          popularity: 92,
          models: [
            '8.0 kg 5 Star Inverter Front Load Serie 6 (WAJ2846SIN)',
            '7.0 kg Inverter Front Load Serie 4 (WAJ24266IN)',
            '9.0 kg Anti-Stain Front Load Serie 8 (WGA24400IN)',
            '7.5 kg Top Load Serie 2 (WOE751D0IN)'
          ]
        },
        {
          name: 'IFB',
          slug: 'ifb',
          popularity: 89,
          models: [
            '8.0 kg 5 Star Senator WSS Steam Front Load',
            '7.0 kg Elite ZXS Front Load',
            '6.5 kg Senorita WXS Front Load',
            '7.0 kg Aqua Top Load (TL-SDR 7.0KG)'
          ]
        },
        {
          name: 'Whirlpool',
          slug: 'whirlpool',
          popularity: 88,
          models: [
            '7.5 kg 5 Star Stainwash Pro Top Load',
            '7.0 kg Royal Plus Top Load',
            '8.0 kg Fresh Care 8212 Front Load'
          ]
        }
      ]
    },

    // 6. AIR CONDITIONERS
    {
      category: 'air-conditioners',
      brands: [
        {
          name: 'Daikin',
          slug: 'daikin',
          popularity: 96,
          models: [
            '1.5 Ton 5 Star Inverter Split AC (FTKM50U)',
            '1.5 Ton 3 Star Inverter Split AC (FTKL50U)',
            '1.0 Ton 5 Star Inverter Split AC (FTKM35U)',
            '2.0 Ton 3 Star Inverter Split AC (FTKL71U)'
          ]
        },
        {
          name: 'Voltas',
          slug: 'voltas',
          popularity: 94,
          models: [
            '1.5 Ton 3 Star Adjustable Inverter Split AC (183V Vectra Prism)',
            '1.5 Ton 5 Star Inverter Split AC (185V Vectra Elegant)',
            '1.0 Ton 3 Star Adjustable Inverter (123V Vectra Platina)',
            '1.5 Ton 3 Star Window AC (183 LZH)'
          ]
        },
        {
          name: 'LG',
          slug: 'lg',
          popularity: 93,
          models: [
            '1.5 Ton 5 Star AI Dual Inverter Split AC (TS-Q19YNZE)',
            '1.5 Ton 3 Star AI Dual Inverter Split AC (TS-Q18JNXE)',
            '1.0 Ton 5 Star AI Dual Inverter (TS-Q14YNZE)'
          ]
        },
        {
          name: 'Blue Star',
          slug: 'blue-star',
          popularity: 90,
          models: [
            '1.5 Ton 5 Star Inverter Split AC (IC518YNU)',
            '1.5 Ton 3 Star Inverter Split AC (IC318YATU)',
            '1.0 Ton 3 Star Inverter Split AC'
          ]
        },
        {
          name: 'Panasonic',
          slug: 'panasonic',
          popularity: 88,
          models: [
            '1.5 Ton 5 Star Wi-Fi Inverter Smart Split AC (CS/CU-NU18YKY5W)',
            '1.5 Ton 3 Star Wi-Fi Inverter Split AC (CS/CU-SU18YKYWT)'
          ]
        }
      ]
    },

    // 7. FANS
    {
      category: 'fans',
      brands: [
        {
          name: 'Atomberg',
          slug: 'atomberg',
          popularity: 95,
          models: [
            'Renesa 1200mm BLDC Motor Ceiling Fan with Remote',
            'Renesa Smart+ IoT 1200mm',
            'Aris Starlight 1200mm Underlight BLDC Fan',
            'Efficio 1200mm BLDC Energy Saving Fan'
          ]
        },
        {
          name: 'Havells',
          slug: 'havells',
          popularity: 94,
          models: [
            'Stealth Air 1200mm BLDC Ceiling Fan',
            'Glaze 1200mm Decorative Ceiling Fan',
            'Festiva 1200mm Decorative Ceiling Fan',
            'Ventil Air DB 230mm Exhaust Fan'
          ]
        },
        {
          name: 'Crompton',
          slug: 'crompton',
          popularity: 92,
          models: [
            'Energion Hyperjet 1200mm High Speed BLDC Fan',
            'SilentPro Enso 1200mm Noise-Reduction Fan',
            'Hill Briz 1200mm High Speed Ceiling Fan',
            'High Breeze 1200mm 3 Blade Fan'
          ]
        },
        {
          name: 'Orient Electric',
          slug: 'orient',
          popularity: 88,
          models: [
            'Aeroslim 1200mm Smart IoT BLDC Ceiling Fan',
            'Apex-FX 1200mm High Speed Ceiling Fan',
            'Falcon 1200mm Decorative Ceiling Fan'
          ]
        }
      ]
    },

    // 8. KITCHEN APPLIANCES
    {
      category: 'kitchen-appliances',
      brands: [
        {
          name: 'Philips',
          slug: 'philips',
          popularity: 95,
          models: [
            'HL7756/00 750W Mixer Grinder with 3 Jars',
            'HL7707/00 750W Food Processor Mixer Grinder',
            'HD9200/90 4.1L Essential Air Fryer',
            'HD4928/01 2100W Electromagnetic Induction Cooktop'
          ]
        },
        {
          name: 'Prestige',
          slug: 'prestige',
          popularity: 93,
          models: [
            'Iris 750W Mixer Grinder with 3 SS Jars + 1 Juicer Jar',
            'Delight 750W Mixer Grinder',
            'PIC 20.0 1600W Induction Cooktop',
            'POTG 19L Oven Toaster Griller (OTG)'
          ]
        },
        {
          name: 'IFB',
          slug: 'ifb',
          popularity: 90,
          models: [
            '23L Convection Microwave Oven (23BC4)',
            '30L Convection Microwave Oven (30FRC2)',
            '20L Solo Microwave Oven (20PM-MEC2)'
          ]
        },
        {
          name: 'LG',
          slug: 'lg',
          popularity: 92,
          models: [
            '28L Charcoal Convection Microwave Oven (MJ2886BWUM)',
            '32L All-in-One Convection Microwave (MC3286BRUM)',
            '20L Solo Microwave Oven (MS2043DB)'
          ]
        },
        {
          name: 'Preethi',
          slug: 'preethi',
          popularity: 87,
          models: [
            'Zodiac MG 218 750W Mixer Grinder with 5 Jars',
            'Blue Leaf Diamond 750W Mixer Grinder',
            'Steele Supreme 750W Mixer Grinder'
          ]
        }
      ]
    },

    // 9. WI-FI ROUTERS
    {
      category: 'wifi-routers',
      brands: [
        {
          name: 'TP-Link',
          slug: 'tp-link',
          popularity: 96,
          models: [
            'Archer AX73 AX5400 Dual-Band Wi-Fi 6 Router',
            'Archer AX55 AX3000 Gigabit Wi-Fi 6 Router',
            'Archer AX10 AX1500 Wi-Fi 6 Router',
            'Archer C6 AC1200 Wireless MU-MIMO Gigabit Router',
            'Archer C80 AC1900 Dual Band Wi-Fi Router',
            'Deco X20 AX1800 Mesh Wi-Fi System (3-Pack)',
            'TL-WR841N 300Mbps Wireless N Router'
          ]
        },
        {
          name: 'Netgear',
          slug: 'netgear',
          popularity: 90,
          models: [
            'Nighthawk AX12 12-Stream AX6000 Wi-Fi 6 Router',
            'Nighthawk R7000 AC1900 Smart Wi-Fi Router',
            'Orbi RBK752 Wi-Fi 6 Whole Home Mesh System'
          ]
        },
        {
          name: 'D-Link',
          slug: 'd-link',
          popularity: 87,
          models: [
            'DIR-825 AC1200 Gigabit Dual Band Router',
            'DIR-615 Wireless N300 Router',
            'Eagle Pro AI AX1500 Mesh Wi-Fi 6 Router'
          ]
        },
        {
          name: 'ASUS',
          slug: 'asus',
          popularity: 89,
          models: [
            'RT-AX58U Dual Band Wi-Fi 6 Gigabit Router',
            'RT-AX86U Pro Dual Band Gaming Router',
            'ROG Rapture GT-AX6000 Gaming Router'
          ]
        }
      ]
    },

    // 10. OTHER ELECTRONICS
    {
      category: 'other-electronics',
      brands: [
        {
          name: 'Sony',
          slug: 'sony',
          popularity: 95,
          models: [
            'WH-1000XM5 Wireless Noise Cancelling Headphones',
            'WH-1000XM4 Wireless Headphones',
            'HT-S20R 5.1ch Home Cinema Soundbar',
            'PlayStation 5 (PS5 Standard / Slim)',
            'PlayStation 4 Pro'
          ]
        },
        {
          name: 'Luminous',
          slug: 'luminous',
          popularity: 92,
          models: [
            'Zelio+ 1100 Pure Sine Wave Inverter 900VA / 12V',
            'Eco Volt Neo 1050 Sine Wave Inverter',
            'Solar NXG 1400 Hybrid Solar Inverter'
          ]
        },
        {
          name: 'Microtek',
          slug: 'microtek',
          popularity: 90,
          models: [
            'Luxe 1400 Pure Sinewave Inverter',
            'Super Power 1100 Advanced Digital UPS',
            'Heavy Duty 1550 Sine Wave Inverter'
          ]
        },
        {
          name: 'APC',
          slug: 'apc',
          popularity: 91,
          models: [
            'Back-UPS BX600C-IN 600VA / 360W UPS',
            'Back-UPS Pro BR1500G-IN 1500VA'
          ]
        }
      ]
    }
  ];

  // Insert Brands & Models
  let totalBrands = 0;
  let totalModels = 0;

  for (const catEntry of catalog) {
    for (const b of catEntry.brands) {
      const brandId = randomUUID();
      await run(
        `INSERT INTO brands (id, name, slug, category_slug, popularity_score)
         VALUES (?, ?, ?, ?, ?)`,
        [brandId, b.name, b.slug, catEntry.category, b.popularity]
      );
      totalBrands++;

      for (const m of b.models) {
        const modelId = randomUUID();
        await run(
          `INSERT INTO device_models (id, brand_id, brand_slug, model_name, category_slug, is_verified)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [modelId, brandId, b.slug, m, catEntry.category]
        );
        totalModels++;
      }
    }
  }

  console.log(`Seeded ${totalBrands} verified brands and ${totalModels} verified models across 10 categories.`);

  // 2. Seed Symptom Catalog
  const symptomsData = [
    // Smartphones
    { cat: 'smartphones', text: 'Battery draining quickly and phone feels warm while idle', kw: 'battery, drain, hot, discharge, warm, dying' },
    { cat: 'smartphones', text: 'Phone not charging or charging only at an angle', kw: 'charging, cable, port, loose, slow charge, plug' },
    { cat: 'smartphones', text: 'Phone heating up significantly while fast charging', kw: 'heating, hot, fast charge, temperature, warm' },
    { cat: 'smartphones', text: 'Battery percentage jumping erratically or shutting down at 20%', kw: 'battery jump, shutdown, percentage drop, calibration' },
    { cat: 'smartphones', text: 'Touch screen unresponsive in certain areas or ghost touch', kw: 'touch, unresponsive, ghost touch, tapping, screen' },
    { cat: 'smartphones', text: 'Display showing green/pink vertical lines on screen', kw: 'green line, display lines, pink line, amoled, screen' },
    { cat: 'smartphones', text: 'Black screen but phone vibrates and makes notification sounds', kw: 'black screen, no display, blank screen, sound works' },
    { cat: 'smartphones', text: 'Microphone not working during phone calls or WhatsApp audio', kw: 'mic, microphone, caller cannot hear, audio' },
    { cat: 'smartphones', text: 'Earpiece speaker sound very muffled or low volume', kw: 'earpiece, low volume, speaker muffled, quiet call' },
    { cat: 'smartphones', text: 'Phone dropped in water or liquid spilled on speaker grill', kw: 'water, liquid, dropped in water, wet, moisture' },
    { cat: 'smartphones', text: 'SIM card not detected or No Service error', kw: 'sim card, no service, emergency calls only, network' },

    // Laptops
    { cat: 'laptops-computers', text: 'Laptop overheating, loud fan noise, and thermal throttling', kw: 'overheat, thermal, fan noise, loud, hot, throttling' },
    { cat: 'laptops-computers', text: 'Laptop won\'t turn on and no charging LED light appears', kw: 'no power, dead laptop, wont turn on, black screen' },
    { cat: 'laptops-computers', text: 'Computer running extremely slow with 100% disk usage in Task Manager', kw: 'slow computer, 100% disk, freezing, lagging, sluggish' },
    { cat: 'laptops-computers', text: 'Blue Screen of Death (BSOD) crashing randomly with stop code', kw: 'bsod, blue screen, crashing, dump, stop code' },
    { cat: 'laptops-computers', text: 'Keyboard keys not typing or typing multiple repeating characters', kw: 'keyboard, key stuck, typing twice, missing keys' },
    { cat: 'laptops-computers', text: 'Battery plugged in but saying "Not Charging"', kw: 'not charging, plugged in, battery threshold, adapter' },
    { cat: 'laptops-computers', text: 'Wi-Fi adapter disappeared from Windows settings', kw: 'wifi missing, no wifi, adapter driver, network' },
    { cat: 'laptops-computers', text: 'Screen flickering or distorted display when moving laptop lid', kw: 'flicker, screen lines, lid hinge, display cable' },

    // Washing Machines
    { cat: 'washing-machines', text: 'Washing machine not draining water and drum full of water (E20 / 5E)', kw: 'drain, water stuck, not draining, pump, e20, 5e, oe' },
    { cat: 'washing-machines', text: 'Violent shaking, walking, and banging noise during spin cycle', kw: 'vibration, shaking, banging, walking, noise, spin' },
    { cat: 'washing-machines', text: 'Door locked shut and will not open after cycle completion', kw: 'door locked, door jammed, handle stuck, won\'t open' },
    { cat: 'washing-machines', text: 'Water leaking onto the floor from bottom front of the machine', kw: 'leak, water on floor, leaking, gasket, hose' },
    { cat: 'washing-machines', text: 'Drum not spinning but motor is making a humming sound', kw: 'not spinning, belt broken, motor hum, drum stuck' },
    { cat: 'washing-machines', text: 'Not taking in water or water flow extremely slow (4C / 4E)', kw: 'inlet, no water, 4c, 4e, water filling slow' },

    // Refrigerators
    { cat: 'refrigerators', text: 'Freezer is freezing cold but lower refrigerator compartment is warm', kw: 'freezer cold fridge warm, not cooling, warm compartment, defrost' },
    { cat: 'refrigerators', text: 'Water leaking and pooling inside bottom vegetable crisper drawer', kw: 'water pool, crisper leaking, drain hole blocked, defrost drain' },
    { cat: 'refrigerators', text: 'Compressor clicking every few minutes but fails to start running', kw: 'compressor click, relay, not starting, humming, clicking' },
    { cat: 'refrigerators', text: 'Excessive white ice and frost accumulation coating back wall', kw: 'frost, ice buildup, snow in freezer, frost free fail' },
    { cat: 'refrigerators', text: 'Loud rattling or buzzing vibration coming from back coils', kw: 'noise, rattling, buzzing, fan, back coils' },

    // Air Conditioners
    { cat: 'air-conditioners', text: 'AC indoor blower running but blowing room-temperature air (no cooling)', kw: 'ac not cooling, warm air, compressor not starting, fan only' },
    { cat: 'air-conditioners', text: 'Water leaking and dripping from indoor unit onto the wall/floor', kw: 'water leak, dripping indoor, drain pipe choked, overflow' },
    { cat: 'air-conditioners', text: 'Thin copper pipe at outdoor unit covered with white frost/ice', kw: 'ice on pipe, refrigerant low, gas leak, frozen coil' },
    { cat: 'air-conditioners', text: 'Error code blinking on indoor panel and AC shuts off after 5 minutes', kw: 'error code, blinking light, shuts off, timer light' },
    { cat: 'air-conditioners', text: 'Musty, damp, or sour mold smell when AC is turned on', kw: 'smell, odor, musty, mold, foul smell' },

    // TV
    { cat: 'television', text: 'Sound is working normally but screen is completely dark (Backlight failure)', kw: 'sound no picture, black screen, backlight, flashlight test' },
    { cat: 'television', text: 'Vertical or horizontal colored lines running across display screen', kw: 'lines on screen, vertical lines, display defect, panel' },
    { cat: 'television', text: 'TV turns off or reboots itself repeatedly after showing logo', kw: 'boot loop, restarts, turns off, logo loop, power supply' },
    { cat: 'television', text: 'Half of the TV screen is noticeably dimmer or flickering', kw: 'half screen dim, backlight strip, dark side, flicker' },
    { cat: 'television', text: 'Remote control not responding despite fresh batteries', kw: 'remote not working, ir sensor, receiver, unresponsive' },

    // Fans
    { cat: 'fans', text: 'Ceiling fan running very slow even on highest speed (Speed 5)', kw: 'slow speed, fan capacitor, weak air, sluggish' },
    { cat: 'fans', text: 'Ceiling fan humming loudly and requires a manual push to start rotating', kw: 'humming, needs push, starting capacitor, stuck' },
    { cat: 'fans', text: 'Fan wobbling dangerously back and forth on the ceiling downrod', kw: 'wobble, unbalance, blade bent, shaking fan' },

    // Kitchen Appliances
    { cat: 'kitchen-appliances', text: 'Mixer grinder suddenly turned off and red overload button popped out', kw: 'mixer tripped, overload switch, reset button, dead mixer' },
    { cat: 'kitchen-appliances', text: 'Microwave oven turns on and turntable rotates but food is cold', kw: 'microwave not heating, food cold, magnetron, high voltage' },
    { cat: 'kitchen-appliances', text: 'Induction cooktop displays E0 error code and beeps continuously', kw: 'induction e0, no pot, cookware error, beeping' },
    { cat: 'kitchen-appliances', text: 'Mixer jar blade jammed stiff and cannot be turned by hand', kw: 'blade jammed, jar stuck, coupler, paste stuck' },

    // Wi-Fi Routers
    { cat: 'wifi-routers', text: 'Wi-Fi connected with exclamation mark / "Connected without internet"', kw: 'no internet, connected without internet, dns, gateway' },
    { cat: 'wifi-routers', text: 'LOS or Optical light is flashing RED on optical router/ONU', kw: 'red los, optical cut, fiber cut, red light, no signal' },
    { cat: 'wifi-routers', text: 'Wi-Fi signal frequently drops or disconnects every 30 minutes', kw: 'frequent drop, disconnecting, unstable wifi, reboot' },
    { cat: 'wifi-routers', text: 'Cannot open router admin configuration page (192.168.1.1)', kw: 'admin page, 192.168.1.1, gateway, cannot access' }
  ];

  for (const s of symptomsData) {
    await run(
      `INSERT INTO symptom_catalog (id, category_slug, symptom_text, related_keywords, frequency_score)
       VALUES (?, ?, ?, ?, 10)`,
      [randomUUID(), s.cat, s.text, s.kw]
    );
  }
  console.log(`Seeded ${symptomsData.length} verified symptom suggestions.`);

  // 3. Seed Error Codes Catalog
  const errorCodesData = [
    // Washing Machines
    { cat: 'washing-machines', brand: 'samsung', code: '4C', title: 'Water Supply Error', meaning: 'The machine is not detecting incoming water. Water valve may be closed, filter mesh blocked, or hose kinked.', typical: 'Check tap is fully open and clean inlet filter mesh screen.', sev: 'Medium' },
    { cat: 'washing-machines', brand: 'samsung', code: '4E', title: 'Water Supply Inlet Fault', meaning: 'Older Samsung code for 4C. No water filling detected within the programmed timeout period.', typical: 'Inspect water pressure, inlet hose, and solenoid valve.', sev: 'Medium' },
    { cat: 'washing-machines', brand: 'samsung', code: '5C', title: 'Drain Error', meaning: 'Water is unable to drain out of the drum within 10 minutes.', typical: 'Clean the front lower debris/coin filter pump chamber.', sev: 'High' },
    { cat: 'washing-machines', brand: 'samsung', code: '5E', title: 'Drainage Filter Blocked', meaning: 'Debris, hairpins, or coins are obstructing the drain pump impeller.', typical: 'Unscrew bottom-right coin trap filter and clean debris.', sev: 'High' },
    { cat: 'washing-machines', brand: 'samsung', code: 'UB', title: 'Unbalanced Load', meaning: 'The laundry load inside the drum is distributed unevenly, preventing high-speed spin cycle.', typical: 'Pause, redistribute tangled laundry or add a towel to balance weight.', sev: 'Low' },
    { cat: 'washing-machines', brand: 'samsung', code: 'dC', title: 'Door Open / Latch Error', meaning: 'The washing machine door is not closed securely or the door latch switch is failing.', typical: 'Ensure door clicks firmly shut. Check if laundry is pinched in gasket.', sev: 'Low' },

    { cat: 'washing-machines', brand: 'lg', code: 'OE', title: 'Drain Failure', meaning: 'The washer was unable to drain water. Pump filter is obstructed or drain hose is kinked.', typical: 'Unscrew debris filter at bottom front and clear hair/coins.', sev: 'High' },
    { cat: 'washing-machines', brand: 'lg', code: 'IE', title: 'Water Inlet Error', meaning: 'Water level did not rise sufficiently after water valves opened.', typical: 'Check water supply tap and clean inlet valve strainer screen.', sev: 'Medium' },
    { cat: 'washing-machines', brand: 'lg', code: 'UE', title: 'Unbalanced Load Error', meaning: 'The drum detected an off-center weight during pre-spin balancing routine.', typical: 'Open door, separate heavy items like blankets from small garments.', sev: 'Low' },
    { cat: 'washing-machines', brand: 'lg', code: 'dE', title: 'Door Lock Error', meaning: 'Door safety lock mechanism cannot engage or door switch contact is oxidized.', typical: 'Check door latch alignment and strike.', sev: 'Medium' },
    { cat: 'washing-machines', brand: 'lg', code: 'LE', title: 'Motor Lock / Overload', meaning: 'Drive motor cannot rotate freely due to heavy laundry overload or foreign object jammed in tub.', typical: 'Reduce laundry load weight and let motor cool for 30 minutes.', sev: 'High' },

    { cat: 'washing-machines', brand: 'bosch', code: 'E18', title: 'Drain Filter / Pump Blocked', meaning: 'Washing machine failed to drain within allowed timeframe.', typical: 'Clean bottom drain filter and test impeller spins freely.', sev: 'High' },
    { cat: 'washing-machines', brand: 'bosch', code: 'E17', title: 'Water Supply Inflow Timeout', meaning: 'Water intake is too slow or tap is closed.', typical: 'Check water pressure and inlet hose filter.', sev: 'Medium' },
    { cat: 'washing-machines', brand: 'bosch', code: 'E23', title: 'AquaStop Leak Detection', meaning: 'Water detected in the base tray beneath the machine.', typical: 'Unplug machine, inspect for hose or tub leaks.', sev: 'Critical' },

    // Air Conditioners
    { cat: 'air-conditioners', brand: 'daikin', code: 'U4', title: 'Transmission Fault', meaning: 'Communication failure between indoor unit and outdoor condenser board.', typical: 'Check signal wiring connections between indoor and outdoor terminals.', sev: 'High' },
    { cat: 'air-conditioners', brand: 'daikin', code: 'A5', title: 'Indoor Heat Exchanger Freeze / Overheat', meaning: 'Indoor coil temperature abnormal. Choked filters or low refrigerant.', typical: 'Wash air filter mesh and check fan blower motor.', sev: 'Medium' },
    { cat: 'air-conditioners', brand: 'voltas', code: 'E1', title: 'Indoor Room Temperature Sensor Fault', meaning: 'The ambient thermistor sensor circuit is disconnected or short-circuited.', typical: 'Inspect indoor PCB thermistor probe resistance.', sev: 'Medium' },
    { cat: 'air-conditioners', brand: 'voltas', code: 'E2', title: 'Indoor Coil Sensor Error', meaning: 'Evaporator copper coil temperature sensor is malfunctioning.', typical: 'Check sensor clipping on copper bend and harness connection.', sev: 'Medium' },
    { cat: 'air-conditioners', brand: 'voltas', code: 'E5', title: 'Compressor High Pressure / Gas Leak', meaning: 'Compressor thermal overload tripped due to gas loss or blocked condenser fins.', typical: 'Inspect refrigerant pressure and wash outdoor condenser coil.', sev: 'High' },
    { cat: 'air-conditioners', brand: 'lg', code: 'CH05', title: 'Communication Error', meaning: 'Loss of communication signal between indoor and outdoor unit controller boards.', typical: 'Check communication wire terminal screws and polarity.', sev: 'High' },
    { cat: 'air-conditioners', brand: 'lg', code: 'CH21', title: 'Inverter Compressor Overcurrent', meaning: 'Inverter IPM or compressor drawing excessive electrical current.', typical: 'Check compressor winding resistance and inverter PCB.', sev: 'Critical' },

    // Kitchen Appliances
    { cat: 'kitchen-appliances', brand: 'prestige', code: 'E0', title: 'No Pot / Incompatible Cookware', meaning: 'No magnetic/ferromagnetic induction-compatible pan detected on plate.', typical: 'Use cast iron or induction-base stainless steel pot with flat bottom.', sev: 'Low' },
    { cat: 'kitchen-appliances', brand: 'philips', code: 'E1', title: 'Voltage Too Low (< 160V)', meaning: 'Mains AC electricity supply voltage dropped below safe operating limit.', typical: 'Check mains voltage with stabilizer or wait for grid normalization.', sev: 'Medium' },
    { cat: 'kitchen-appliances', brand: 'philips', code: 'E2', title: 'Voltage Too High (> 270V)', meaning: 'Mains electricity surge or high voltage detected. Device shut off to protect electronics.', typical: 'Unplug unit to prevent power supply circuit damage.', sev: 'High' },
    { cat: 'kitchen-appliances', brand: 'philips', code: 'E6', title: 'Internal IGBT Overheating', meaning: 'Internal power semiconductor heatsink reached thermal safety cutoff.', typical: 'Ensure bottom cooling fan vent is not blocked by cloth or counter debris.', sev: 'Medium' }
  ];

  for (const err of errorCodesData) {
    await run(
      `INSERT INTO error_codes (id, category_slug, brand_slug, code, title, meaning, typical_cause, severity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), err.cat, err.brand, err.code, err.title, err.meaning, err.typical, err.sev]
    );
  }
  console.log(`Seeded ${errorCodesData.length} verified official error codes.`);
}

module.exports = { seedDevicesCatalog };
