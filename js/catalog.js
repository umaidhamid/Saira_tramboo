/* Catalogue helpers: collections, filter options and derived product fields. Loaded after products.js. */
(() => {
  'use strict';
  const NEW_DAYS = 30, BEST_SOLD = 300;

  const collections = [
    { slug: 'new-arrivals', title: 'New Arrivals', eyebrow: 'Just landed', desc: 'The latest silhouettes from the atelier. Fresh colours, considered detailing and pieces made to be worn now.', test: p => p.added <= NEW_DAYS },
    { slug: 'sarees', title: 'Sarees', eyebrow: 'Six yards of grace', desc: 'Silk, chiffon and organza drapes with zari borders and soft pallus, from heirloom weaves to light everyday pieces.', test: p => p.categories.includes('Sarees') },
    { slug: 'suits', title: 'Suits', eyebrow: 'The wardrobe staple', desc: 'Kurta sets and salwar suits cut for comfort and finished by hand. Dressed up or worn easy, they are the pieces you reach for first.', test: p => p.categories.includes('Suits') || p.categories.includes('Salwar Suits') },
    { slug: 'festive', title: 'Festive Edit', eyebrow: 'For the celebrations', desc: 'Rich colour, gold detailing and flattering drape. Made for Eid mornings, family dinners and every gathering in between.', test: p => p.occasion.includes('Festive') },
    { slug: 'wedding', title: 'Wedding Edit', eyebrow: 'For the big day', desc: 'Lehengas, sarees and statement sets for brides, sisters and guests. Embellished, luminous and unforgettable.', test: p => p.occasion.includes('Wedding') },
    { slug: 'sale', title: 'The Sale', eyebrow: 'Considered markdowns', desc: 'Selected pieces from past and present collections at special prices, while sizes last.', test: p => !!p.oldPrice },
    { slug: 'everyday', title: 'Everyday Ethnic', eyebrow: 'Easy elegance', desc: 'Breathable cottons, linens and relaxed cuts for work, errands and long afternoons. Ethnic wear that feels effortless.', test: p => p.occasion.includes('Everyday') || p.occasion.includes('Casual') },
    { slug: 'lehengas', title: 'Lehengas', eyebrow: 'Statement pieces', desc: 'Voluminous skirts, intricate borders and fine choli work, designed to be the centrepiece of the room.', test: p => p.categories.includes('Lehengas') },
    { slug: 'embroidered', title: 'Embroidered Edit', eyebrow: 'Worked by hand', desc: 'Threadwork, zari and delicate floral motifs. Details you notice up close and remember long after.', test: p => p.work.includes('Embroidered') },
  ].map(c => ({ ...c, image: `assets/images/col-${c.slug}.svg` }));

  const discountOf = p => (p.oldPrice ? Math.round((p.oldPrice - p.price) / p.oldPrice * 100) : 0);
  const isNew = p => p.added <= NEW_DAYS;
  const isBest = p => p.sold >= BEST_SOLD;

  window.SR_PRODUCTS.forEach(p => {
    p.discount = discountOf(p);
    p.isNew = isNew(p);
    p.isBest = isBest(p);
    p.category = p.categories[0];
    p.collections = collections.filter(c => c.test(p)).map(c => c.slug);
  });

  const O = (...a) => a;
  const colors = { Black: '#1B1A19', White: '#FAF7F0', Red: '#A3202F', Pink: '#E3A6A8', Blue: '#26407A', Green: '#1F5C46', Yellow: '#D8A526', Maroon: '#6B1F2E', Beige: '#D9C7A8', Brown: '#5A3A2B', Purple: '#5B2A52', Gold: '#C9A45C', Orange: '#B4532A' };

  window.SR_CATALOG = {
    collections,
    featured: [1, 27, 35, 41, 46, 19, 5, 3],
    pageSize: 12,
    facets: {
      cat: { label: 'Category', options: O('Sarees', 'Suits', 'Salwar Suits', 'Anarkali', 'Kurtis', 'Lehengas', 'Sharara Sets', 'Co-ord Sets', 'Dupattas', 'Dresses', 'Bottom Wear', 'New Arrivals', 'Sale'), test: (p, v) => (v === 'New Arrivals' ? p.isNew : v === 'Sale' ? !!p.oldPrice : p.categories.includes(v)) },
      col: { label: 'Collection', options: collections.map(c => [c.slug, c.title]), test: (p, v) => p.collections.includes(v) },
      price: { label: 'Price', options: [['u1000', 'Under ₹1,000', 0, 999], ['1000-2500', '₹1,000 – ₹2,500', 1000, 2500], ['2500-5000', '₹2,500 – ₹5,000', 2500.01, 5000], ['5000-10000', '₹5,000 – ₹10,000', 5000.01, 10000], ['o10000', 'Above ₹10,000', 10000.01, Infinity]], test: (p, v, f) => { const o = f.options.find(x => x[0] === v); return !!o && p.price >= o[2] && p.price <= o[3]; } },
      size: { label: 'Size', options: O('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'), test: (p, v) => p.sizes.includes(v) },
      color: { label: 'Colour', options: Object.keys(colors), swatch: colors, test: (p, v) => p.color === v },
      fabric: { label: 'Fabric', options: O('Cotton', 'Silk', 'Chiffon', 'Georgette', 'Rayon', 'Linen', 'Velvet', 'Organza', 'Chanderi', 'Crepe', 'Net'), test: (p, v) => p.fabric === v },
      occasion: { label: 'Occasion', options: O('Casual', 'Festive', 'Wedding', 'Party', 'Formal', 'Traditional', 'Everyday'), test: (p, v) => p.occasion.includes(v) },
      work: { label: 'Pattern / Work', options: O('Embroidered', 'Printed', 'Plain', 'Floral', 'Zari', 'Sequin', 'Embellished', 'Block Print', 'Handwork'), test: (p, v) => p.work.includes(v) },
      stock: { label: 'Availability', options: [['in', 'In Stock'], ['out', 'Out of Stock']], test: (p, v) => (v === 'in' ? p.inStock : !p.inStock) },
      disc: { label: 'Discount', single: true, options: [['10', '10% and above'], ['20', '20% and above'], ['30', '30% and above'], ['40', '40% and above'], ['50', '50% and above']], test: (p, v) => p.discount >= +v },
      rating: { label: 'Rating', single: true, options: [['4', '4★ & above'], ['3', '3★ & above'], ['2', '2★ & above']], test: (p, v) => p.rating >= +v },
    },
    sorts: [
      ['featured', 'Featured', (a, b) => a.id - b.id],
      ['newest', 'Newest', (a, b) => a.added - b.added],
      ['price-asc', 'Price: Low to High', (a, b) => a.price - b.price],
      ['price-desc', 'Price: High to Low', (a, b) => b.price - a.price],
      ['best', 'Best Selling', (a, b) => b.sold - a.sold],
      ['rating', 'Customer Rating', (a, b) => b.rating - a.rating || b.reviews - a.reviews],
      ['discount', 'Biggest Discount', (a, b) => b.discount - a.discount],
    ],
  };
})();
