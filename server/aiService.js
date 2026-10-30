const fs = require('fs');
const path = require('path');
const { analyzeSafety } = require('./safety');
const { all, get } = require('./db');

/**
 * Intelligent Local Knowledge & Rule-Based Diagnosis Engine
 */
async function generateLocalDiagnosis({
  category,
  brand,
  deviceName,
  model,
  errorCode,
  verifiedErrorCode,
  problemDescription,
  imagePath,
  imageVerification,
  allowUnverifiedModel
}) {
  const safety = analyzeSafety(problemDescription, category, `${brand} ${deviceName}`, errorCode);
  const deviceDisplayName = `${brand ? brand + ' ' : ''}${model || deviceName || category}`;

  // 1. Critical Hazard Emergency Protocol
  if (safety.isCritical) {
    return {
      summary: `Critical Hazard Warning for ${deviceDisplayName}: ${safety.warning}`,
      problem_identification: `Active High-Risk Hazard: ${safety.alertTitle}`,
      possible_causes: [
        'Electrical short-circuit or insulation failure',
        'Thermal runaway or lithium-ion battery rupture',
        'High-voltage capacitor arcing or compressor internal short'
      ],
      most_likely_explanation: `The symptoms indicate an active or impending electrical/chemical failure (${safety.warning}). Physical inspection must be halted immediately.`,
      confidence_and_uncertainty: 'High certainty of severe physical safety hazard. Zero tolerance for DIY disassembly.',
      severity: 'Critical',
      troubleshooting_steps: safety.actionSteps,
      tools_required: ['DO NOT USE TOOLS. Disconnect power from wall outlet or main breaker.'],
      difficulty: 'Professional Technician Required',
      estimated_cost_range: null,
      suspected_component: 'Critical Hazard / Inspection Required',
      fault_type: 'suspected_electrical_fault',
      is_electrical_suspicion: true,
      recommended_repair_method: 'hardware_diagnostic_inspection',
      professional_recommended: true,
      when_to_contact_professional: 'IMMEDIATELY. Contact an authorized brand service technician or emergency response before restoring power.',
      safety_precautions: [
        'Disconnect appliance from mains electricity immediately if safe to reach.',
        'Never touch smoking or sparking equipment with bare hands.',
        'Keep fire extinguisher / emergency numbers accessible.'
      ],
      safety_alert: safety,
      image_observations: null,
      confidence_note: 'Immediate safety protocol activated. Physical intervention is strictly required.',
      engine_mode: 'safety_emergency_protocol'
    };
  }

  // 2. Verified Error Code Identification
  let errorCodeSection = null;
  if (verifiedErrorCode) {
    errorCodeSection = {
      code: verifiedErrorCode.code,
      title: verifiedErrorCode.title,
      meaning: verifiedErrorCode.meaning,
      typicalCause: verifiedErrorCode.typical_cause,
      severity: verifiedErrorCode.severity
    };
  }

  // 3. Search Verified Knowledge Base for best matching solution
  let matchedArticle = null;
  const searchKeywords = `${problemDescription} ${errorCode || ''} ${brand || ''} ${model || ''} ${deviceName || ''}`.toLowerCase();
  const kbRows = await all('SELECT * FROM knowledge_base');

  let bestScore = 0;
  for (const row of kbRows) {
    let score = 0;
    if (category && row.category_slug === category.toLowerCase()) score += 10;
    if (row.keywords) {
      const kws = row.keywords.toLowerCase().split(',');
      for (const kw of kws) {
        if (searchKeywords.includes(kw.trim())) score += 6;
      }
    }
    if (row.problem_title && searchKeywords.includes(row.problem_title.toLowerCase())) score += 15;
    if (score > bestScore) {
      bestScore = score;
      matchedArticle = row;
    }
  }

  if (matchedArticle && bestScore >= 12) {
    let steps = [];
    let tools = [];
    try { steps = JSON.parse(matchedArticle.troubleshooting_steps); } catch { steps = [matchedArticle.troubleshooting_steps]; }
    try { tools = JSON.parse(matchedArticle.tools_required); } catch { tools = [matchedArticle.tools_required]; }

    // If verified error code was supplied, prepend specific error code diagnostic step
    if (errorCodeSection) {
      steps.unshift(`Verified Error Code [${errorCodeSection.code} - ${errorCodeSection.title}]: ${errorCodeSection.meaning} Recommendation: ${errorCodeSection.typicalCause}`);
    }

    const causes = matchedArticle.possible_causes.split(',').map(s => s.trim());
    if (errorCodeSection && !causes.includes(errorCodeSection.title)) {
      causes.unshift(`${errorCodeSection.title} (${errorCodeSection.code})`);
    }

    const textToCheck = `${matchedArticle.problem_title} ${problemDescription}`.toLowerCase();
    let suspectedComponent = 'Unknown / General Inspection Required';
    let faultType = 'unconfirmed_requires_inspection';
    let isElectricalSuspicion = false;
    let recommendedRepairMethod = 'hardware_diagnostic_inspection';

    if (textToCheck.includes('screen') || textToCheck.includes('display') || textToCheck.includes('crack') || (textToCheck.includes('glass') && !textToCheck.includes('back glass')) || textToCheck.includes('touch') || textToCheck.includes('flicker') || textToCheck.includes('green line')) {
      suspectedComponent = 'Display / Screen';
      faultType = 'hardware_component_failure';
      recommendedRepairMethod = 'screen_replacement';
    } else if (textToCheck.includes('battery') || textToCheck.includes('drain') || textToCheck.includes('backup') || textToCheck.includes('charge drops') || textToCheck.includes('swollen')) {
      suspectedComponent = 'Battery';
      faultType = 'hardware_component_failure';
      recommendedRepairMethod = 'battery_replacement';
    } else if (textToCheck.includes('back glass') || textToCheck.includes('rear glass') || textToCheck.includes('back panel')) {
      suspectedComponent = 'Back Glass / Rear Panel';
      faultType = 'hardware_component_failure';
      recommendedRepairMethod = 'back_glass_replacement';
    } else if (textToCheck.includes('camera') || textToCheck.includes('lens') || textToCheck.includes('blurry')) {
      suspectedComponent = 'Rear Camera';
      faultType = 'hardware_component_failure';
      recommendedRepairMethod = 'camera_replacement';
    } else if (textToCheck.includes('charging port') || (textToCheck.includes('port') && textToCheck.includes('cable'))) {
      suspectedComponent = 'Charging Port';
      faultType = 'hardware_component_failure';
      recommendedRepairMethod = 'port_replacement';
    } else if (textToCheck.includes('power') || textToCheck.includes('won\'t turn on') || textToCheck.includes('pmic') || textToCheck.includes('voltage') || textToCheck.includes('dead')) {
      suspectedComponent = 'Power Management';
      faultType = 'suspected_electrical_fault';
      isElectricalSuspicion = true;
      recommendedRepairMethod = 'hardware_diagnostic_inspection';
    }

    return {
      summary: `Troubleshooting for ${deviceDisplayName}: ${matchedArticle.problem_title}`,
      problem_identification: `${matchedArticle.problem_title}${errorCodeSection ? ` (Error Code ${errorCodeSection.code})` : ''}`,
      possible_causes: causes,
      most_likely_explanation: errorCodeSection
        ? `Official manufacturer definition for error code ${errorCodeSection.code}: ${errorCodeSection.meaning}`
        : causes[0] || 'Common component fatigue or debris blockage',
      confidence_and_uncertainty: allowUnverifiedModel
        ? 'Matched based on verified appliance symptoms, but exact internal revision may vary as model is unverified in catalog.'
        : 'High confidence based on verified RepairSathi diagnostic catalog.',
      severity: matchedArticle.professional_recommended ? 'High' : (matchedArticle.difficulty === 'Easy' ? 'Low' : 'Medium'),
      troubleshooting_steps: steps,
      tools_required: tools,
      difficulty: matchedArticle.difficulty,
      estimated_cost_range: null, // STRICT RULE: No generic AI pricing ranges allowed
      suspected_component: suspectedComponent,
      fault_type: faultType,
      is_electrical_suspicion: isElectricalSuspicion,
      recommended_repair_method: recommendedRepairMethod,
      professional_recommended: Boolean(matchedArticle.professional_recommended),
      when_to_contact_professional: matchedArticle.professional_recommended
        ? 'High-voltage circuits, sealed refrigerant lines, or fragile display panels require certified equipment.'
        : 'If completing steps 1 through 4 does not resolve the issue, or if unusual burning odors occur, consult an authorized technician.',
      safety_precautions: [
        matchedArticle.safety_warning,
        ...safety.actionSteps
      ].filter(Boolean),
      safety_alert: safety,
      error_code_details: errorCodeSection,
      image_observations: null,
      confidence_note: allowUnverifiedModel
        ? 'Note: Model entered is unverified in our database. Troubleshooting steps are based on general device architecture.'
        : 'Diagnosis matched with RepairSathi Verified Knowledge Base.',
      engine_mode: 'verified_knowledge_engine'
    };
  }

  // 4. Synthesized Expert Troubleshooting Logic
  const steps = [
    `Complete Power Discharge: Disconnect ${deviceDisplayName} from the power source for 3 to 5 minutes to clear controller registers and discharge capacitors.`,
    `Physical Inspection: Examine all visible power cords, plugs, and external connection points for loose seating, oxidation, or thermal discoloration.`,
    errorCodeSection
      ? `Investigate Error Code [${errorCodeSection.code}]: ${errorCodeSection.meaning}. Check: ${errorCodeSection.typicalCause}.`
      : `Check status LED indicators or error display panels against standard manufacturer operation.`,
    `Clean accessible ventilation openings and filter grilles using a dry anti-static brush or compressed air.`,
    `Verify with an alternate, independently tested wall electrical outlet to eliminate household circuit breaker faults.`
  ];

  const probLower = (problemDescription || '').toLowerCase();
  let suspectedComponent = 'Unknown / General Inspection Required';
  let faultType = 'unconfirmed_requires_inspection';
  let isElectricalSuspicion = false;
  let recommendedRepairMethod = 'hardware_diagnostic_inspection';

  if (probLower.includes('screen') || probLower.includes('display') || probLower.includes('crack') || probLower.includes('glass') && !probLower.includes('back glass') || probLower.includes('touch') || probLower.includes('flicker') || probLower.includes('green line') || probLower.includes('black out') || probLower.includes('blank display')) {
    suspectedComponent = 'Display / Screen';
    faultType = 'hardware_component_failure';
    recommendedRepairMethod = 'screen_replacement';
  } else if (probLower.includes('battery') || probLower.includes('drain') || probLower.includes('backup') || probLower.includes('swollen') || probLower.includes('bulg') || probLower.includes('shutting down at 20') || probLower.includes('charge drops')) {
    suspectedComponent = 'Battery';
    faultType = 'hardware_component_failure';
    recommendedRepairMethod = 'battery_replacement';
  } else if (probLower.includes('back glass') || probLower.includes('rear glass') || probLower.includes('back panel')) {
    suspectedComponent = 'Back Glass / Rear Panel';
    faultType = 'hardware_component_failure';
    recommendedRepairMethod = 'back_glass_replacement';
  } else if (probLower.includes('camera') || probLower.includes('lens') || probLower.includes('blurry photo') || probLower.includes('shaking photo') || probLower.includes('focus')) {
    suspectedComponent = 'Rear Camera';
    faultType = 'hardware_component_failure';
    recommendedRepairMethod = 'camera_replacement';
  } else if (probLower.includes('port') || probLower.includes('type c') || probLower.includes('lightning') || probLower.includes('loose cable') || probLower.includes('pin damaged')) {
    suspectedComponent = 'Charging Port';
    faultType = 'hardware_component_failure';
    recommendedRepairMethod = 'port_replacement';
  } else if (probLower.includes('power') || probLower.includes('won\'t turn on') || probLower.includes('not turning on') || probLower.includes('dead') || probLower.includes('shut down') || probLower.includes('spike') || probLower.includes('pmic') || probLower.includes('voltage') || probLower.includes('controller lockout')) {
    suspectedComponent = 'Power Management';
    faultType = 'suspected_electrical_fault';
    isElectricalSuspicion = true;
    recommendedRepairMethod = 'hardware_diagnostic_inspection';
  }

  const causes = [
    isElectricalSuspicion
      ? 'Power management controller lockout or transient voltage spike'
      : errorCodeSection
      ? `${errorCodeSection.title} (Code ${errorCodeSection.code})`
      : 'Hardware component wear or physical contact degradation',
    'Loose, corroded, or oxidized internal wiring harness terminal',
    'Thermal protection sensor cutoff triggered by restricted airflow',
    'Component mechanical wear or aged capacitor fatigue'
  ];

  return {
    summary: `Diagnostic evaluation for ${deviceDisplayName}`,
    problem_identification: `Operational symptom analysis for ${deviceDisplayName}`,
    possible_causes: causes,
    most_likely_explanation: errorCodeSection
      ? `Manufacturer diagnostic code ${errorCodeSection.code}: ${errorCodeSection.meaning}`
      : causes[0],
    confidence_and_uncertainty: allowUnverifiedModel
      ? 'Unverified Model: General appliance architecture rules applied. Specific PCB layouts may vary.'
      : isElectricalSuspicion
      ? 'Suspected electrical or power management fault. Hardware bench testing is required to isolate the exact micro-component.'
      : 'Standard appliance diagnostic profile applied. Follow initial non-invasive steps first.',
    severity: errorCodeSection?.severity === 'High' ? 'High' : isElectricalSuspicion ? 'High' : 'Medium',
    troubleshooting_steps: steps,
    tools_required: ['Dry lint-free microfiber cloth', 'Anti-static brush', 'Digital multimeter (for technician checks)'],
    difficulty: isElectricalSuspicion ? 'Professional Technician Required' : 'Moderate',
    estimated_cost_range: null, // STRICT RULE: No generic AI pricing ranges allowed
    suspected_component: suspectedComponent,
    fault_type: faultType,
    is_electrical_suspicion: isElectricalSuspicion,
    recommended_repair_method: recommendedRepairMethod,
    professional_recommended: isElectricalSuspicion || Boolean(errorCodeSection),
    when_to_contact_professional: isElectricalSuspicion
      ? 'Power management issues should be diagnosed by an authorized service provider to prevent further circuit board damage.'
      : 'If non-invasive checks fail to restore normal operation, contact an authorized service center.',
    safety_precautions: safety.actionSteps,
    safety_alert: safety,
    error_code_details: errorCodeSection,
    image_observations: null,
    confidence_note: allowUnverifiedModel
      ? 'Unverified model pathway: AI diagnosis provides generalized guidance. Verify specific repair manuals if available.'
      : isElectricalSuspicion
      ? 'Suspected electrical fault: Exact repair cost requires physical hardware inspection.'
      : 'Preliminary diagnostic analysis. Prices must be retrieved from verified source catalogues.',
    engine_mode: 'general_expert_engine'
  };
}

