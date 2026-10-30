import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

PROMPTS = [
    {
        "id": "prompt1_idea_analysis",
        "stage": "Stage 1: Idea / Problem Analysis",
        "title": "Architectural Decoupling: AI Diagnostic vs Database Pricing",
        "date": "Project Inception / Phase 1",
        "content": (
            "Act as a senior software architect and consumer tech specialist.\n"
            "Analyze the systemic failures of digital device repair tools in India. Current AI implementations\n"
            "routinely generate hallucinated, unsubstantiated cost estimates (e.g. '₹300 - ₹2,000 varies by spare\n"
            "availability'). Formulate a clean architectural separation:\n"
            "1. The Generative AI language model synthesizes qualitative fault identification and step-by-step DIY steps.\n"
            "2. All numerical repair costs must be strictly retrieved from a deterministic SQLite database populated\n"
            "   with published manufacturer rate cards (Aptronix Apple, Samsung Portal) and audited local quotations.\n"
            "3. Eliminate photo-upload dependency in favor of verified brand-model catalog autocomplete."
        )
    },
    {
        "id": "prompt2_requirements",
        "stage": "Stage 2: Requirements / Features Specification",
        "title": "10-Section Diagnostic Framework & Multi-Tier Pricing Hierarchy",
        "date": "Feature Definition Phase",
        "content": (
            "Create a rigorous engineering requirements specification for RepairSathi AI:\n"
            "- 10-Section Diagnostic Schema: Return structured JSON containing issue summary, problem identification,\n"
            "  possible causes, most likely explanation, severity level, step-by-step troubleshooting, tools required,\n"
            "  repair difficulty, professional intervention triggers, and safety precautions.\n"
            "- Multi-Tier Pricing Hierarchy: For every component replacement, query and contrast:\n"
            "  * Tier 1: Official OEM & Authorised Service Provider (part price, labour, 18% GST, warranty terms).\n"
            "  * Tier 2: Independent Local Repair Quotes (mandate >= 3 quotes for a valid benchmark).\n"
            "  * Tier 3: RepairSathi Statistical Estimate (weighted city benchmark).\n"
            "- Hardware Safety Lockout: If user symptoms indicate burnt electronics or PMIC failure, lock out part quotes\n"
            "  and enforce 'Physical Bench Inspection Required' with ₹0 parts estimate."
        )
    },
    {
        "id": "prompt3_ui_design",
        "stage": "Stage 3: UI / Layout Design",
        "title": "Gen Z Tech Startup Aesthetic & Dark/Light Design Identity",
        "date": "Interface Modernization Phase",
        "content": (
            "Transform RepairSathi AI into a premium, modern, Gen Z-inspired technology platform.\n"
            "Design Directives:\n"
            "- Style Identity: Modern AI SaaS startup; sleek dark charcoal surfaces (#090A0F / #12141A), subtle borders,\n"
            "  acid-green/electric-blue status indicators, monospace metadata chips, and high-contrast typography.\n"
            "- Eliminate Outdated UI: Remove generic corporate Bootstrap layouts, excessive rainbow gradients,\n"
            "  and cartoonish graphics. Ensure complete absence of photo upload dropzones across the entire app.\n"
            "- Components: Build interactive category selectors, debounced autocomplete inputs, verified pricing cards,\n"
            "  and a unified dark/light theme switchable via Lucide React icons."
        )
    },
    {
        "id": "prompt4_code_generation",
        "stage": "Stage 4: Code Generation",
        "title": "Deterministic Exact Matching SQL Engine & Express 5 Controllers",
        "date": "Backend Engineering Phase",
        "content": (
            "Generate the Express 5 controllers and SQLite data access logic for /api/repair/costs and /api/repair/diagnose.\n"
            "Critical Implementation Rules:\n"
            "1. Exact Model Match Priority: Ensure SQL queries match 'Galaxy A14 5G' over 'Galaxy A14 4G' by implementing:\n"
            "   ORDER BY CASE WHEN LOWER(model_name) = ? THEN 0 ELSE 1 END.\n"
            "2. Component Cross-Referencing: Match diagnosed component (e.g. Display, Battery, PMIC) against\n"
            "   official_repair_prices and local_repair_quotes tables.\n"
            "3. Autocomplete API: Provide instant brand and model suggestions filtered by category, debounced at 200ms."
        )
    },
    {
        "id": "prompt5_testing",
        "stage": "Stage 5: Testing & Automated QA",
        "title": "Autonomous Regression Testing Harness (18/18 Verified Tests)",
        "date": "Quality Assurance Phase",
        "content": (
            "Implement an autonomous end-to-end regression audit suite in Node.js:\n"
            "- test_verified_pricing.js (8 Tests): Verify Aptronix iPhone 15 Pro Max display is exactly ₹52,207\n"
            "  (Part ₹43,243 + Labour ₹1,000 + 18% GST ₹7,964); verify battery is ₹9,206; verify Samsung Galaxy A14 5G\n"
            "  display is ₹2,729; verify PMIC fault returns 'SUSPECTED_ELECTRICAL_FAULT' and null part quote.\n"
            "- test_live_cost_engine.js (10 Tests): Validate multi-brand cost filtering, exact model resolution,\n"
            "  >=3 quote local threshold check, and admin authorization security checks."
        )
    },
    {
        "id": "prompt6_debugging",
        "stage": "Stage 6: Debugging & Continuous Improvement",
        "title": "Hallucination Eradication & Electrical Bench Safety Gate",
        "date": "Production Hardening Phase",
        "content": (
            "CRITICAL BUG FIX & AUDIT REMEDIATION:\n"
            "1. Eradicate Generic AI Price Ranges: Inspect aiService.js and permanently delete estimated_cost_range\n"
            "   fallback values ('₹300 - ₹2,000 varies by brand'). If verified pricing is attached, AI price must be null.\n"
            "2. PMIC Lockout Fix: When users report burnt electronics smell or short-circuit, block naive battery quotes\n"
            "   and immediately return 'Physical Bench Inspection Required' with ₹0 parts and bench diagnostic fee.\n"
            "3. Semantic Problem Description Validator: Reject meaningless strings ('xdfgjkm') before calling Gemini API."
        )
    }
]

