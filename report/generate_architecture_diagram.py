import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_architecture_diagram(output_path):
    fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # Color Palette - Professional Academic Modern
    c_client_bg = '#EFF6FF'
    c_client_border = '#3B82F6'
    c_api_bg = '#F0FDF4'
    c_api_border = '#10B981'
    c_ai_bg = '#FAF5FF'
    c_ai_border = '#8B5CF6'
    c_db_bg = '#FFFBEB'
    c_db_border = '#F59E0B'
    c_pricing_bg = '#ECFDF5'
    c_pricing_border = '#059669'

    # 1. CLIENT LAYER
    rect_client = patches.FancyBboxPatch((0.5, 5.8), 3.2, 2.3, boxstyle="round,pad=0.15", ec=c_client_border, fc=c_client_bg, lw=1.8)
    ax.add_patch(rect_client)
    ax.text(2.1, 7.8, "PRESENTATION LAYER (CLIENT)", fontsize=9, fontweight='bold', ha='center', color='#1E3A8A', fontfamily='sans-serif')
    ax.text(2.1, 7.45, "React 19 • Vite • Tailwind CSS", fontsize=8, ha='center', color='#3B82F6', fontstyle='italic', fontfamily='sans-serif')
    ax.text(2.1, 6.95, "• Device Autocomplete & Brand Filter\n• Semantic Problem Input\n• Zero-Photo Diagnostic Form\n• Live Multi-Tier Cost Checker", fontsize=7.5, ha='center', va='center', color='#1E293B', fontfamily='sans-serif')

    # 2. API GATEWAY LAYER
    rect_api = patches.FancyBboxPatch((4.4, 5.8), 3.2, 2.3, boxstyle="round,pad=0.15", ec=c_api_border, fc=c_api_bg, lw=1.8)
    ax.add_patch(rect_api)
    ax.text(6.0, 7.8, "API GATEWAY & CONTROLLER", fontsize=9, fontweight='bold', ha='center', color='#065F46', fontfamily='sans-serif')
    ax.text(6.0, 7.45, "Node.js • Express 5 REST API", fontsize=8, ha='center', color='#10B981', fontstyle='italic', fontfamily='sans-serif')
    ax.text(6.0, 6.95, "• Route: /api/repair/diagnose\n• Route: /api/repair/costs\n• Semantic Text & Error Code Validator\n• JWT Auth & Admin Access Gate", fontsize=7.5, ha='center', va='center', color='#1E293B', fontfamily='sans-serif')

    # 3. AI DIAGNOSTIC ENGINE LAYER
    rect_ai = patches.FancyBboxPatch((8.3, 5.8), 3.2, 2.3, boxstyle="round,pad=0.15", ec=c_ai_border, fc=c_ai_bg, lw=1.8)
    ax.add_patch(rect_ai)
    ax.text(9.9, 7.8, "AI DIAGNOSTIC ENGINE", fontsize=9, fontweight='bold', ha='center', color='#5B21B6', fontfamily='sans-serif')
    ax.text(9.9, 7.45, "Google Gemini API Integration", fontsize=8, ha='center', color='#8B5CF6', fontstyle='italic', fontfamily='sans-serif')
    ax.text(9.9, 6.95, "• 10-Section Diagnostic Framework\n• Electrical Fault / PMIC Classifier\n• Step-by-Step Resolution Logic\n• Safety Hazard Warnings & Alerts", fontsize=7.5, ha='center', va='center', color='#1E293B', fontfamily='sans-serif')

    # 4. VERIFIED PRICING INTELLIGENCE ENGINE
    rect_pricing = patches.FancyBboxPatch((4.4, 1.8), 3.2, 3.2, boxstyle="round,pad=0.15", ec=c_pricing_border, fc=c_pricing_bg, lw=1.8)
    ax.add_patch(rect_pricing)
    ax.text(6.0, 4.7, "VERIFIED PRICING ENGINE", fontsize=9, fontweight='bold', ha='center', color='#065F46', fontfamily='sans-serif')
    ax.text(6.0, 4.35, "Multi-Source Cost Intelligence", fontsize=8, ha='center', color='#059669', fontstyle='italic', fontfamily='sans-serif')
    ax.text(6.0, 3.45, "• Tier 1: Official OEM & Authorised\n  (Aptronix/Apple, Samsung Portal)\n• Tier 2: Local Market Benchmark\n  (≥3 Local Verified Quotes Required)\n• Tier 3: RepairSathi Statistical Estimate\n• PMIC State: Bench Inspection Required", fontsize=7.5, ha='center', va='center', color='#1E293B', fontfamily='sans-serif')

    # 5. PERSISTENCE LAYER (SQLITE DATABASE)
    rect_db = patches.FancyBboxPatch((8.3, 1.8), 3.2, 3.2, boxstyle="round,pad=0.15", ec=c_db_border, fc=c_db_bg, lw=1.8)
    ax.add_patch(rect_db)
    ax.text(9.9, 4.7, "RELATIONAL DATA ENGINE", fontsize=9, fontweight='bold', ha='center', color='#92400E', fontfamily='sans-serif')
    ax.text(9.9, 4.35, "SQLite 3 with WAL Mode", fontsize=8, ha='center', color='#D97706', fontstyle='italic', fontfamily='sans-serif')
    ax.text(9.9, 3.45, "• device_models (Verified Catalogue)\n• official_repair_prices (OEM Rates)\n• authorised_provider_prices (AASP)\n• local_repair_quotes (Aggregated)\n• error_codes & conversations", fontsize=7.5, ha='center', va='center', color='#1E293B', fontfamily='sans-serif')

    # 6. EXTERNAL AUTHORISED DATA SOURCES
    rect_ext = patches.FancyBboxPatch((0.5, 1.8), 3.2, 3.2, boxstyle="round,pad=0.15", ec='#64748B', fc='#F8FAFC', lw=1.8)
    ax.add_patch(rect_ext)
    ax.text(2.1, 4.7, "VERIFIED DATA SOURCES", fontsize=9, fontweight='bold', ha='center', color='#334155', fontfamily='sans-serif')
    ax.text(2.1, 4.35, "Authorised Price Registries", fontsize=8, ha='center', color='#64748B', fontstyle='italic', fontfamily='sans-serif')
    ax.text(2.1, 3.45, "• Aptronix Published India Price Lists\n• Apple Official Spare Part Rates\n• Samsung Authorised Service Portal\n• OnePlus & Xiaomi Service Rate Cards\n• Audited Local City Quotations", fontsize=7.5, ha='center', va='center', color='#1E293B', fontfamily='sans-serif')

    # ARROWS & DATA FLOW
    # Client <-> API
    ax.annotate("", xy=(4.4, 7.0), xytext=(3.7, 7.0), arrowprops=dict(arrowstyle="<->", color="#1E3A8A", lw=1.8))
    ax.text(4.05, 7.15, "JSON", fontsize=7, fontweight='bold', ha='center', color='#1E3A8A')

    # API <-> AI
    ax.annotate("", xy=(8.3, 7.0), xytext=(7.6, 7.0), arrowprops=dict(arrowstyle="<->", color="#5B21B6", lw=1.8))
    ax.text(7.95, 7.15, "REST", fontsize=7, fontweight='bold', ha='center', color='#5B21B6')

    # API <-> Pricing
    ax.annotate("", xy=(6.0, 5.0), xytext=(6.0, 5.8), arrowprops=dict(arrowstyle="<->", color="#059669", lw=1.8))
    ax.text(6.5, 5.4, "Exact Match Query", fontsize=7, ha='left', color='#059669')

    # Pricing <-> DB
    ax.annotate("", xy=(8.3, 3.4), xytext=(7.6, 3.4), arrowprops=dict(arrowstyle="<->", color="#D97706", lw=1.8))
    ax.text(7.95, 3.55, "SQL", fontsize=7, fontweight='bold', ha='center', color='#D97706')

    # External -> Pricing
    ax.annotate("", xy=(4.4, 3.4), xytext=(3.7, 3.4), arrowprops=dict(arrowstyle="->", color="#64748B", lw=1.8, ls='--'))
    ax.text(4.05, 3.55, "Audited Ingestion", fontsize=6.5, ha='center', color='#64748B')

    # Title Banner
    ax.text(6.0, 8.25, "RepairSathi AI — System Architecture & Data Intelligence Pipeline", fontsize=11, fontweight='bold', ha='center', color='#0F172A', fontfamily='sans-serif')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Architecture diagram generated successfully at: {output_path}")

if __name__ == "__main__":
    import os
    out = r"C:\Users\LENOVO\.gemini\antigravity\scratch\RepairSathi\report\flowchart_architecture.png"
    draw_architecture_diagram(out)
