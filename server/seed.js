const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const uuidv4 = randomUUID;
const { run, get, all, initSchema } = require('./db');

const { seedDevicesCatalog } = require('./seedDevices');

async function seed() {
  await initSchema();

  console.log('Checking existing seed data...');

  // 1. Seed Users
  const adminExists = await get('SELECT id FROM users WHERE email = ?', ['admin@repairsathi.ai']);
  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const adminPassHash = await bcrypt.hash('admin123', salt);
    const userPassHash = await bcrypt.hash('user123', salt);

    await run(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), 'System Admin', 'admin@repairsathi.ai', adminPassHash, 'admin']
    );

    await run(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), 'Demo User', 'user@repairsathi.ai', userPassHash, 'user']
    );
    console.log('Seeded initial users: admin@repairsathi.ai and user@repairsathi.ai');
  }

  // 2. Seed Categories
  const categoriesCount = await get('SELECT COUNT(*) as count FROM categories');
  if (categoriesCount.count === 0) {
    const categories = [
      { name: 'Smartphones', slug: 'smartphones', icon: 'Smartphone', description: 'Android, iPhones, charging ports, screen & battery issues' },
      { name: 'Laptops and Computers', slug: 'laptops-computers', icon: 'Laptop', description: 'MacBooks, Windows laptops, thermal throttling, boot issues' },
      { name: 'Television', slug: 'television', icon: 'Tv', description: 'Smart LED, OLED, audio without video, backlight faults' },
      { name: 'Refrigerators', slug: 'refrigerators', icon: 'Refrigerator', description: 'Single & double door, frost issues, cooling failure' },
      { name: 'Washing Machines', slug: 'washing-machines', icon: 'WashingMachine', description: 'Front-load, top-load, drainage, spin & motor vibration' },
      { name: 'Air Conditioners', slug: 'air-conditioners', icon: 'Wind', description: 'Split & window AC, coil icing, water leakage, cooling gas' },
      { name: 'Fans', slug: 'fans', icon: 'Fan', description: 'Ceiling fans, exhaust fans, capacitor replacement, bearing friction' },
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: 'Microwave', description: 'Microwave ovens, mixer grinders, induction cooktops' },
      { name: 'Wi-Fi Routers', slug: 'wifi-routers', icon: 'Wifi', description: 'Routers, optical modems, DNS issues, signal drops' },
      { name: 'Other Electronics', slug: 'other-electronics', icon: 'Cpu', description: 'Inverters, power banks, audio gear, smart gadgets' }
    ];

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      await run(
        'INSERT INTO categories (id, name, slug, icon, description, display_order) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), cat.name, cat.slug, cat.icon, cat.description, i + 1]
      );
    }
    console.log(`Seeded ${categories.length} categories.`);
  }

  // 3. Seed Knowledge Base Articles
  const kbCount = await get('SELECT COUNT(*) as count FROM knowledge_base');
  if (kbCount.count === 0) {
    const articles = [
      // Smartphones
      {
        category_slug: 'smartphones',
        device_name: 'Generic Smartphone',
        problem_title: 'Phone not charging or charging intermittently',
        keywords: 'charge, charging, cable, port, slow charge, not charging, battery',
        symptoms: 'Plugged in but battery icon does not appear, charging only when cable held at an angle, very slow trickle charge.',
        possible_causes: 'Lint or dust accumulated in charging port, damaged USB charging cable, faulty wall adapter, corroded charging pins, failing battery.',
        troubleshooting_steps: JSON.stringify([
          'Inspect the charging port using a bright flashlight for lint, pocket dust, or debris.',
          'Gently clean out compacted lint using a dry wooden or plastic toothpick. NEVER use a metallic needle or pin as it shorts pins.',
          'Test with a known-good original cable and high-wattage charging adapter directly into a wall socket (not through an extension cord).',
          'Inspect the cable tip for bends, corrosion, or black marks on contact pins.',
          'Perform a force restart on the phone while connected to power to reset battery management firmware.'
        ]),
        tools_required: JSON.stringify(['Wooden toothpick or anti-static brush', 'Bright flashlight', 'Spare certified USB-C or Lightning cable', 'Original wall charger']),
        difficulty: 'Easy',
        estimated_cost_range: '₹0 (cleaning) to ₹400 - ₹1,200 (port replacement)',
        safety_warning: 'Do not spray liquid cleaner or isopropyl alcohol directly into the charging port while the device is powered on. Do not insert metal needles.',
        professional_recommended: 0
      },
      {
        category_slug: 'smartphones',
        device_name: 'Smartphone',
        problem_title: 'Rapid battery drain and overheating while idle',
        keywords: 'battery drain, overheating, hot phone, discharging, dying fast',
        symptoms: 'Phone feels unusually warm in pocket or desk, battery drops 20% in an hour without usage.',
        possible_causes: 'Background rogue app consuming CPU, active GPS tracking in multiple background apps, poor cellular reception forcing modem to maximum transmit power, degraded battery cell capacity.',
        troubleshooting_steps: JSON.stringify([
          'Navigate to Settings > Battery > Battery Usage and check the top consuming apps.',
          'Uninstall or restrict background activity for apps showing abnormal consumption.',
          'Restart phone in Safe Mode to isolate third-party apps from core OS services.',
          'Turn off 5G Standalone or switch to LTE/Wi-Fi if living in an area with 1-bar cellular signal.',
          'Check battery health percentage: if below 75% or showing Service alert, the chemical capacity has degraded.'
        ]),
        tools_required: JSON.stringify(['No physical tools required (Software diagnostics)']),
        difficulty: 'Easy',
        estimated_cost_range: '₹0 (software fix) or ₹1,200 - ₹3,500 (battery replacement)',
        safety_warning: 'If you notice the back cover lifting or a bulging sensation, STOP using the phone immediately. Swollen lithium batteries represent a severe fire hazard.',
        professional_recommended: 0
      },

      // Laptops & Computers
      {
        category_slug: 'laptops-computers',
        device_name: 'Laptop',
        problem_title: 'Laptop overheating, thermal throttling, and loud fan noise',
        keywords: 'overheat, thermal, throttling, fan noise, hot laptop, shuts down',
        symptoms: 'Fan spins at maximum speed constantly, keyboard and bottom chassis are burning hot, games or apps stutter and drop frames, unexpected shutdown during load.',
        possible_causes: 'Dust blanket blocking heatsink cooling fins, dried out thermal paste between CPU/GPU and heatsink pipe, fan bearing wearing out, laptop placed on soft surfaces (bed/couch).',
        troubleshooting_steps: JSON.stringify([
          'Ensure laptop is placed on a flat, rigid surface or elevated stand so bottom air intake vents are unobstructed.',
          'Use compressed air can in short bursts into exhaust vents to dislodge accumulated dust bunnies.',
          'Check Task Manager / Activity Monitor for background processes with unusually high CPU utilization (cryptominers, stuck updates).',
          'If laptop is older than 2-3 years, opening the bottom chassis to blow clean the blower fan blades and heatsink radiators provides massive cooling relief.',
          'For advanced users: remove heatsink, clean old chalky thermal compound with 99% isopropyl alcohol, and apply fresh thermal paste (MX-4, Kryonaut).'
        ]),
        tools_required: JSON.stringify(['Can of compressed air', 'Precision screwdriver kit (Phillips #00 / Torx)', 'Thermal paste', '99% Isopropyl alcohol & lint-free wipe']),
        difficulty: 'Moderate',
        estimated_cost_range: '₹0 (cleaning vents) to ₹500 - ₹1,500 (technician deep clean + repaste)',
        safety_warning: 'ALWAYS disconnect the charger and unhook the internal battery connector before touching internal heatsinks or fans.',
        professional_recommended: 0
      },
      {
        category_slug: 'laptops-computers',
        device_name: 'Windows PC / Laptop',
        problem_title: 'Computer running extremely slow with 100% disk usage',
        keywords: 'slow computer, 100% disk, freezing, lagging, slow boot, sluggish',
        symptoms: 'Takes 5-10 minutes to boot, apps take 30 seconds to open, Task Manager shows 100% Disk continuously even with no apps open.',
        possible_causes: 'Mechanical HDD aging or bad sectors, Windows Search indexing stuck, Superfetch/SysMain service conflict, corrupted system files.',
        troubleshooting_steps: JSON.stringify([
          'Open Task Manager (Ctrl+Shift+Esc), click Performance tab and check whether disk is an HDD or SSD.',
          'If running Windows on a mechanical spinning hard drive (HDD), upgrading to a SATA/NVMe SSD will provide a 10x speed improvement instantly.',
          'Run System File Checker: open PowerShell as Administrator and run `sfc /scannow`.',
          'Disable SysMain temporarily to test: run `net stop "SysMain"` and monitor disk activity drop.',
          'Run `chkdsk C: /f /r` to test and repair filesystem integrity on next reboot.'
        ]),
        tools_required: JSON.stringify(['Admin access in Windows', 'Replacement SSD & screwdriver if upgrading']),
        difficulty: 'Easy',
        estimated_cost_range: '₹0 (software fix) or ₹1,800 - ₹3,500 (500GB SSD upgrade)',
        safety_warning: 'Backup your critical personal files immediately before running disk repair commands if the drive is clicking or failing.',
        professional_recommended: 0
      },

      // Television
      {
        category_slug: 'television',
        device_name: 'Smart LED TV',
        problem_title: 'TV has sound but no picture (Black screen / Flashlight test)',
        keywords: 'black screen, sound no picture, no display, audio works, backlight',
        symptoms: 'TV turns on, power LED lights up, you can hear TV channels or menu clicks, but screen remains completely dark.',
        possible_causes: 'Burnt-out LED backlight strips, faulty LED driver board circuit, disconnected LVDS cable, failed T-Con board.',
        troubleshooting_steps: JSON.stringify([
          'The Flashlight Test: In a dark room, shine a bright smartphone flashlight directly at the TV screen from 2 inches away while a video or menu is playing.',
          'If you can faintly see shadows of images, menus, or video under the flashlight beam, the LCD panel is fine and the LED backlight strips have burnt out.',
          'Power cycle the TV: unplug power cord from the wall for 10 minutes, hold TV power button for 30 seconds to drain capacitors, plug back in.',
          'Test different HDMI ports and sources to rule out cable/box failure.'
        ]),
        tools_required: JSON.stringify(['Smartphone flashlight', 'Multimeter (for technician testing)']),
        difficulty: 'Difficult',
        estimated_cost_range: '₹1,500 - ₹4,500 (LED backlight strip replacement)',
        safety_warning: 'High voltage caution: Modern LED TV power boards store 100V-300V in capacitors. Replacing LED backlight strips requires suction cups to lift ultra-thin, fragile glass LCD panels without cracking them. Certified technician is strongly recommended.',
        professional_recommended: 1
      },

      // Refrigerators
      {
        category_slug: 'refrigerators',
        device_name: 'Frost-Free Refrigerator',
        problem_title: 'Freezer is freezing cold but refrigerator bottom compartment is warm',
        keywords: 'freezer cold fridge warm, not cooling, warm fridge, frost buildup, airflow',
        symptoms: 'Ice cream in top freezer is rock solid, but milk and vegetables in the lower compartment are spoiling and warm.',
        possible_causes: 'Defrost heater failure causing ice to choke air damper duct, failed defrost timer / bimetal thermostat, evaporator fan motor stopped, blocked air return vents.',
        troubleshooting_steps: JSON.stringify([
          'Check if food containers in the freezer are blocking the back air vents that channel cold air downwards.',
          'Listen for the evaporator fan in the freezer: open the freezer door, press the door switch button manually; the fan should spin and blow cold air.',
          'Check the back panel of the freezer: if it is frosted over with thick white snow/ice, the automatic defrost system has failed.',
          'Manual Defrost Test: Unplug the refrigerator, empty all food, keep doors wide open for 24 hours with towels on floor to completely melt internal ice duct blockages.',
          'Plug back in after 24h: if both compartments cool normally for 3-5 days before bottom goes warm again, the defrost sensor/heater is definitely faulty.'
        ]),
        tools_required: JSON.stringify(['Towels / bowls for defrost water', 'Hair dryer (optional gentle melt)', 'Multimeter for continuity testing']),
        difficulty: 'Moderate',
        estimated_cost_range: '₹0 (manual defrost blockage clear) to ₹800 - ₹2,000 (defrost timer/bimetal replacement)',
        safety_warning: 'Unplug the refrigerator before removing internal plastic panels. Never use sharp knives or ice picks to chip away ice as this can puncture the aluminum refrigerant lines.',
        professional_recommended: 0
      },

      // Washing Machines
      {
        category_slug: 'washing-machines',
        device_name: 'Front / Top Load Washing Machine',
        problem_title: 'Washing machine not draining water (Error E20 / OE / 5E / SUD)',
        keywords: 'not draining, water standing, drain error, e20, 5e, oe, pump clogged',
        symptoms: 'Cycle stops midway full of soapy water, buzzing sound from bottom right, display flashes drain error code.',
        possible_causes: 'Coins, hairpins, safety pins, or lint jamming the debris filter; kinked or clogged drain hose; failed drain pump motor.',
        troubleshooting_steps: JSON.stringify([
          'Locate the small access door at the bottom-right front of the washing machine.',
          'Place a shallow baking tray and old towels underneath the door.',
          'Pull out the miniature black drain hose with stopper to empty standing water into a bowl first.',
          'Slowly unscrew the round coin/debris filter counter-clockwise.',
          'Extract all coins, buttons, hair clips, and lint trapped in the impeller chamber.',
          'Check if the little plastic impeller wheel inside spins freely with your finger.',
          'Screw filter back tightly, close access flap, and run a Quick Spin/Drain cycle.'
        ]),
        tools_required: JSON.stringify(['Old towels', 'Shallow tray/bowl', 'Pliers (if filter is stiff)']),
        difficulty: 'Easy',
        estimated_cost_range: '₹0 (cleaning debris filter) to ₹600 - ₹1,800 (drain pump replacement)',
        safety_warning: 'Unplug machine from mains before unscrewing filter. Water might be scalding hot if a hot wash cycle was running; allow it to cool down first.',
        professional_recommended: 0
      },
      {
        category_slug: 'washing-machines',
        device_name: 'Washing Machine',
        problem_title: 'Violent shaking, walking, and banging noise during spin cycle',
        keywords: 'vibrating, walking machine, banging noise, spin vibration, unlevel',
        symptoms: 'Machine jumps or "walks" across the floor during 1000+ RPM spin cycle, makes loud knocking sounds like a hammer against sheet metal.',
        possible_causes: 'Uneven washing machine leveling feet, transit shipping bolts not removed from rear, unbalanced load (single heavy blanket), worn out suspension shock absorbers.',
        troubleshooting_steps: JSON.stringify([
          'Check if transit bolts were removed: If machine is new, inspect rear panel for 3-4 large shipping bolts designed to hold drum in transit. Operating with them installed damages the machine!',
          'Place hands on diagonal corners and push down: if machine rocks back and forth, adjust the threaded rubber feet with a wrench until 100% level.',
          'Ensure load is balanced: washing a single heavy bedsheet with small socks creates an off-center centrifugal mass. Add a towel to distribute weight.',
          'Push drum down firmly with hand and release: if it bounces multiple times like a pogo stick instead of returning smoothly, suspension shock dampers are shot.'
        ]),
        tools_required: JSON.stringify(['Spirit level or smartphone level app', 'Adjustable wrench for foot nut']),
        difficulty: 'Easy',
        estimated_cost_range: '₹0 (leveling / transit bolt removal) to ₹800 - ₹2,200 (suspension struts)',
        safety_warning: 'Do not sit or stand on a violently shaking washing machine to hold it down.',
        professional_recommended: 0
      },

      // Air Conditioners
      {
        category_slug: 'air-conditioners',
        device_name: 'Split Air Conditioner',
        problem_title: 'AC running but blowing warm room-temperature air',
        keywords: 'ac not cooling, warm air, blowing normal air, compressor not starting',
        symptoms: 'Indoor unit blower operates normally, but air coming out is not chilled. Room temperature does not drop after 30 minutes.',
        possible_causes: 'Outdoor unit compressor start capacitor blown, dirty air filters choked with dust, low refrigerant (gas leak), thermostat set to Fan mode, outdoor condenser coil clogged with dirt.',
        troubleshooting_steps: JSON.stringify([
          'Check remote control mode: ensure mode is explicitly set to Cool (Snowflake symbol ❄️) and temperature is at least 4°C lower than room temperature (e.g. 24°C).',
          'Open indoor front panel, remove mesh air filters, wash under running water, dry and reinsert.',
          'Verify if the outdoor unit is actually running: listen for the compressor hum and check if outdoor fan is spinning.',
          'If outdoor fan spins but compressor gives a clicking sound and fails to start every few minutes, the dual run capacitor has failed.',
          'Inspect the thin copper pipe at the outdoor unit: if covered in white thick ice, refrigerant gas is low due to a pinhole leak.'
        ]),
        tools_required: JSON.stringify(['Running water for filter cleaning', 'Multimeter / capacitor tester (technician)']),
        difficulty: 'Moderate',
        estimated_cost_range: '₹0 (filter cleaning) to ₹600 - ₹1,200 (capacitor) or ₹2,000 - ₹3,500 (leak repair + gas recharge)',
        safety_warning: 'Never attempt to discharge or recharge refrigerant gas without EPA/authorized equipment. Escaping gas causes instant skin frostbite.',
        professional_recommended: 0
      },

      // Fans
      {
        category_slug: 'fans',
        device_name: 'Ceiling Fan',
        problem_title: 'Ceiling fan running very slow even on highest speed (Speed 5)',
        keywords: 'fan slow, humming sound, speed regulator, slow speed, weak breeze',
        symptoms: 'Fan blades turn sluggishly, no strong air throw, sometimes hums or needs a gentle push by hand to start rotating.',
        possible_causes: 'Degraded motor run capacitor (value dropped below 2.5 µF / 3.15 µF), dry ball bearings with thick hardened grease, faulty electronic regulator on switchboard.',
        troubleshooting_steps: JSON.stringify([
          'Bypass the switchboard regulator or test on direct connection to rule out a burnt triac regulator.',
          'With fan switched OFF, gently push the blade with hand: if it spins freely for 10-15 seconds smoothly with zero resistance, bearings are fine and the capacitor is the culprit.',
          'If blade feels stiff or stops immediately when pushed, the ball bearings need degreasing and lubrication.',
          'To replace the capacitor: switch off room MCB, access the top bell canopy, take a photo of wire connections, replace old capacitor (usually 2.25µF or 2.5µF / 440VAC) with identical rating.'
        ]),
        tools_required: JSON.stringify(['Step ladder', 'Tester / screwdriver', 'Replacement fan capacitor (approx ₹50-₹80)']),
        difficulty: 'Easy to Moderate',
        estimated_cost_range: '₹50 - ₹150 (DIY capacitor) or ₹250 - ₹400 (electrician visit)',
        safety_warning: 'Turn OFF the main electrical breaker switch before climbing up to replace ceiling fan wiring. Discharge the old capacitor pins with an insulated screwdriver.',
        professional_recommended: 0
      },

      // Kitchen Appliances
      {
        category_slug: 'kitchen-appliances',
        device_name: 'Mixer Grinder',
        problem_title: 'Mixer grinder suddenly stopped working and smell of hot motor',
        keywords: 'mixer stopped, grinder tripped, red button, overload switch, dead mixer',
        symptoms: 'Motor abruptly turned off while grinding tough spices/batter, red power light is off, no response from knob.',
        possible_causes: 'Overload protector (OLP) tripped due to heavy jar load or continuous prolonged grinding, worn carbon brushes, jar blade shaft jammed.',
        troubleshooting_steps: JSON.stringify([
          'Immediately turn the speed knob to "OFF" and unplug the mixer from the wall socket.',
          'Remove the mixer jar. Inspect if the rubber coupler at base of jar turns freely by hand; if jammed, soak jar base in warm water to dissolve food paste.',
          'Let the mixer motor cool down for 10-15 minutes.',
          'Look underneath the bottom base of the mixer grinder: locate the small red or black protruding reset button (Overload Protector).',
          'Press the red button firmly inwards until you hear or feel a "click".',
          'Reduce load inside jar by half, plug back in, and test at low speed.'
        ]),
        tools_required: JSON.stringify(['No tools required — manual reset button press']),
        difficulty: 'Easy',
        estimated_cost_range: '₹0 (overload reset) to ₹150 - ₹350 (overload switch replacement)',
        safety_warning: 'Never test blades or push reset switch with the power cord connected to live AC mains.',
        professional_recommended: 0
      },
      {
        category_slug: 'kitchen-appliances',
        device_name: 'Microwave Oven',
        problem_title: 'Microwave turns on, plate spins, but food does not heat up',
        keywords: 'microwave not heating, food cold, plate spinning no heat, buzzing',
        symptoms: 'Timer counts down, interior light turns on, turntable spins normally, but soup or food comes out cold after 2 minutes.',
        possible_causes: 'Blown high-voltage diode, blown high-voltage fuse, defective magnetron vacuum tube, door safety interlock switch misaligned.',
        troubleshooting_steps: JSON.stringify([
          'Inspect door latch mechanism: ensure both door hooks enter the chassis slots completely and click all 3 microswitches.',
          'Check that microwave wasn\'t accidentally left in "Defrost" mode at lowest power level.',
          'Run a test with a ceramic mug half full of water for 60 seconds.',
          'If still cold, the fault lies in the high voltage generation circuit (magnetron, HV diode, or capacitor).'
        ]),
        tools_required: JSON.stringify(['Professional technician required']),
        difficulty: 'Professional Technician Required',
        estimated_cost_range: '₹800 - ₹2,500 (HV diode / magnetron replacement)',
        safety_warning: 'DANGER: NEVER OPEN A MICROWAVE CASING. The internal high-voltage capacitor stores over 2,000 to 4,000 Volts even weeks after being completely unplugged. This voltage is instantly lethal. Professional repair is strictly required.',
        professional_recommended: 1
      },

      // Wi-Fi Routers
      {
        category_slug: 'wifi-routers',
        device_name: 'Wi-Fi Router / Modem',
        problem_title: 'Wi-Fi connected but no Internet / Red LOS or PON light blinking',
        keywords: 'no internet, connected without internet, red light, los light, wifi exclamation',
        symptoms: 'Devices connect to Wi-Fi SSID with exclamation mark or "Connected, no internet". Optical light is red or blinking.',
        possible_causes: 'ISP fiber cut outside premise, bent fiber optical patch cord, DNS server failure, IP address lease conflict, router firmware freeze.',
        troubleshooting_steps: JSON.stringify([
          'Inspect LED lights on router front panel: check Power, PON, LOS, LAN, and Internet (Globe 🌐) icons.',
          'If "LOS" (Loss of Signal) light is blinking RED: the fiber cable from the telephone pole/ISP is bent, broken, or fiber cut. Contact your ISP helpdesk.',
          'Perform a clean 30-30-30 reboot: Unplug power adapter from wall, wait 30 seconds for capacitors to drain, plug back in and wait 3 minutes for optical handshake.',
          'If Internet light is green but devices say No Internet: check device DNS settings. Change router or phone DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare).',
          'Disconnect and reconnect yellow ethernet cables to ensure snug latch click.'
        ]),
        tools_required: JSON.stringify(['No tools required']),
        difficulty: 'Easy',
        estimated_cost_range: '₹0 (restart/DNS) or ISP technician free replacement',
        safety_warning: 'NEVER look directly into the tip of an optical fiber connector (blue or green SC/APC connector). Invisible infrared laser light can cause permanent retinal damage.',
        professional_recommended: 0
      }
    ];

    for (const art of articles) {
      await run(
        `INSERT INTO knowledge_base (
          id, category_slug, device_name, problem_title, keywords, symptoms,
          possible_causes, troubleshooting_steps, tools_required, difficulty,
          estimated_cost_range, safety_warning, professional_recommended
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(), art.category_slug, art.device_name, art.problem_title,
          art.keywords, art.symptoms, art.possible_causes, art.troubleshooting_steps,
          art.tools_required, art.difficulty, art.estimated_cost_range,
          art.safety_warning, art.professional_recommended
        ]
      );
    }
    console.log(`Seeded ${articles.length} knowledge base articles.`);
  }

  // Seed brands, models, symptoms, and error codes catalog
  await seedDevicesCatalog();

  console.log('Seeding completed successfully!');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
