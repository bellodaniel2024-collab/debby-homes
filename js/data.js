/* ==========================================================================
   DEBBY HOMES — Data Layer
   Static dataset simulating a property database. In a production build this
   would be served from an API; here it powers all filtering/search/detail
   rendering entirely on the client, as specified (no backend).
   ========================================================================== */

const AGENTS = [
  { id: "a1", name: "Debby Okafor", role: "Founder & Principal Broker", phone: "+234 802 345 6781", email: "debby@debbyhomes.ng", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop" },
  { id: "a2", name: "Tunde Balogun", role: "Senior Sales Agent", phone: "+234 802 345 6782", email: "tunde@debbyhomes.ng", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" },
  { id: "a3", name: "Amaka Eze", role: "Shortlet & Leasing Manager", phone: "+234 802 345 6783", email: "amaka@debbyhomes.ng", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" },
  { id: "a4", name: "Chuka Nnamdi", role: "Investment Consultant", phone: "+234 802 345 6784", email: "chuka@debbyhomes.ng", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop" },
  { id: "a5", name: "Farida Musa", role: "Client Relations Lead", phone: "+234 802 345 6785", email: "farida@debbyhomes.ng", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop" }
];

// Pool of high-quality property/interior images cycled across listings
const IMG = {
  exteriors: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop"
  ],
  interiors: [
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?q=80&w=1200&auto=format&fit=crop"
  ]
};

function imgSet(i){
  const e = IMG.exteriors[i % IMG.exteriors.length];
  const a = IMG.interiors[i % IMG.interiors.length];
  const b = IMG.interiors[(i+3) % IMG.interiors.length];
  const c = IMG.interiors[(i+5) % IMG.interiors.length];
  return [e,a,b,c];
}

const LOCATIONS = ["Ikoyi","Victoria Island","Lekki Phase 1","Banana Island","Oniru","Chevron","Ajah","Ikate"];

const AMENITY_POOL = ["24/7 Power Supply","Swimming Pool","Fitted Gym","24-Hour Security","CCTV Surveillance","Elevator","Smart Home System","Fitted Kitchen","Air Conditioning","Ample Parking","Rooftop Lounge","Children's Play Area","High-Speed Internet","Water Treatment Plant","Concierge Service","Serviced Estate","Cinema Room","Waterfront View"];

function pickAmenities(seed){
  const shuffled = [...AMENITY_POOL].sort(() => 0.5 - ((seed * 9301 + 49297) % 233280) / 233280);
  return shuffled.slice(0, 7);
}

// Base names to compose realistic listing titles
const TITLE_TEMPLATES = [
  "The {loc} Heights", "{loc} Waterfront Residence", "Pearl Court, {loc}",
  "The Grove, {loc}", "{loc} Skyline Apartments", "Emerald Villas, {loc}",
  "The Regency, {loc}", "Palm Court Towers, {loc}", "The Crest, {loc}",
  "Serenity Gardens, {loc}", "The Marbella, {loc}", "Golden Sands, {loc}",
  "Ivory Terrace, {loc}", "The Atlantic, {loc}", "Lakeview Residences, {loc}"
];

const PROPERTY_TYPES = ["Apartment","Duplex","Bungalow","Villa","Terrace","Studio","Penthouse"];
const STATUSES = ["For Sale","Rent","Shortlet"];

function nairaFmt(n){
  return "₦" + n.toLocaleString("en-NG");
}

function buildProperties(){
  const list = [];
  let idx = 1;
  LOCATIONS.forEach((loc, li) => {
    // ~4 properties per location => 32 total (>= 30 required)
    for (let k = 0; k < 4; k++){
      const seed = idx * 17 + li * 3 + k;
      const status = STATUSES[seed % 3];
      const type = PROPERTY_TYPES[(seed + k) % PROPERTY_TYPES.length];
      const beds = 1 + (seed % 5);
      const baths = Math.max(1, beds - (seed % 2));
      const sqm = 85 + ((seed * 13) % 420);
      const furnished = seed % 2 === 0;
      let price;
      if (status === "For Sale") price = (60 + (seed % 25) * 15) * 1000000; // ₦60m - ₦435m
      else if (status === "Rent") price = (3 + (seed % 18)) * 1000000; // ₦3m - ₦20m /year
      else price = (65 + (seed % 20) * 10) * 1000; // ₦65k - ₦265k /night

      const title = TITLE_TEMPLATES[seed % TITLE_TEMPLATES.length].replace("{loc}", loc);
      list.push({
        id: idx,
        title: `${type} — ${title}`,
        type, status, location: loc,
        price, priceLabel: nairaFmt(price) + (status === "Rent" ? " / year" : status === "Shortlet" ? " / night" : ""),
        beds, baths, sqm, furnished,
        images: imgSet(seed),
        amenities: pickAmenities(seed),
        agent: AGENTS[seed % AGENTS.length],
        description: `Set within one of ${loc}'s most sought-after enclaves, this ${beds}-bedroom ${type.toLowerCase()} pairs contemporary architecture with resort-grade finishes. Expect wide-plank flooring, floor-to-ceiling glazing, and a layout tuned for both quiet living and effortless entertaining, moments from the marina, fine dining and the best of Lagos Island.`,
        featured: seed % 5 === 0,
        dateAdded: new Date(2026, (seed % 7), (seed % 27) + 1).toISOString()
      });
      idx++;
    }
  });
  return list;
}

const PROPERTIES = buildProperties();

function getPropertyById(id){
  return PROPERTIES.find(p => p.id === Number(id));
}

function formatBedsBaths(p){
  return `${p.beds} Bed${p.beds>1?"s":""} • ${p.baths} Bath${p.baths>1?"s":""} • ${p.sqm} sqm`;
}
