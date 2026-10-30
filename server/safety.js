/**
 * RepairSathi Safety & Hazard Analysis System
 * Protects users from dangerous DIY operations:
 * - High voltage & mains electricity
 * - Microwave capacitors / magnetron radiation
 * - Lithium battery swelling / thermal runaway
 * - Refrigerator freon / gas leaks / compressor bursts
 * - Water immersion / electrocution hazards
 */

const CRITICAL_HAZARD_KEYWORDS = [
  'smoke', 'smoking', 'spark', 'sparking', 'sparks', 'fire', 'flame', 'flames',
  'burning smell', 'burnt smell', 'exploded', 'swollen battery', 'bulging battery',
  'shock', 'electric shock', 'current in body', 'gas leak', 'gas smell', 'hissing gas',
  'water flooded', 'submerged in water', 'water spilled inside live'
];

const HIGH_VOLTAGE_COMPONENTS = [
  'microwave capacitor', 'magnetron', 'power supply board', 'inverter board',
  'crt monitor', 'crt television', 'flyback transformer', 'compressor electricals'
];

function analyzeSafety(description = '', category = '', deviceName = '', symptoms = '') {
  const combined = `${description} ${category} ${deviceName} ${symptoms}`.toLowerCase();

  // 1. Critical Emergency Check
  for (const hazard of CRITICAL_HAZARD_KEYWORDS) {
    if (combined.includes(hazard)) {
      return {
        level: 'CRITICAL_EMERGENCY',
        isCritical: true,
        alertTitle: '⚠️ CRITICAL SAFETY HAZARD DETECTED',
        warning: `The symptoms indicate an active or severe electrical, fire, or chemical hazard (${hazard.toUpperCase()}).`,
        actionSteps: [
          'DO NOT attempt to disassemble or repair the device.',
          'Immediately UNPLUG the device from the electrical wall outlet if safe to reach.',
          'If the power plug is hot or sparking, shut off power from the main circuit breaker / MCB.',
          'Keep flammable items away and ensure proper room ventilation.',
          'Never place water on electrical fires or swollen lithium batteries.',
          'Contact a certified authorized brand technician or emergency services immediately.'
        ],
        professionalRequired: true,
        difficulty: 'Professional Technician Required'
      };
    }
  }

  // 2. High Voltage / Mains Hazard Check
  for (const comp of HIGH_VOLTAGE_COMPONENTS) {
    if (combined.includes(comp)) {
      return {
        level: 'HIGH_VOLTAGE_WARNING',
        isCritical: false,
        alertTitle: '⚡ HIGH VOLTAGE WARNING',
        warning: `This device component (${comp}) contains dangerous high-voltage energy stored in capacitors even when disconnected from power.`,
        actionSteps: [
          'High voltage capacitors can deliver lethal electrical shocks.',
          'Do not open the outer protective metal housing.',
          'Professional technician equipped with insulated discharge tools is strictly required.'
        ],
        professionalRequired: true,
        difficulty: 'Professional Technician Required'
      };
    }
  }

  // 3. Category-specific precautions
  let precautions = [];
  const lowerCat = (category || '').toLowerCase();

  if (lowerCat.includes('smartphone') || lowerCat.includes('mobile')) {
    precautions.push('Never puncture or bend the internal lithium-ion battery.');
    precautions.push('Use anti-static plastic pry tools instead of metallic screwdrivers near the battery.');
  } else if (lowerCat.includes('microwave') || combined.includes('microwave')) {
    precautions.push('Never operate the microwave oven with the door open or panels removed.');
    precautions.push('Never tamper with the high-voltage capacitor or magnetron.');
  } else if (lowerCat.includes('refrigerator') || lowerCat.includes('air conditioner')) {
    precautions.push('Never puncture the refrigerant coils or tubing. Escaping gas causes frostbite and asphyxiation.');
    precautions.push('Always unplug the appliance at least 15 minutes prior to inspecting back condenser coils.');
  } else if (lowerCat.includes('washing machine')) {
    precautions.push('Unplug from mains and turn off the water supply tap before any inspection.');
    precautions.push('Drain all residual water before tilting or examining pumps.');
  } else if (lowerCat.includes('laptop') || lowerCat.includes('computer')) {
    precautions.push('Always disconnect charger and disconnect the internal battery before touching internal components.');
    precautions.push('Ground yourself or use an ESD wrist strap to prevent electrostatic discharge to delicate microchips.');
  } else {
    precautions.push('Ensure the appliance is completely disconnected from power before inspecting.');
    precautions.push('Keep working area clean, dry, and well-lit.');
  }

  return {
    level: 'STANDARD_PRECAUTIONS',
    isCritical: false,
    alertTitle: '🛡️ Safe Troubleshooting Guidelines',
    warning: 'Always prioritize your physical safety over device recovery.',
    actionSteps: precautions,
    professionalRequired: false,
    difficulty: 'Moderate'
  };
}

module.exports = {
  analyzeSafety,
  CRITICAL_HAZARD_KEYWORDS
};
