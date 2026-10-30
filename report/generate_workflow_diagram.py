import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_workflow_diagram(output_path):
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    # Color palette
    c_start = '#EFF6FF'
    c_start_b = '#2563EB'
    c_gate = '#FEF3C7'
    c_gate_b = '#D97706'
    c_proc = '#F0FDF4'
    c_proc_b = '#059669'
    c_alert = '#FEF2F2'
    c_alert_b = '#DC2626'
    c_end = '#F3E8FF'
    c_end_b = '#7C3AED'

    # Step 1: User Input
    rect1 = patches.FancyBboxPatch((0.4, 5.2), 2.2, 1.6, boxstyle="round,pad=0.1", ec=c_start_b, fc=c_start, lw=1.8)
    ax.add_patch(rect1)
    ax.text(1.5, 6.4, "STEP 1: USER INPUT", fontsize=8.5, fontweight='bold', ha='center', color='#1E3A8A')
    ax.text(1.5, 5.8, "• Select Category (10 Types)\n• Verified Brand & Model\n• Problem Description\n• Error Code (Optional)", fontsize=7.2, ha='center', color='#1E293B')

    # Step 2: Semantic & Catalog Validation
    rect2 = patches.FancyBboxPatch((3.1, 5.2), 2.3, 1.6, boxstyle="round,pad=0.1", ec=c_gate_b, fc=c_gate, lw=1.8)
    ax.add_patch(rect2)
    ax.text(4.25, 6.4, "STEP 2: VALIDATION GATE", fontsize=8.5, fontweight='bold', ha='center', color='#92400E')
    ax.text(4.25, 5.8, "• Model Catalog Match Check\n• Text Validation (No Gibberish)\n• Error Code Registry Lookup\n• Block Invalid Submissions", fontsize=7.2, ha='center', color='#1E293B')

    # Step 3: AI Diagnostic Synthesis
    rect3 = patches.FancyBboxPatch((5.9, 5.2), 2.3, 1.6, boxstyle="round,pad=0.1", ec=c_proc_b, fc=c_proc, lw=1.8)
    ax.add_patch(rect3)
    ax.text(7.05, 6.4, "STEP 3: AI DIAGNOSIS", fontsize=8.5, fontweight='bold', ha='center', color='#065F46')
    ax.text(7.05, 5.8, "• Google Gemini 1.5 Reasoning\n• 10-Section Diagnostic JSON\n• Probable Causes & Explanations\n• DIY Steps & Safety Warnings", fontsize=7.2, ha='center', color='#1E293B')

    # Step 4: Decision: Electrical Short / PMIC?
    rect4 = patches.Polygon([[8.7, 6.0], [9.8, 6.9], [10.9, 6.0], [9.8, 5.1]], closed=True, ec='#B91C1C', fc='#FEF2F2', lw=1.8)
    ax.add_patch(rect4)
    ax.text(9.8, 6.15, "Electrical\nFault / PMIC?", fontsize=7.8, fontweight='bold', ha='center', color='#991B1B')

    # Branch A: Electrical Lockout (Downwards)
    rect_a = patches.FancyBboxPatch((8.6, 2.2), 2.3, 1.8, boxstyle="round,pad=0.1", ec=c_alert_b, fc=c_alert, lw=1.8)
    ax.add_patch(rect_a)
    ax.text(9.75, 3.6, "SAFETY LOCKOUT STATE", fontsize=8.5, fontweight='bold', ha='center', color='#991B1B')
    ax.text(9.75, 2.9, "• Hardware Inspection Required\n• ₹0 Speculative Parts Quote\n• Bench Testing Range Only\n• Authorized Center Direction", fontsize=7.2, ha='center', color='#1E293B')

    # Branch B: Standard Part Replacement Pricing (Leftwards)
    rect_b = patches.FancyBboxPatch((4.8, 2.2), 3.3, 1.8, boxstyle="round,pad=0.1", ec=c_proc_b, fc='#ECFDF5', lw=1.8)
    ax.add_patch(rect_b)
    ax.text(6.45, 3.6, "STEP 4: DETERMINISTIC PRICING", fontsize=8.5, fontweight='bold', ha='center', color='#065F46')
    ax.text(6.45, 2.9, "• Query SQLite Price Catalogs\n• Prioritize Exact Model Match\n• Compile 3 Tiers (Official, Local, Est.)\n• Aptronix / Samsung Rate Cards", fontsize=7.2, ha='center', color='#1E293B')

    # Step 5: Multi-Tier Output Display
    rect5 = patches.FancyBboxPatch((0.8, 2.2), 3.2, 1.8, boxstyle="round,pad=0.1", ec=c_end_b, fc=c_end, lw=1.8)
    ax.add_patch(rect5)
    ax.text(2.4, 3.6, "STEP 5: REPORT & CHAT UI", fontsize=8.5, fontweight='bold', ha='center', color='#5B21B6')
    ax.text(2.4, 2.9, "• 10-Section Diagnostic Findings\n• Multi-Tier Verified Pricing Card\n• Tax & Warranty Transparency\n• Follow-Up Interactive Chat", fontsize=7.2, ha='center', color='#1E293B')

    # Connectors
    # 1 -> 2
    ax.annotate("", xy=(3.1, 6.0), xytext=(2.6, 6.0), arrowprops=dict(arrowstyle="->", color="#1E3A8A", lw=1.6))
    # 2 -> 3
    ax.annotate("", xy=(5.9, 6.0), xytext=(5.4, 6.0), arrowprops=dict(arrowstyle="->", color="#92400E", lw=1.6))
    # 3 -> 4
    ax.annotate("", xy=(8.7, 6.0), xytext=(8.2, 6.0), arrowprops=dict(arrowstyle="->", color="#065F46", lw=1.6))

    # 4 -> Branch A (YES)
    ax.annotate("", xy=(9.8, 4.0), xytext=(9.8, 5.1), arrowprops=dict(arrowstyle="->", color="#DC2626", lw=1.6))
    ax.text(10.05, 4.6, "YES (Burnt/Short)", fontsize=7.2, fontweight='bold', color='#DC2626')

    # 4 -> Branch B (NO)
    ax.annotate("", xy=(8.1, 3.1), xytext=(9.0, 5.3), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.6, connectionstyle="angle,angleA=0,angleB=90,rad=5"))
    ax.text(8.7, 4.2, "NO (Part Issue)", fontsize=7.2, fontweight='bold', color='#059669')

    # Branch B -> Step 5
    ax.annotate("", xy=(4.0, 3.1), xytext=(4.8, 3.1), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.6))

    # Branch A -> Step 5
    ax.annotate("", xy=(4.0, 2.5), xytext=(8.6, 2.5), arrowprops=dict(arrowstyle="->", color="#991B1B", lw=1.6, ls='--'))

    # Title
    ax.text(5.5, 7.2, "RepairSathi AI — End-to-End Diagnostic & Pricing Workflow", fontsize=11, fontweight='bold', ha='center', color='#0F172A')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Workflow diagram saved to:", output_path)

if __name__ == "__main__":
    out = r"C:\Users\LENOVO\.gemini\antigravity\scratch\RepairSathi\report\workflow_diagram.png"
    draw_workflow_diagram(out)
