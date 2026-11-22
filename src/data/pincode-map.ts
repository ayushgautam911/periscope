/**
 * Pincode → constituency mapping for states with data in the app.
 *
 * Coverage is intentionally conservative — only pincodes verified against
 * India Post data are included. Return undefined if pincode is not found;
 * the UI falls back to the state dropdown.
 *
 * To extend: add an entry per pincode using the constituency id produced by
 * the slug() function in goaData.ts (lowercase kebab-case of the name).
 */

export interface PincodeLookup {
  constituencyId: string
  constituencyName: string
  stateId: string
}

// Goa — major towns only; expand with verified data as needed.
const GOA_PINCODES: Record<string, PincodeLookup> = {
  '403001': { constituencyId: 'panaji',        constituencyName: 'Panaji',        stateId: 'goa' },
  '403002': { constituencyId: 'panaji',        constituencyName: 'Panaji',        stateId: 'goa' },
  '403507': { constituencyId: 'mapusa',        constituencyName: 'Mapusa',        stateId: 'goa' },
  '403401': { constituencyId: 'ponda',         constituencyName: 'Ponda',         stateId: 'goa' },
  '403110': { constituencyId: 'priol',         constituencyName: 'Priol',         stateId: 'goa' },
  '403504': { constituencyId: 'bicholim',      constituencyName: 'Bicholim',      stateId: 'goa' },
  '403506': { constituencyId: 'valpoi',        constituencyName: 'Valpoi',        stateId: 'goa' },
  '403201': { constituencyId: 'sanquelim',     constituencyName: 'Sanquelim',     stateId: 'goa' },
  '403516': { constituencyId: 'calangute',     constituencyName: 'Calangute',     stateId: 'goa' },
  '403521': { constituencyId: 'porvorim',      constituencyName: 'Porvorim',      stateId: 'goa' },
  '403601': { constituencyId: 'margao',        constituencyName: 'Margao',        stateId: 'goa' },
  '403602': { constituencyId: 'navelim',       constituencyName: 'Navelim',       stateId: 'goa' },
  '403603': { constituencyId: 'fatorda',       constituencyName: 'Fatorda',       stateId: 'goa' },
  '403604': { constituencyId: 'nuvem',         constituencyName: 'Nuvem',         stateId: 'goa' },
  '403716': { constituencyId: 'benaulim',      constituencyName: 'Benaulim',      stateId: 'goa' },
  '403709': { constituencyId: 'curtorim',      constituencyName: 'Curtorim',      stateId: 'goa' },
  '403718': { constituencyId: 'loutolim',      constituencyName: 'Loutolim',      stateId: 'goa' },
  '403703': { constituencyId: 'cuncolim',      constituencyName: 'Cuncolim',      stateId: 'goa' },
  '403711': { constituencyId: 'velim',         constituencyName: 'Velim',         stateId: 'goa' },
  '403705': { constituencyId: 'quepem',        constituencyName: 'Quepem',        stateId: 'goa' },
  '403706': { constituencyId: 'curchorem',     constituencyName: 'Curchorem',     stateId: 'goa' },
  '403801': { constituencyId: 'dabolim',       constituencyName: 'Dabolim',       stateId: 'goa' },
  '403802': { constituencyId: 'vasco-da-gama', constituencyName: 'Vasco da Gama', stateId: 'goa' },
  '403803': { constituencyId: 'mormugao',      constituencyName: 'Mormugao',      stateId: 'goa' },
  '403710': { constituencyId: 'cortalim',      constituencyName: 'Cortalim',      stateId: 'goa' },
  '403702': { constituencyId: 'canacona',      constituencyName: 'Canacona',      stateId: 'goa' },
  '403704': { constituencyId: 'sanguem',       constituencyName: 'Sanguem',       stateId: 'goa' },
  '403408': { constituencyId: 'dharbandora',   constituencyName: 'Dharbandora',   stateId: 'goa' },
}

