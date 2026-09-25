"""Generates the standalone inner pages of the Walk Through Apollo site.

Run from the project root:  python tools/build_pages.py
Content is clearly marked sample data until approved hospital content arrives.
"""
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Apollo Hospitals</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#F3EEE6">
<link rel="icon" type="image/png" href="assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="draft" role="note">Demo site. Names, phone numbers and addresses are sample content, not real hospital information.</div>
<header class="site-header">
  <a class="brand" href="index.html" aria-label="Apollo Hospitals home">
    <img src="assets/img/mark.png" alt="" width="36" height="36">
    <span>Apollo Hospitals<small>Demo Branch</small></span>
  </a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
  <nav class="nav" id="site-nav" aria-label="Main">
    <a href="doctors.html">Find a doctor</a>
    <a href="departments.html">Departments</a>
    <a href="locations.html">Locations</a>
    <a href="contact.html">Contact</a>
    <a class="emergency" href="emergency.html">Emergency</a>
    <a class="btn btn-primary" href="book.html">Book appointment</a>
  </nav>
</header>
<main id="main" tabindex="-1">
<section class="page-hero reveal"><div class="wrap">
  <span class="kicker rv">{kicker}</span>
  <h1 class="rv">{h1}</h1>
  <p class="lede rv">{lede}</p>
</div></section>
<section class="section reveal" style="padding-top:40px"><div class="wrap">
"""

FOOT = """
</div></section>
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="cols">
      <div><strong>Apollo Hospitals</strong> · Demo Branch</div>
      <nav aria-label="Footer">
        <a href="index.html">Walk through the hospital</a><a href="doctors.html">Find a doctor</a><a href="departments.html">Departments</a><a href="book.html">Book appointment</a><a href="locations.html">Locations</a><a href="contact.html">Contact</a><a href="emergency.html">Emergency</a>
      </nav>
    </div>
    <p class="fine">Some images on this site are AI-assisted visualisations based on photographs of the hospital. Demo content: all names, phone numbers and addresses on this site are samples.</p>
  </div>
</footer>
<div class="action-bar" aria-label="Quick actions">
  <a class="btn btn-ghost" href="contact.html">Call</a>
  <a class="btn btn-primary" href="book.html">Book</a>
  <a class="btn btn-ghost" href="locations.html">Directions</a>