def render_prompt_card(prompt_data, output_path):
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=300)
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 4.8)
    ax.axis('off')

    # Card background (Modern Dark Charcoal / Terminal aesthetic)
    bg = patches.FancyBboxPatch((0.2, 0.2), 8.6, 4.4, boxstyle="round,pad=0.15", ec="#334155", fc="#0F172A", lw=1.5)
    ax.add_patch(bg)

    # Top Header Bar
    top_bar = patches.Rectangle((0.25, 4.0), 8.5, 0.55, ec="none", fc="#1E293B")
    ax.add_patch(top_bar)

    # Terminal buttons (Red, Yellow, Green)
    for i, c in enumerate(["#EF4444", "#F59E0B", "#10B981"]):
        dot = plt.Circle((0.55 + i * 0.22, 4.28), 0.07, color=c)
        ax.add_patch(dot)

    # Header Titles
    ax.text(1.4, 4.35, prompt_data["stage"].upper(), fontsize=7.5, fontweight='bold', color="#38BDF8", fontfamily="sans-serif")
    ax.text(1.4, 4.12, prompt_data["title"], fontsize=8, fontweight='bold', color="#F8FAFC", fontfamily="sans-serif")
    ax.text(8.5, 4.25, prompt_data["date"], fontsize=6.8, ha='right', color="#94A3B8", fontfamily="sans-serif")

    # Prompt Body with Monospace font and light code box
    lines = prompt_data["content"].split("\n")
    y_start = 3.65
    line_spacing = 0.25
    for idx, line in enumerate(lines):
        y_pos = y_start - (idx * line_spacing)
        # Line number
        ax.text(0.55, y_pos, f"{idx+1:02d}", fontsize=6.5, color="#475569", fontfamily="monospace")
        # Line text
        color = "#A5B4FC" if idx == 0 else "#CBD5E1"
        if "Critical" in line or "CRITICAL" in line or "1." in line or "2." in line or "3." in line:
            color = "#FDE047"
        ax.text(0.9, y_pos, line, fontsize=6.8, color=color, fontfamily="monospace")

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated prompt card: {output_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\LENOVO\.gemini\antigravity\scratch\RepairSathi\report\prompt_cards"
    os.makedirs(out_dir, exist_ok=True)
    for p in PROMPTS:
        p_path = os.path.join(out_dir, f"{p['id']}.png")
        render_prompt_card(p, p_path)
