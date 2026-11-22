"""ECI affidavit pipeline — targets affidavit.eci.gov.in directly.

Covers elections since 2019 (eSuvidha era). Requires an India-based IP
address — the portal is blocked by Akamai WAF from non-India IPs.

For elections prior to 2019 use affidavitarchive.nic.in (separate module,
not yet implemented).

Quick start (from an India VPS or AWS Mumbai):
    pip install requests beautifulsoup4 lxml pdfminer.six
    python -m eci_pipeline --election 13-AC-GENERAL-3-23 --state Goa

Data flow:
    ECI affidavit portal  (affidavit.eci.gov.in)
      CandidateCustomFilter?electionType=3&election=23&page=N
        → candidate listing (name, party, status, state, constituency, profile link)
      /show-profile/{encrypted_id}/{election}/{season}/{type}/{constType}
        → candidate profile page
          → age, gender, base64-encoded pdfUrl hidden input
    Suvidha  (suvidha.eci.gov.in)
      /uploads/acaffidavit/{year}/AC/{state_code}/{ac_no}/{filename}.pdf
        → Form 26 affidavit PDF (machine-readable text in eSuvidha era)
    PDF parser
        → criminal cases, assets, liabilities, education
"""

BASE_URL = "https://affidavit.eci.gov.in"
LISTING_URL = (
    BASE_URL
    + "/CandidateCustomFilter"
    + "?electionType={election_type}&election={election_no}&page={page}"
)
