import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqbbvbvxlegqtguoyhfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYmJ2YnZ4bGVncXRndW95aGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDYwMDE2MCwiZXhwIjoyMTA2MTc2MTYwfQ.hG8ue_VRbBgFdirDJJDYw2fZFhaaHOdx7GLaFTfwp3o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('--- Starting BroHood Admin Seed ---');

  // Fetch categories
  const { data: categories } = await supabase.from('categories').select('*');
  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });
  console.log('Categories found:', Object.keys(catMap));

  // Seed Brands
  const brandsList = [
    { name: 'Rolex', slug: 'rolex', category_id: catMap['watches'], is_featured: true },
    { name: 'Audemars Piguet', slug: 'audemars-piguet', category_id: catMap['watches'], is_featured: true },
    { name: 'Patek Philippe', slug: 'patek-philippe', category_id: catMap['watches'], is_featured: true },
    { name: 'Air Jordan', slug: 'air-jordan', category_id: catMap['sneakers'], is_featured: true },
    { name: 'Travis Scott x Nike', slug: 'travis-scott-nike', category_id: catMap['sneakers'], is_featured: true },
    { name: 'Yeezy', slug: 'yeezy', category_id: catMap['sneakers'], is_featured: false },
    { name: 'Cartier', slug: 'cartier', category_id: catMap['goggles'], is_featured: true },
    { name: 'Prada Eyewear', slug: 'prada-eyewear', category_id: catMap['goggles'], is_featured: true },
    { name: 'Essentials FOG', slug: 'essentials-fog', category_id: catMap['tshirts'], is_featured: true },
    { name: 'Represent Clo', slug: 'represent-clo', category_id: catMap['tshirts'], is_featured: true },
    { name: 'Palm Angels', slug: 'palm-angels', category_id: catMap['tshirts'], is_featured: false },
  ];

  const brandIdMap = {};
  for (const b of brandsList) {
    const { data: existing } = await supabase.from('brands').select('id').eq('slug', b.slug).maybeSingle();
    if (existing) {
      brandIdMap[b.slug] = existing.id;
    } else {
      const { data: created, error } = await supabase.from('brands').insert(b).select().single();
      if (!error && created) {
        brandIdMap[b.slug] = created.id;
      } else {
        console.error(`Error creating brand ${b.name}:`, error?.message);
      }
    }
  }
  console.log('Brands ready:', Object.keys(brandIdMap).length);

  // Products to seed
  const productsToSeed = [
    {
      title: 'Rolex Submariner "Hulk" Date 41mm Green Cerachrom',
      slug: 'rolex-submariner-hulk-41mm-green-cerachrom',
      brand_id: brandIdMap['rolex'],
      category_id: catMap['watches'],
      description: '1:1 Master Quality Submariner "Hulk" featuring high-grade 904L Oystersteel, clone Calibre 3235 automatic movement, ceramic green bezel with platinum coated numerals, and sapphire crystal with cyclops magnification.',
      specs: {
        movement: 'Clone Calibre 3235 Automatic',
        case_diameter: '41mm',
        glass: 'Anti-reflective Sapphire Crystal',
        water_resistance: '100m Tested',
        bezel: 'Unidirectional rotating green ceramic'
      },
      mrp: 22000,
      price: 13999,
      primary_image: 'https://images.unsplash.com/photo-1547996160-71dfabb1d0a5?auto=format&fit=crop&w=800&q=80',
      is_hot: true,
      is_bestseller: true,
      is_new_arrival: false,
      is_active: true,
      variants: [
        { variant_type: 'color', name: 'Emerald Green Dial', sku: 'RLX-SUB-GRN-41', stock_quantity: 4, price_delta: 0 },
        { variant_type: 'color', name: 'Onyx Black Dial', sku: 'RLX-SUB-BLK-41', stock_quantity: 8, price_delta: 0 },
        { variant_type: 'edition', name: 'Swiss Superclone Box Set', sku: 'RLX-SUB-SET-BOX', stock_quantity: 2, price_delta: 1200 }
      ]
    },
    {
      title: 'Audemars Piguet Royal Oak Offshore Chronograph 43mm',
      slug: 'audemars-piguet-royal-oak-offshore-43mm',
      brand_id: brandIdMap['audemars-piguet'],
      category_id: catMap['watches'],
      description: 'Mega Tapisserie waffle dial, brushed stainless steel octagonal bezel with 8 hexagonal screws, flyback chronograph sub-dials, and quick-exchange textured rubber strap.',
      specs: {
        movement: 'Calibre 4401 Automatic Chrono',
        case_diameter: '43mm',
        glass: 'Glared Sapphire Crystal',
        water_resistance: '100m'
      },
      mrp: 26000,
      price: 16499,
      primary_image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      is_hot: true,
      is_bestseller: false,
      is_new_arrival: true,
      is_active: true,
      variants: [
        { variant_type: 'color', name: 'Titanium Grey Tapisserie', sku: 'AP-ROO-GRY-43', stock_quantity: 3, price_delta: 0 },
        { variant_type: 'color', name: 'Midnight Blue Dial', sku: 'AP-ROO-BLU-43', stock_quantity: 1, price_delta: 500 }
      ]
    },
    {
      title: 'Travis Scott x Air Jordan 1 Low OG "Reverse Mocha"',
      slug: 'travis-scott-air-jordan-1-low-reverse-mocha',
      brand_id: brandIdMap['travis-scott-nike'],
      category_id: catMap['sneakers'],
      description: 'Top-tier 1:1 UA batch featuring premium nubuck leather underlays, inverted sail Swoosh, red Cactus Jack embroidery on heel tab, and pre-aged vintage midsole finish with 3 lace sets.',
      specs: {
        upper_material: 'Premium Suede Nubuck & Full-grain Leather',
        sole_type: 'Air-cushioned Rubber cupsole',
        inclusions: '3 Extra Waxed Laces + Cactus Jack Special Box'
      },
      mrp: 14000,
      price: 6999,
      primary_image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      is_hot: true,
      is_bestseller: true,
      is_new_arrival: false,
      is_active: true,
      variants: [
        { variant_type: 'size', name: 'UK 7 / US 8', sku: 'TS-AJ1-RVM-UK7', stock_quantity: 6, price_delta: 0 },
        { variant_type: 'size', name: 'UK 8 / US 9', sku: 'TS-AJ1-RVM-UK8', stock_quantity: 11, price_delta: 0 },
        { variant_type: 'size', name: 'UK 9 / US 10', sku: 'TS-AJ1-RVM-UK9', stock_quantity: 2, price_delta: 0 },
        { variant_type: 'size', name: 'UK 10 / US 11', sku: 'TS-AJ1-RVM-UK10', stock_quantity: 1, price_delta: 0 }
      ]
    },
    {
      title: 'Air Jordan 4 Retro "Military Black"',
      slug: 'air-jordan-4-retro-military-black',
      brand_id: brandIdMap['air-jordan'],
      category_id: catMap['sneakers'],
      description: 'Smooth white leather base, neutral grey suede mudguard, black TPU wings and heel counter with visible Nike Air unit. Identical 1:1 silhouette and toe box cut.',
      specs: {
        upper_material: 'Crisp White Leather with Suede Toe Overlay',
        sole_type: 'Polyurethane midsole with visible Air-sole',
        inclusions: 'OG Jordan 4 Box with cement print'
      },
      mrp: 12500,
      price: 6499,
      primary_image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      is_hot: false,
      is_bestseller: true,
      is_new_arrival: false,
      is_active: true,
      variants: [
        { variant_type: 'size', name: 'UK 7', sku: 'AJ4-MIL-BLK-UK7', stock_quantity: 4, price_delta: 0 },
        { variant_type: 'size', name: 'UK 8', sku: 'AJ4-MIL-BLK-UK8', stock_quantity: 5, price_delta: 0 },
        { variant_type: 'size', name: 'UK 9', sku: 'AJ4-MIL-BLK-UK9', stock_quantity: 7, price_delta: 0 },
        { variant_type: 'size', name: 'UK 10', sku: 'AJ4-MIL-BLK-UK10', stock_quantity: 0, price_delta: 0 }
      ]
    },
    {
      title: 'Cartier C Décor Rimless Buffalo Horn Sunglasses',
      slug: 'cartier-c-decor-rimless-buffalo-horn-sunglasses',
      brand_id: brandIdMap['cartier'],
      category_id: catMap['goggles'],
      description: 'Handcrafted natural black horn temples accented with smooth gold-finish C de Cartier hinge hardware. Polarized beveled gradient lenses with UV400 maximum radiation blocking.',
      specs: {
        lens_type: 'Polarized Beveled Gradient Grey',
        frame_material: 'Natural Buffalo Horn & Gold-Plated Alloy',
        uv_protection: '100% UV400 Category 3',
        inclusions: 'Cartier Red Leather Hardcase & Cleaning Cloth'
      },
      mrp: 8500,
      price: 4499,
      primary_image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      is_hot: true,
      is_bestseller: false,
      is_new_arrival: true,
      is_active: true,
      variants: [
        { variant_type: 'color', name: 'Gold Frame / Gradient Grey', sku: 'CRT-CD-GLD-GRY', stock_quantity: 5, price_delta: 0 },
        { variant_type: 'color', name: 'Silver Frame / Ocean Blue', sku: 'CRT-CD-SLV-BLU', stock_quantity: 2, price_delta: 200 }
      ]
    },
    {
      title: 'Prada Symbole Geometric Acetate Sunglasses',
      slug: 'prada-symbole-geometric-acetate-sunglasses',
      brand_id: brandIdMap['prada-eyewear'],
      category_id: catMap['goggles'],
      description: 'Bold rectangular front and faceted chunky temples embossed with the iconic Prada triangle plaque logo. Contemporary high-fashion streetwear statement.',
      specs: {
        lens_type: 'Solid Black UV400 Tint',
        frame_material: 'Ultra-Gloss High-Density Acetate',
        uv_protection: '100% UV400',
        inclusions: 'Prada Triangle Case & Authenticity Card'
      },
      mrp: 7500,
      price: 3899,
      primary_image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      is_hot: false,
      is_bestseller: true,
      is_new_arrival: false,
      is_active: true,
      variants: [
        { variant_type: 'color', name: 'Glossy Black / Dark Grey', sku: 'PRD-SYM-BLK', stock_quantity: 9, price_delta: 0 },
        { variant_type: 'color', name: 'Tortoiseshell / Amber', sku: 'PRD-SYM-TOR', stock_quantity: 3, price_delta: 0 }
      ]
    },
    {
      title: 'Fear of God Essentials Heavyweight Boxy Tee - Applique',
      slug: 'fear-of-god-essentials-heavyweight-boxy-tee',
      brand_id: brandIdMap['essentials-fog'],
      category_id: catMap['tshirts'],
      description: '260 GSM custom 100% combed cotton jersey. Drop-shoulder relaxed boxy silhouette with rubberized back neck badge and velvety raised front chest typography.',
      specs: {
        gsm: '260 GSM',
        fabric: '100% Combed Heavy Cotton',
        fit_type: 'Oversized Boxy Fit',
        neckline: 'Thick Ribbed Crewneck'
      },
      mrp: 3500,
      price: 1899,
      primary_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      is_hot: true,
      is_bestseller: true,
      is_new_arrival: false,
      is_active: true,
      variants: [
        { variant_type: 'size', name: 'Size S (Oversized)', sku: 'FOG-BOX-S', stock_quantity: 14, price_delta: 0 },
        { variant_type: 'size', name: 'Size M (Oversized)', sku: 'FOG-BOX-M', stock_quantity: 20, price_delta: 0 },
        { variant_type: 'size', name: 'Size L (Oversized)', sku: 'FOG-BOX-L', stock_quantity: 15, price_delta: 0 },
        { variant_type: 'size', name: 'Size XL (Oversized)', sku: 'FOG-BOX-XL', stock_quantity: 3, price_delta: 0 }
      ]
    },
    {
      title: 'Represent "Owners Club" Vintage Washed Heavy T-Shirt',
      slug: 'represent-owners-club-vintage-washed-heavy-t-shirt',
      brand_id: brandIdMap['represent-clo'],
      category_id: catMap['tshirts'],
      description: '280 GSM heavyweight loopback jersey treated with individual garment wash process for an authentic vintage hand feel. Cobrax popper on collar and screenprinted graphic on back.',
      specs: {
        gsm: '280 GSM Luxury Pre-shrunk Cotton',
        fabric: 'Vintage Acid Washed',
        fit_type: 'Relaxed Drop Shoulder',
        neckline: 'Metal Cobrax branded collar snap'
      },
      mrp: 3800,
      price: 2199,
      primary_image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      is_hot: false,
      is_bestseller: false,
      is_new_arrival: true,
      is_active: true,
      variants: [
        { variant_type: 'size', name: 'Size S', sku: 'REP-OC-BLK-S', stock_quantity: 7, price_delta: 0 },
        { variant_type: 'size', name: 'Size M', sku: 'REP-OC-BLK-M', stock_quantity: 8, price_delta: 0 },
        { variant_type: 'size', name: 'Size L', sku: 'REP-OC-BLK-L', stock_quantity: 2, price_delta: 0 },
        { variant_type: 'size', name: 'Size XL', sku: 'REP-OC-BLK-XL', stock_quantity: 1, price_delta: 0 }
      ]
    }
  ];

  const seededProductIds = [];

  for (const p of productsToSeed) {
    const { variants, ...prodFields } = p;
    // Check if exists
    let prodId;
    const { data: existing } = await supabase.from('products').select('id').eq('slug', p.slug).maybeSingle();
    if (existing) {
      prodId = existing.id;
    } else {
      const { data: created, error } = await supabase.from('products').insert(prodFields).select().single();
      if (error) {
        console.error(`Error inserting product ${p.title}:`, error.message);
        continue;
      }
      prodId = created.id;
    }

    seededProductIds.push(prodId);

    // Insert variants
    for (const v of variants) {
      const { data: exVar } = await supabase.from('product_variants').select('id').eq('sku', v.sku).maybeSingle();
      if (!exVar) {
        await supabase.from('product_variants').insert({
          product_id: prodId,
          ...v
        });
      }
    }

    // Insert primary image
    const { data: exImg } = await supabase.from('product_images').select('id').eq('product_id', prodId).maybeSingle();
    if (!exImg) {
      await supabase.from('product_images').insert({
        product_id: prodId,
        image_url: p.primary_image,
        is_primary: true,
        sort_order: 1
      });
    }
  }

  console.log(`Products seeded: ${seededProductIds.length}`);

  // Seed Realistic Orders
  const sampleOrders = [
    {
      order_number: 'BH-2026-881023',
      payment_method: 'razorpay',
      payment_status: 'paid',
      order_status: 'delivered',
      subtotal: 13999,
      discount_amount: 500,
      shipping_fee: 0,
      final_total: 13499,
      courier_partner: 'BlueDart',
      tracking_number: 'BD-88992102',
      shipping_address: {
        full_name: 'Vikramaditya Roy',
        phone: '9820145678',
        address_line1: 'B-704, Marvel Imperial, Koregaon Park',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      },
      item_title: 'Rolex Submariner "Hulk" Date 41mm',
      item_variant: 'Emerald Green Dial',
      item_price: 13999,
      item_qty: 1
    },
    {
      order_number: 'BH-2026-881024',
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'shipped',
      subtotal: 6999,
      discount_amount: 0,
      shipping_fee: 150,
      final_total: 7149,
      courier_partner: 'Delhivery',
      tracking_number: 'DEL-99482110',
      shipping_address: {
        full_name: 'Amanpreet Singh',
        phone: '9811223344',
        address_line1: 'House 142, Sector 15-A',
        city: 'Chandigarh',
        state: 'Punjab',
        pincode: '160015'
      },
      item_title: 'Travis Scott x Air Jordan 1 Low OG "Reverse Mocha"',
      item_variant: 'UK 8 / US 9',
      item_price: 6999,
      item_qty: 1
    },
    {
      order_number: 'BH-2026-881025',
      payment_method: 'razorpay',
      payment_status: 'paid',
      order_status: 'confirmed',
      subtotal: 4499,
      discount_amount: 50,
      shipping_fee: 0,
      final_total: 4449,
      courier_partner: 'Xpressbees',
      tracking_number: 'XPB-4402198',
      shipping_address: {
        full_name: 'Rohan Mehra',
        phone: '9873456712',
        address_line1: 'Penthouse 12, Golf Course Road',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002'
      },
      item_title: 'Cartier C Décor Rimless Buffalo Horn Sunglasses',
      item_variant: 'Gold Frame / Gradient Grey',
      item_price: 4499,
      item_qty: 1
    },
    {
      order_number: 'BH-2026-881026',
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'placed',
      subtotal: 1899,
      discount_amount: 0,
      shipping_fee: 150,
      final_total: 2049,
      courier_partner: null,
      tracking_number: null,
      shipping_address: {
        full_name: 'Kabir Singhania',
        phone: '9940123890',
        address_line1: 'Villa 44, Jubilee Hills Road No. 36',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033'
      },
      item_title: 'Fear of God Essentials Heavyweight Boxy Tee',
      item_variant: 'Size L (Oversized)',
      item_price: 1899,
      item_qty: 1
    },
    {
      order_number: 'BH-2026-881027',
      payment_method: 'razorpay',
      payment_status: 'refunded',
      order_status: 'cancelled',
      subtotal: 16499,
      discount_amount: 0,
      shipping_fee: 0,
      final_total: 16499,
      courier_partner: null,
      tracking_number: null,
      shipping_address: {
        full_name: 'Devanshu Verma',
        phone: '9712093845',
        address_line1: 'Tower 4, Flat 1002, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066'
      },
      item_title: 'Audemars Piguet Royal Oak Offshore Chronograph',
      item_variant: 'Titanium Grey Tapisserie',
      item_price: 16499,
      item_qty: 1
    }
  ];

  for (const o of sampleOrders) {
    const { item_title, item_variant, item_price, item_qty, ...orderData } = o;
    const { data: existingOrd } = await supabase.from('orders').select('id').eq('order_number', o.order_number).maybeSingle();
    if (!existingOrd) {
      const { data: newOrd, error } = await supabase.from('orders').insert(orderData).select().single();
      if (!error && newOrd) {
        await supabase.from('order_items').insert({
          order_id: newOrd.id,
          product_id: seededProductIds[0] || null,
          variant_name: item_variant,
          unit_price: item_price,
          quantity: item_qty,
          total_price: item_price * item_qty
        });
      }
    }
  }

  console.log('Orders seeded successfully!');
  console.log('--- Seed Finished ---');
}

seed().catch(console.error);