// Delhi — mapped by each pincode's dominant locality. Delhi pincodes don't
// align 1:1 with assembly constituencies; only pincodes whose main locality
// clearly falls inside one constituency are included. Not yet mapped (span
// several seats or unverified): 110007, 110016, 110020, 110021, 110023,
// 110026, 110028, 110029, 110031, 110034, 110036, 110038, 110046, 110049,
// 110052, 110054, 110055, 110057, 110061-063, 110065-074, 110076-078,
// 110087, 110090, 110095.
const DELHI_PINCODES: Record<string, PincodeLookup> = {
  '110001': { constituencyId: 'new-delhi',       constituencyName: 'New Delhi',       stateId: 'delhi' }, // Connaught Place
  '110002': { constituencyId: 'matia-mahal',     constituencyName: 'Matia Mahal',     stateId: 'delhi' }, // Darya Ganj
  '110003': { constituencyId: 'jangpura',        constituencyName: 'Jangpura',        stateId: 'delhi' }, // Lodhi Colony
  '110004': { constituencyId: 'new-delhi',       constituencyName: 'New Delhi',       stateId: 'delhi' }, // Rashtrapati Bhavan
  '110005': { constituencyId: 'karol-bagh',      constituencyName: 'Karol Bagh',      stateId: 'delhi' },
  '110006': { constituencyId: 'chandni-chowk',   constituencyName: 'Chandni Chowk',   stateId: 'delhi' },
  '110008': { constituencyId: 'patel-nagar',     constituencyName: 'Patel Nagar',     stateId: 'delhi' },
  '110009': { constituencyId: 'model-town',      constituencyName: 'Model Town',      stateId: 'delhi' },
  '110010': { constituencyId: 'delhi-cantt',     constituencyName: 'Delhi Cantt',     stateId: 'delhi' },
  '110011': { constituencyId: 'new-delhi',       constituencyName: 'New Delhi',       stateId: 'delhi' },
  '110012': { constituencyId: 'rajinder-nagar',  constituencyName: 'Rajinder Nagar',  stateId: 'delhi' }, // Inderpuri, Pusa
  '110013': { constituencyId: 'jangpura',        constituencyName: 'Jangpura',        stateId: 'delhi' }, // Nizamuddin
  '110014': { constituencyId: 'jangpura',        constituencyName: 'Jangpura',        stateId: 'delhi' }, // Bhogal
  '110015': { constituencyId: 'moti-nagar',      constituencyName: 'Moti Nagar',      stateId: 'delhi' }, // Kirti Nagar
  '110017': { constituencyId: 'malviya-nagar',   constituencyName: 'Malviya Nagar',   stateId: 'delhi' }, // Malviya Nagar, Saket
  '110018': { constituencyId: 'tilak-nagar',     constituencyName: 'Tilak Nagar',     stateId: 'delhi' },
  '110019': { constituencyId: 'kalkaji',         constituencyName: 'Kalkaji',         stateId: 'delhi' }, // Kalkaji, Nehru Place
  '110022': { constituencyId: 'r-k-puram',       constituencyName: 'R K Puram',       stateId: 'delhi' },
  '110024': { constituencyId: 'kasturba-nagar',  constituencyName: 'Kasturba Nagar',  stateId: 'delhi' }, // Lajpat Nagar
  '110025': { constituencyId: 'okhla',           constituencyName: 'Okhla',           stateId: 'delhi' }, // Jamia Nagar
  '110027': { constituencyId: 'rajouri-garden',  constituencyName: 'Rajouri Garden',  stateId: 'delhi' },
  '110030': { constituencyId: 'mehrauli',        constituencyName: 'Mehrauli',        stateId: 'delhi' },
  '110032': { constituencyId: 'shahdara',        constituencyName: 'Shahdara',        stateId: 'delhi' },
  '110033': { constituencyId: 'adarsh-nagar',    constituencyName: 'Adarsh Nagar',    stateId: 'delhi' },
  '110035': { constituencyId: 'wazirpur',        constituencyName: 'Wazirpur',        stateId: 'delhi' }, // Ashok Vihar
  '110037': { constituencyId: 'bijwasan',        constituencyName: 'Bijwasan',        stateId: 'delhi' }, // Mahipalpur
  '110040': { constituencyId: 'nerela',          constituencyName: 'Narela',          stateId: 'delhi' },
  '110041': { constituencyId: 'nangloi-jat',     constituencyName: 'Nangloi Jat',     stateId: 'delhi' },
  '110042': { constituencyId: 'badli',           constituencyName: 'Badli',           stateId: 'delhi' }, // Samaypur Badli
  '110043': { constituencyId: 'najafgarh',       constituencyName: 'Najafgarh',       stateId: 'delhi' },
  '110044': { constituencyId: 'badarpur',        constituencyName: 'Badarpur',        stateId: 'delhi' },
  '110045': { constituencyId: 'palam',           constituencyName: 'Palam',           stateId: 'delhi' },
  '110047': { constituencyId: 'chhatarpur',      constituencyName: 'Chhatarpur',      stateId: 'delhi' },
  '110048': { constituencyId: 'greater-kailash', constituencyName: 'Greater Kailash', stateId: 'delhi' },
  '110051': { constituencyId: 'krishna-nagar',   constituencyName: 'Krishna Nagar',   stateId: 'delhi' },
  '110053': { constituencyId: 'ghonda',          constituencyName: 'Ghonda',          stateId: 'delhi' }, // Bhajanpura
  '110058': { constituencyId: 'janakpuri',       constituencyName: 'Janakpuri',       stateId: 'delhi' },
  '110059': { constituencyId: 'uttam-nagar',     constituencyName: 'Uttam Nagar',     stateId: 'delhi' },
  '110060': { constituencyId: 'rajinder-nagar',  constituencyName: 'Rajinder Nagar',  stateId: 'delhi' },
  '110064': { constituencyId: 'hari-nagar',      constituencyName: 'Hari Nagar',      stateId: 'delhi' },
  '110075': { constituencyId: 'dwarka',          constituencyName: 'Dwarka',          stateId: 'delhi' },
  '110081': { constituencyId: 'mundka',          constituencyName: 'Mundka',          stateId: 'delhi' }, // Kanjhawala
  '110082': { constituencyId: 'bawana',          constituencyName: 'Bawana',          stateId: 'delhi' },
  '110083': { constituencyId: 'mangol-puri',     constituencyName: 'Mangol Puri',     stateId: 'delhi' },
  '110084': { constituencyId: 'burari',          constituencyName: 'Burari',          stateId: 'delhi' },
  '110085': { constituencyId: 'rohini',          constituencyName: 'Rohini',          stateId: 'delhi' },
  '110086': { constituencyId: 'kirari',          constituencyName: 'Kirari',          stateId: 'delhi' },
  '110088': { constituencyId: 'shalimar-bagh',   constituencyName: 'Shalimar Bagh',   stateId: 'delhi' },
  '110089': { constituencyId: 'rithala',         constituencyName: 'Rithala',         stateId: 'delhi' }, // Rohini upper sectors
  '110091': { constituencyId: 'patparganj',      constituencyName: 'Patparganj',      stateId: 'delhi' }, // Mayur Vihar Ph 1
  '110092': { constituencyId: 'laxmi-nagar',     constituencyName: 'Laxmi Nagar',     stateId: 'delhi' }, // Shakarpur
  '110093': { constituencyId: 'seema-puri',      constituencyName: 'Seema Puri',      stateId: 'delhi' }, // Nand Nagri
  '110094': { constituencyId: 'karawal-nagar',   constituencyName: 'Karawal Nagar',   stateId: 'delhi' },
  '110096': { constituencyId: 'kondli',          constituencyName: 'Kondli',          stateId: 'delhi' }, // Mayur Vihar Ph 3
}