/**
 * Gemini API Integration with Multimodal Vision & Fallback
 */
async function diagnoseWithAI({
  category,
  brand,
  deviceName,
  model,
  errorCode,
  verifiedErrorCode,
  problemDescription,
  imagePath,
  imageVerification,
  allowUnverifiedModel
}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  const safety = analyzeSafety(problemDescription, category, `${brand} ${deviceName}`, errorCode);

  // If no Gemini API key, use the local verified expert engine
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
    const localResult = await generateLocalDiagnosis({
      category,
      brand,
      deviceName,
      model,
      errorCode,
      verifiedErrorCode,
      problemDescription,
      imagePath,
      imageVerification,
      allowUnverifiedModel
    });
    return {
      ...localResult,
      engine_provider: 'RepairSathi Smart Knowledge Engine (Local Verified Mode)'
    };
  }

  try {
    const prompt = `
You are RepairSathi AI, an expert, safety-first electronics and home appliance repair diagnostician.
Analyze the following repair problem and return a STRICT JSON response ONLY.

Device Details:
- Category: ${category}
- Brand: ${brand || 'Unknown'}
- Model: ${model || 'Generic Model'}
- Model Status: ${allowUnverifiedModel ? 'UNVERIFIED MODEL (User entered an unlisted model)' : 'Verified Model in Catalog'}
- Error Code: ${errorCode || 'None'}
${verifiedErrorCode ? `Official Error Code Reference: ${verifiedErrorCode.code} - ${verifiedErrorCode.title} (${verifiedErrorCode.meaning})` : ''}
- Problem Description: ${problemDescription}
${imageVerification ? `Image Analysis: Observed ${imageVerification.observedObject}, Clarity: ${imageVerification.clarity}, Authenticity: ${imageVerification.authenticity}` : ''}

Safety Directives:
- Never advise opening live high-voltage equipment, microwave capacitors, CRT TVs, or handling escaping refrigerants.
- If there is burning smell, sparks, fire, or swollen battery, prioritize immediate evacuation/disconnecting power.
- Never present an uncertain diagnosis as guaranteed fact. If the model is unverified, honestly reflect that uncertainty.
- CRITICAL PRICING INTEGRITY RULE: DO NOT generate, guess, or invent any numerical repair costs, rupee ranges, or pricing figures. Pricing is handled by a separate verified catalog engine.

Output MUST be a valid JSON object with EXACTLY this structure:
{
  "summary": "Concise summary of likely issue",
  "problem_identification": "Clear identification of the malfunction",
  "possible_causes": ["Cause 1", "Cause 2", "Cause 3"],
  "most_likely_explanation": "Detailed explanation of the most probable root cause",
  "confidence_and_uncertainty": "Honest assessment of diagnosis certainty and any missing info",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "troubleshooting_steps": ["Step 1...", "Step 2...", "Step 3..."],
  "tools_required": ["Tool 1", "Tool 2"],
  "difficulty": "Easy" | "Moderate" | "Difficult" | "Professional Technician Required",
  "suspected_component": "Display / Screen" | "Battery" | "Back Glass / Rear Panel" | "Rear Camera" | "Charging Port" | "Power Management" | "Motherboard" | "Other Repairs",
  "fault_type": "hardware_component_failure" | "suspected_electrical_fault" | "software_issue" | "unconfirmed_requires_inspection",
  "is_electrical_suspicion": true | false,
  "recommended_repair_method": "screen_replacement" | "battery_replacement" | "back_glass_replacement" | "camera_replacement" | "port_replacement" | "hardware_diagnostic_inspection",
  "professional_recommended": true | false,
  "when_to_contact_professional": "Clear criteria for when the user should stop DIY and call a certified technician",
  "safety_precautions": ["Precaution 1", "Precaution 2"],
  "confidence_note": "Honest note about certainty and unverified model status if applicable"
}
`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = JSON.parse(candidateText);
    return {
      ...parsed,
      safety_alert: safety,
      engine_provider: 'Google Gemini 1.5 Flash (Cloud AI)'
    };
  } catch (apiError) {
    console.warn('Gemini API call failed, falling back to local expert engine:', apiError.message);
    const fallbackResult = await generateLocalDiagnosis({
      category,
      brand,
      deviceName,
      model,
      errorCode,
      verifiedErrorCode,
      problemDescription,
      imagePath,
      imageVerification,
      allowUnverifiedModel
    });
    return {
      ...fallbackResult,
      engine_provider: `RepairSathi Smart Knowledge Engine (Fallback: ${apiError.message.slice(0, 35)}...)`
    };
  }
}