</div>
<div class="env" aria-hidden="true"></div>
<script src="assets/site.js" defer></script>
</body>
</html>
"""

PHONE_APPT = '<a href="tel:+910000000001">+91 00000 00001</a>'
PHONE_GEN = '<a href="tel:+910000000002">+91 00000 00002</a>'
ADDRESS = "12 Demo Road, Sample Nagar, Your City 500000"

def rows(pairs):
    items = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in pairs)
    return f'<dl class="row-list rv">{items}</dl>'

DOCTORS = [
    ("Dr. Ananya Rao", "Cardiology", "MBBS, MD, DM (Cardiology)", "Mon, Wed, Fri"),
    ("Dr. Vikram Menon", "Orthopaedics", "MBBS, MS (Orthopaedics)", "Tue, Thu, Sat"),
    ("Dr. Priya Sharma", "Neurology", "MBBS, MD, DM (Neurology)", "Mon to Fri"),
    ("Dr. Arjun Iyer", "Paediatrics", "MBBS, MD (Paediatrics)", "Mon to Sat"),
    ("Dr. Meera Nair", "Women's Health", "MBBS, MS (Obstetrics and Gynaecology)", "Tue to Sat"),
    ("Dr. Rahul Verma", "General Medicine", "MBBS, MD (General Medicine)", "Mon to Sat"),
]

def doctor_items():
    return "".join(
        f'<li class="card"><h3>{n}</h3><p>{sp}</p><p>{q} · {d}</p>'
        '<p style="margin-top:12px"><a href="book.html">Book with this doctor</a></p></li>'
        for n, sp, q, d in DOCTORS
    )

DEPARTMENTS = [
    ("Cardiology", "Heart checks, heart rhythm care and heart surgery."),
    ("Orthopaedics", "Bones, joints, sports injuries and joint replacement."),
    ("Neurology", "Headaches, stroke, epilepsy and nerve conditions."),
    ("Paediatrics", "Care for babies, children and teenagers."),
    ("Women's Health", "Pregnancy, childbirth and gynaecology."),
    ("General Medicine", "Everyday illness, fevers and long-term conditions."),
    ("Oncology", "Cancer diagnosis, treatment and follow-up care."),
    ("Gastroenterology", "Stomach, liver and digestive care."),
    ("ENT", "Ear, nose and throat care."),
]

PAGES = {
    "doctors.html": dict(
        title="Find a doctor", desc="Search Apollo Hospitals doctors by name or specialty.",
        kicker="Find a doctor", h1="Find the right doctor.",
        lede="Search by a doctor's name or by what you need help with. These are sample profiles.",
        body=(
            '<div class="field rv"><label for="doctor-q">Doctor or specialty</label>'
            '<input class="input" id="doctor-q" type="search" placeholder="For example, Cardiology" autocomplete="off"></div>'
            '<p id="doctor-status" aria-live="polite" style="margin-top:12px;color:var(--ink-2)"></p>'
            '<ul class="grid rv" data-doctor-list style="list-style:none;padding:0">' + doctor_items() + "</ul>"
        ),
    ),
    "departments.html": dict(
        title="Departments", desc="Every department and specialty at Apollo Hospitals.",
        kicker="Departments", h1="Every area of care, in one place.",
        lede="Choose a department to see its doctors and how to book.",
        body='<div class="grid">' + "".join(
            f'<a class="card rv" href="doctors.html?q={name.replace(" ", "+").replace(chr(39), "%27")}"><h3>{name}</h3><p>{line}</p><span class="arrow" aria-hidden="true">&rarr;</span></a>'
            for name, line in DEPARTMENTS
        ) + "</div>",
    ),
    "book.html": dict(
        title="Book an appointment", desc="Book an appointment at Apollo Hospitals.",
        kicker="Book an appointment", h1="Book a time that suits you.",
        lede="Use the hospital's booking system online, or call and we will help you choose a time.",
        body=(
            '<div class="rv" style="display:flex;flex-wrap:wrap;gap:12px">'
            '<a class="btn btn-primary" href="#" aria-describedby="booking-note">Book online</a>'
            '<a class="btn btn-ghost" href="tel:+910000000001">Call +91 00000 00001</a></div>'
            '<p id="booking-note" class="rv" style="margin-top:14px;color:var(--ink-2)">Demo: the Book online button will link to the hospital&#39;s existing booking system.</p>'
            + rows([("Appointments", PHONE_APPT), ("Outpatient hours", "Monday to Saturday, 8 am to 8 pm"), ("What to bring", "A photo ID, any earlier reports and a list of your medicines")])
        ),
    ),
    "locations.html": dict(
        title="Locations", desc="Find Apollo Hospitals: address, directions and parking.",
        kicker="Locations", h1="How to find us.",
        lede="Address, directions and parking for your visit.",
        body=rows([("Address", ADDRESS), ("Getting here", "The main gate faces the road, with the drop-off canopy straight ahead."), ("Parking", "Visitor parking beside the main building."), ("Visiting hours", "4 pm to 7 pm, every day")])
        + '<p class="rv" style="margin-top:24px"><a class="btn btn-ghost" href="#">Open in maps</a></p>',
    ),
    "contact.html": dict(
        title="Contact", desc="Phone numbers and email for Apollo Hospitals.",
        kicker="Contact", h1="Talk to us.",
        lede="Phone numbers and email for appointments and general questions.",
        body=rows([("Appointments", PHONE_APPT), ("General enquiries", PHONE_GEN), ("Email", '<a href="mailto:hello@example.com">hello@example.com</a>'), ("Emergency", '<a href="emergency.html">112 or 108</a>')]),
    ),
    "emergency.html": dict(
        title="Emergency", desc="What to do in a medical emergency.",
        kicker="Emergency", h1="In an emergency, call now.",
        lede="If someone's life may be in danger, call for help straight away.",
        body=(
            '<div class="card urgent rv" style="max-width:640px"><h3>Call 112</h3>'
            '<p style="font-size:28px;color:var(--ink);margin-top:6px"><a href="tel:112">112</a> · <a href="tel:108">108</a></p>'
            '<p style="margin-top:10px">112 is India&#39;s national emergency number. 108 is the national ambulance line.</p></div>'
            + rows([("Ambulance", '<a href="tel:108">108</a>'), ("On arrival", "Sample: follow the signs to the emergency entrance.")])
        ),
    ),
}

for name, p in PAGES.items():
    html = HEAD.format(**p) + p["body"] + FOOT
    (SITE / name).write_text(html, encoding="utf-8")
    print("wrote", name)