// Bihar — district-HQ town head-office pincodes mapped to their namesake
// constituency, plus Patna's main urban pincodes. Bihar has ~1,000 pincodes;
// rural ones span multiple seats and stay unmapped (dropdown fallback).
const BIHAR_PINCODES: Record<string, PincodeLookup> = {
  '800001': { constituencyId: 'bankipur',     constituencyName: 'Bankipur',     stateId: 'bihar' }, // Patna GPO
  '800008': { constituencyId: 'patna-sahib',  constituencyName: 'Patna Sahib',  stateId: 'bihar' }, // Patna City
  '800020': { constituencyId: 'kumhrar',      constituencyName: 'Kumhrar',      stateId: 'bihar' }, // Kankarbagh
  '801503': { constituencyId: 'danapur',      constituencyName: 'Danapur',      stateId: 'bihar' },
  '801505': { constituencyId: 'phulwari',     constituencyName: 'Phulwari',     stateId: 'bihar' }, // Phulwari Sharif
  '802101': { constituencyId: 'buxar',        constituencyName: 'Buxar',        stateId: 'bihar' },
  '802301': { constituencyId: 'arrah',        constituencyName: 'Arrah',        stateId: 'bihar' },
  '803101': { constituencyId: 'biharsharif',  constituencyName: 'Biharsharif',  stateId: 'bihar' },
  '804408': { constituencyId: 'jehanabad',    constituencyName: 'Jehanabad',    stateId: 'bihar' },
  '805110': { constituencyId: 'nawada',       constituencyName: 'Nawada',       stateId: 'bihar' },
  '811201': { constituencyId: 'munger',       constituencyName: 'Munger',       stateId: 'bihar' },
  '811307': { constituencyId: 'jamui',        constituencyName: 'Jamui',        stateId: 'bihar' },
  '811311': { constituencyId: 'lakhisarai',   constituencyName: 'Lakhisarai',   stateId: 'bihar' },
  '812001': { constituencyId: 'bhagalpur',    constituencyName: 'Bhagalpur',    stateId: 'bihar' },
  '813102': { constituencyId: 'banka',        constituencyName: 'Banka',        stateId: 'bihar' },
  '821115': { constituencyId: 'sasaram',      constituencyName: 'Sasaram',      stateId: 'bihar' },
  '823001': { constituencyId: 'gaya-town',    constituencyName: 'Gaya Town',    stateId: 'bihar' },
  '824101': { constituencyId: 'aurangabad',   constituencyName: 'Aurangabad',   stateId: 'bihar' },
  '824231': { constituencyId: 'bodh-gaya',    constituencyName: 'Bodh Gaya',    stateId: 'bihar' },
  '841226': { constituencyId: 'siwan',        constituencyName: 'Siwan',        stateId: 'bihar' },
  '841301': { constituencyId: 'chapra',       constituencyName: 'Chapra',       stateId: 'bihar' },
  '841428': { constituencyId: 'gopalganj',    constituencyName: 'Gopalganj',    stateId: 'bihar' },
  '842001': { constituencyId: 'muzaffarpur',  constituencyName: 'Muzaffarpur',  stateId: 'bihar' },
  '843302': { constituencyId: 'sitamarhi',    constituencyName: 'Sitamarhi',    stateId: 'bihar' },
  '844101': { constituencyId: 'hajipur',      constituencyName: 'Hajipur',      stateId: 'bihar' },
  '845401': { constituencyId: 'motihari',     constituencyName: 'Motihari',     stateId: 'bihar' },
  '845438': { constituencyId: 'bettiah',      constituencyName: 'Bettiah',      stateId: 'bihar' },
  '846004': { constituencyId: 'darbhanga',    constituencyName: 'Darbhanga',    stateId: 'bihar' },
  '847211': { constituencyId: 'madhubani',    constituencyName: 'Madhubani',    stateId: 'bihar' },
  '848101': { constituencyId: 'samastipur',   constituencyName: 'Samastipur',   stateId: 'bihar' },
  '851101': { constituencyId: 'begusarai',    constituencyName: 'Begusarai',    stateId: 'bihar' },
  '851204': { constituencyId: 'khagaria',     constituencyName: 'Khagaria',     stateId: 'bihar' },
  '852113': { constituencyId: 'madhepura',    constituencyName: 'Madhepura',    stateId: 'bihar' },
  '852131': { constituencyId: 'supaul',       constituencyName: 'Supaul',       stateId: 'bihar' },
  '852201': { constituencyId: 'saharsa',      constituencyName: 'Saharsa',      stateId: 'bihar' },
  '854105': { constituencyId: 'katihar',      constituencyName: 'Katihar',      stateId: 'bihar' },
  '854301': { constituencyId: 'purnia',       constituencyName: 'Purnia',       stateId: 'bihar' },
  '854311': { constituencyId: 'araria',       constituencyName: 'Araria',       stateId: 'bihar' },
  '855107': { constituencyId: 'kishanganj',   constituencyName: 'Kishanganj',   stateId: 'bihar' },
}

const ALL_PINCODES: Record<string, PincodeLookup> = {
  ...GOA_PINCODES,
  ...DELHI_PINCODES,
  ...BIHAR_PINCODES,
}

export function lookupPincode(pincode: string): PincodeLookup | undefined {
  return ALL_PINCODES[pincode.trim()]
}