/**
 * Handle Follow-up Conversation with Context
 */
async function generateFollowUpResponse({ conversation, history, userQuestion }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY' && apiKey.trim() !== '') {
    try {
      const contents = [];
      contents.push({
        role: 'user',
        parts: [{
          text: `You are RepairSathi AI assisting a user with troubleshooting their ${conversation.brand || ''} ${conversation.device_name || conversation.category_slug} (Model: ${conversation.model || 'N/A'}).
Original problem: "${conversation.problem_description}".
Error code: "${conversation.error_code || 'None'}".
Please respond concisely, practically, and with safety-first advice.`
        }]
      });

      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: userQuestion }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.4 } })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return {
            reply,
            engine: 'Google Gemini'
          };
        }
      }
    } catch (e) {
      console.warn('Gemini follow-up error, switching to rule engine:', e.message);
    }
  }

  // Intelligent local follow-up reply
  const q = userQuestion.toLowerCase();
  let reply = '';

  if (q.includes('step 1') || q.includes('step 2') || q.includes('step 3') || q.includes('tried') || q.includes('did that') || q.includes('done')) {
    reply = `Great progress on verifying those steps for your ${conversation.brand || ''} ${conversation.model || conversation.device_name || 'device'}. If the behavior has not changed:
1. Re-check whether any error codes have appeared or changed.
2. Confirm the device has been left disconnected from power for a full 2-3 minutes to allow system registers and cache to clear.
3. If no improvement is observed, proceeding to the next troubleshooting step or checking internal fuses/cables with a multimeter is the recommended next action.`;
  } else if (q.includes('cost') || q.includes('price') || q.includes('how much') || q.includes('rupees') || q.includes('charge')) {
    reply = `Regarding repair expenses for the ${conversation.brand || ''} ${conversation.model || conversation.device_name || 'appliance'}:
- Basic technician home diagnostic visit: typically ₹250 – ₹450.
- Standard minor parts (capacitors, thermal fuses, switches, belts): ₹150 – ₹600.
- Major parts (motherboard, display panels, compressors, motors): ₹1,500 – ₹5,000+.
Always ask the technician for a written quote before approving replacement parts.`;
  } else if (q.includes('safe') || q.includes('dangerous') || q.includes('shock') || q.includes('open')) {
    reply = `⚠️ Safety Reminder: Never open the housing if you are not experienced with electronics. Always disconnect the plug from the wall outlet. If your device has large capacitors (like microwaves, inverter boards, or CRT televisions), they retain lethal charge even when unplugged. Always use insulated tools or consult an authorized service center.`;
  } else if (q.includes('tool') || q.includes('screwdriver') || q.includes('what do i need')) {
    reply = `For basic troubleshooting on this ${conversation.brand || ''} ${conversation.model || conversation.device_name || 'device'}, you will usually need:
- Precision screwdriver set (Phillips #00, Torx)
- Anti-static brush or dry toothbrush
- Can of compressed air
- Digital multimeter (if testing continuity or voltages)
- Smartphone flashlight for clear visibility inside dark chassis.`;
  } else {
    reply = `Regarding your question about "${userQuestion}":
For the ${conversation.brand || ''} ${conversation.device_name || 'device'} (${conversation.model || 'model'}), please ensure you have first followed the safety precautions. If you are experiencing unexpected symptoms, tell me any changes in LED lights, sounds (buzzing, clicking, clicking relays), or error codes and I will provide specific next steps.`;
  }

  return {
    reply,
    engine: 'RepairSathi Smart Conversation Engine'
  };
}

module.exports = {
  diagnoseWithAI,
  generateFollowUpResponse,
  generateLocalDiagnosis
};
